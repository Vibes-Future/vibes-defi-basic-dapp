'use client';

import React, { useState, useEffect } from 'react';
import { Connection } from '@solana/web3.js';
import { useWallet } from '@/hooks/useWallet';
import { PresaleService } from '@/services/presale-simple';
import { DEMO_MODE, RPC_ENDPOINT } from '@/lib/config';
import { useNotifications, showNotification } from '@/components/ui/NotificationSystem';
import PriceCalendar from './PriceCalendar';

const ProductionPresaleCard: React.FC = () => {
  const { connected, publicKeyObj, signTransaction } = useWallet();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('buy');
  const [paymentMethod, setPaymentMethod] = useState('sol');
  const [amount, setAmount] = useState('');
  const [presaleData, setPresaleData] = useState({
    currentPrice: 0.0598,
    solPrice: 185.5,
    raisedSol: 0,
    raisedUsdc: 0,
    totalRaisedUSD: 0,
    progress: 0
  });

  useEffect(() => {
    loadPresaleData();
    
    // Auto-refresh every 30 seconds for real-time data
    const interval = setInterval(() => {
      loadPresaleData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [connected]);

  const loadPresaleData = async () => {
           if (DEMO_MODE) {
       // Demo data
       setPresaleData({
         currentPrice: 0.0598,
         solPrice: 185.5,
         raisedSol: 15.5,
         raisedUsdc: 2500,
         totalRaisedUSD: 2847.5,
         progress: 35.6
       });
       return;
     }

    try {
      // Load real presale data
      console.log('📊 Loading real presale data...');
      
      // 1. Get real SOL price from CoinGecko
      const solPrice = await getRealSolPrice();
      
      // 2. Get presale state from smart contract
      const connection = new Connection(RPC_ENDPOINT);
      const presaleService = new PresaleService(connection);
      const presaleState = await presaleService.getPresaleState();
      
      if (presaleState) {
        // 3. Calculate current VIBES price based on current time
        const currentVibesPrice = getCurrentVibesPrice(presaleState);
        
                 // 4. Calculate total raised (SOL + USDC converted to USD)
         const raisedSolAmount = presaleState.raisedSol; // Already converted from lamports
         const raisedUsdcAmount = presaleState.raisedUsdc; // Already converted from micro-USDC
         const totalRaisedUSD = (raisedSolAmount * solPrice) + (raisedUsdcAmount * 1); // USDC ≈ $1
         
         // 5. Calculate progress based on time elapsed
         const progressPercent = calculateTimeProgress(presaleState);
         
         setPresaleData({
           currentPrice: currentVibesPrice,
           solPrice: solPrice,
           raisedSol: raisedSolAmount,
           raisedUsdc: raisedUsdcAmount,
           totalRaisedUSD: totalRaisedUSD,
           progress: progressPercent
         });
        
                 console.log('✅ Real presale data loaded:', {
           vibesPrice: currentVibesPrice,
           solPrice: solPrice,
           raisedSol: raisedSolAmount,
           raisedUsdc: raisedUsdcAmount,
           totalRaisedUSD: totalRaisedUSD,
           progress: progressPercent,
           startTs: presaleState.startTs,
           endTs: presaleState.endTs,
           currentTime: Date.now() / 1000
         });
      }
    } catch (error) {
      console.error('Error loading real presale data:', error);
             // Fallback to default values on error
       setPresaleData({
         currentPrice: 0.0598,
         solPrice: 185.5,
         raisedSol: 0,
         raisedUsdc: 0,
         totalRaisedUSD: 0,
         progress: 0
       });
    }
  };

  // Get real SOL price from CoinGecko API
  const getRealSolPrice = async (): Promise<number> => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      const data = await response.json();
      return data.solana.usd;
    } catch (error) {
      console.error('Error fetching SOL price:', error);
      return 185.5; // Fallback price
    }
  };

  // Calculate current VIBES price based on presale schedule
  const getCurrentVibesPrice = (presaleState: any): number => {
    const now = Date.now() / 1000;
    
    // Find the current price tier based on time
    // Since tiers are monthly, we go through them in reverse to find the latest applicable tier
    for (let i = presaleState.priceSchedule.length - 1; i >= 0; i--) {
      const tier = presaleState.priceSchedule[i];
      if (now >= tier.startTs) {
        return tier.priceUsd; // Already in USD
      }
    }
    
    // If no tier found, return the first tier price
    const firstTier = presaleState.priceSchedule[0];
    return firstTier ? firstTier.priceUsd : 0.0598;
  };

  // Calculate progress based on FIXED dates: 1 Sept 2025 - 31 Aug 2026 (365 days)
  const calculateTimeProgress = (presaleState: any): number => {
    const now = Date.now() / 1000;
    
    // FIXED PRESALE DATES - 365 days from Sept 1, 2025
    const presaleStartDate = new Date('2025-09-01T00:00:00Z'); // Sept 1, 2025
    const presaleEndDate = new Date('2026-08-31T23:59:59Z');   // Aug 31, 2026 (365 days)
    
    const startTime = presaleStartDate.getTime() / 1000;
    const endTime = presaleEndDate.getTime() / 1000;
    
    console.log('🕐 FIXED Progress calculation (365 days from Sept 1, 2025):', {
      now: now,
      nowDate: new Date(now * 1000).toISOString(),
      startTime: startTime,
      startDate: presaleStartDate.toISOString(),
      endTime: endTime,
      endDate: presaleEndDate.toISOString(),
      smartContractStartTs: presaleState.startTs,
      smartContractEndTs: presaleState.endTs,
      usingFixedDates: true
    });
    
    // Check if presale hasn't started yet
    if (now < startTime) {
      console.log('🕐 Presale hasn\'t started yet (before Sept 1, 2025)');
      return 0;
    }
    
    // Check if presale has ended
    if (now > endTime) {
      console.log('🕐 Presale has ended (after Aug 31, 2026)');
      return 100;
    }
    
    // Simple calculation: days elapsed / 365 days
    const elapsedSeconds = now - startTime;
    const elapsedDays = Math.floor(elapsedSeconds / 86400); // Complete days only
    const totalDays = 365; // Fixed 365 days
    const progress = (elapsedDays / totalDays) * 100;
    
    console.log('✅ SIMPLE Progress calculation:', {
      elapsedDays: elapsedDays,
      totalDays: totalDays,
      progressFormula: `${elapsedDays} / ${totalDays} = ${progress.toFixed(1)}%`,
      progressFinal: Math.min(Math.max(progress, 0), 100)
    });
    
    return Math.min(Math.max(progress, 0), 100);
  };

  const calculateVibesAmount = () => {
    if (!amount || isNaN(Number(amount))) return '0';
    
    const amountNum = Number(amount);
    if (paymentMethod === 'sol') {
      const vibesAmount = (amountNum * presaleData.solPrice) / presaleData.currentPrice;
      return vibesAmount.toLocaleString('en-US', { maximumFractionDigits: 2 });
    } else {
      const vibesAmount = amountNum / presaleData.currentPrice;
      return vibesAmount.toLocaleString('en-US', { maximumFractionDigits: 2 });
    }
  };

  const handlePurchase = async () => {
    if (!connected || !publicKeyObj || !amount) return;

    setLoading(true);
    try {
      if (DEMO_MODE) {
        // Simulate transaction
        await new Promise(resolve => setTimeout(resolve, 2000));
        addNotification(showNotification.success(
          'Transaction Successful!',
          `You received ${calculateVibesAmount()} VIBES tokens`,
          6000
        ));
      } else {
        // Real transaction logic
        console.log('🚀 Initiating real purchase transaction...');
        
        if (!signTransaction) {
          throw new Error('Wallet does not support transaction signing');
        }

        // Create connection and service
        const connection = new Connection(RPC_ENDPOINT);
        const service = new PresaleService(connection);
        
        let signature: string | null = null;
        const amountNum = Number(amount);
        
        if (paymentMethod === 'sol') {
          console.log('💰 Buying with SOL:', amountNum);
          signature = await service.buyWithSol(publicKeyObj, amountNum, signTransaction);
        } else {
          console.log('💵 Buying with USDC:', amountNum);
          signature = await service.buyWithUsdc(publicKeyObj, amountNum, signTransaction);
        }
        
        if (signature) {
          addNotification(showNotification.success(
            'Transaction Successful!',
            `You received ${calculateVibesAmount()} VIBES tokens. Transaction: ${signature.slice(0, 8)}...`,
            8000
          ));
        } else {
          throw new Error('Transaction failed - no signature returned');
        }
      }
    } catch (error) {
      console.error('Purchase error:', error);
      addNotification(showNotification.error(
        'Transaction Failed',
        error instanceof Error ? error.message : 'Unknown error occurred',
        8000
      ));
    } finally {
      setLoading(false);
      setAmount('');
    }
  };

  return (
    <section id="presale" className="section-spacing">
      <div className="container-spacing">
        <div className="text-center mb-32">
          <h2 className="heading-xl text-gradient mb-8">
            🚀 VIBES Token Presale
          </h2>
          <p className="body-lg text-gray-300 max-w-3xl mx-auto mb-16">
            Join the VIBES ecosystem early with exclusive presale pricing starting September 2025. 
            12-month presale with increasing prices each month - secure your position now!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Presale Statistics */}
          <div className="production-card">
            <div className="card-header">
              <div className="card-icon">📊</div>
              <div>
                <h3 className="card-title">Presale Stats</h3>
                <p className="card-subtitle">Real-time metrics</p>
              </div>
            </div>

            <div className="card-content">
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">${presaleData.currentPrice.toFixed(4)}</span>
                  <span className="stat-label">VIBES Price</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">${presaleData.solPrice.toFixed(2)}</span>
                  <span className="stat-label">SOL Price</span>
                </div>
              </div>

              <div className="progress-container">
                                 <div className="progress-header">
                   <span className="progress-label">Presale Progress</span>
                   <span className="progress-value">{presaleData.progress.toFixed(1)}%</span>
                 </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${presaleData.progress}%` }}
                  ></div>
                </div>
              </div>

                             <div className="stat-item">
                 <span className="stat-value">${presaleData.totalRaisedUSD.toLocaleString()}</span>
                 <span className="stat-label">Total Raised (USD)</span>
               </div>
               <div className="stat-item">
                 <span className="stat-value">{presaleData.raisedSol.toFixed(2)} SOL</span>
                 <span className="stat-label">SOL Liquidity Pool</span>
               </div>
               <div className="stat-item">
                 <span className="stat-value">{presaleData.raisedUsdc.toFixed(0)} USDC</span>
                 <span className="stat-label">USDC Liquidity Pool</span>
               </div>

              {DEMO_MODE && (
                <div className="alert alert-warning">
                  <span>⚠️</span>
                  Demo mode active - transactions are simulated
                </div>
              )}
            </div>
          </div>

          {/* Price Calendar */}
          <div className="production-card">
            <div className="card-header">
              <div className="card-icon">💰</div>
              <div>
                <h3 className="card-title">Price Calendar</h3>
                <p className="card-subtitle">Don&apos;t miss the next increase</p>
              </div>
            </div>
            <div className="card-content">
              <PriceCalendar />
            </div>
          </div>

          {/* Purchase Interface */}
          <div className="lg:col-span-2 xl:col-span-1 production-card">
            <div className="card-header">
              <div className="card-icon">💳</div>
              <div>
                <h3 className="card-title">Purchase VIBES Tokens</h3>
                <p className="card-subtitle">Secure your position in the future of DeFi</p>
              </div>
            </div>

            <div className="card-content">
              {!connected ? (
                <div className="text-center py-12">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">🔒</span>
                    </div>
                    <h4 className="heading-md text-white mb-4">Wallet Connection Required</h4>
                    <p className="body-md text-gray-400">
                      Connect your Solana wallet to participate in the presale
                    </p>
                  </div>
                  <div className="alert alert-info">
                    <span>ℹ️</span>
                    Use the wallet button in the header to connect
                  </div>
                </div>
              ) : (
                <>
                  <div className="tab-container">
                    <div className="tab-nav">
                      <button 
                        className={`tab-button ${activeTab === 'buy' ? 'active' : ''}`}
                        onClick={() => setActiveTab('buy')}
                      >
                        Buy Tokens
                      </button>
                      <button 
                        className={`tab-button ${activeTab === 'calculator' ? 'active' : ''}`}
                        onClick={() => setActiveTab('calculator')}
                      >
                        Calculator
                      </button>
                    </div>

                    <div className="tab-content">
                      {activeTab === 'buy' && (
                        <div className="space-y-6">
                          <div className="form-group">
                            <label className="form-label">Payment Method</label>
                            <div className="payment-method-selector">
                              <button
                                className={`payment-method-option ${
                                  paymentMethod === 'sol' ? 'active sol-active' : ''
                                }`}
                                onClick={() => setPaymentMethod('sol')}
                              >
                                <div className="payment-method-content">
                                  <div className="payment-icon sol-icon">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                      <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="2"/>
                                      <path d="M8 12h16l-2-2H10l-2 2z" fill="currentColor"/>
                                      <path d="M8 20h16l-2 2H10l-2-2z" fill="currentColor"/>
                                      <rect x="8" y="14" width="16" height="4" fill="currentColor"/>
                                    </svg>
                                  </div>
                                  <div className="payment-details">
                                    <div className="payment-name">SOL</div>
                                    <div className="payment-price">${presaleData.solPrice}</div>
                                  </div>
                                  <div className="payment-check">
                                    {paymentMethod === 'sol' && (
                                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor"/>
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              </button>
                              
                              <button
                                className={`payment-method-option ${
                                  paymentMethod === 'usdc' ? 'active usdc-active' : ''
                                }`}
                                onClick={() => setPaymentMethod('usdc')}
                              >
                                <div className="payment-method-content">
                                  <div className="payment-icon usdc-icon">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                      <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
                                      <path d="M16 6c-5.522 0-10 4.478-10 10s4.478 10 10 10 10-4.478 10-10S21.522 6 16 6zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" fill="white"/>
                                      <path d="M16 9c-3.866 0-7 3.134-7 7s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 12c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z" fill="white"/>
                                      <path d="M15 11v2h-1v2h1v2h2v-2h1v-2h-1v-2h-2z" fill="white"/>
                                    </svg>
                                  </div>
                                  <div className="payment-details">
                                    <div className="payment-name">USDC</div>
                                    <div className="payment-price">$1.00</div>
                                  </div>
                                  <div className="payment-check">
                                    {paymentMethod === 'usdc' && (
                                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor"/>
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              </button>
                            </div>
                          </div>

                          <div className="form-group">
                            <label className="form-label">
                              Amount ({paymentMethod.toUpperCase()})
                            </label>
                            <input
                              type="number"
                              className="form-input"
                              placeholder={`Enter ${paymentMethod.toUpperCase()} amount`}
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              step="0.001"
                              min="0"
                            />
                          </div>

                          {amount && (
                            <div className="alert alert-success">
                              <span>✅</span>
                              You will receive approximately <strong>{calculateVibesAmount()} VIBES</strong> tokens
                            </div>
                          )}

                          <button
                            className={`btn-primary w-full ${loading ? 'btn-loading' : ''}`}
                            onClick={handlePurchase}
                            disabled={!amount || loading}
                          >
                            <span>{paymentMethod === 'sol' ? '◎' : '💵'}</span>
                            <span>
                              {loading ? 'Processing...' : `Buy with ${paymentMethod.toUpperCase()}`}
                            </span>
                          </button>
                        </div>
                      )}

                      {activeTab === 'calculator' && (
                        <div className="space-y-6">
                          <div className="text-center">
                            <h4 className="heading-md text-white mb-4">Price Calculator</h4>
                            <p className="body-md text-gray-400">
                              Calculate how many VIBES tokens you can get
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="stat-item text-center">
                              <span className="stat-value">
                                {paymentMethod === 'sol' 
                                  ? (presaleData.solPrice / presaleData.currentPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })
                                  : (1 / presaleData.currentPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })
                                }
                              </span>
                              <span className="stat-label">
                                VIBES per {paymentMethod.toUpperCase()}
                              </span>
                            </div>
                            <div className="stat-item text-center">
                              <span className="stat-value">${presaleData.currentPrice.toFixed(4)}</span>
                              <span className="stat-label">Current VIBES Price</span>
                            </div>
                          </div>

                          <div className="alert alert-info">
                            <span>💡</span>
                            Early presale participants get the best price before public launch
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductionPresaleCard;
