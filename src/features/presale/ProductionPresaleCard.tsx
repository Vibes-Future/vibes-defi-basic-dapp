'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { PresaleService } from '@/services/presale-simple';
import { DEMO_MODE } from '@/lib/config';
import PriceCalendar from './PriceCalendar';

const ProductionPresaleCard: React.FC = () => {
  const { connected, publicKeyObj } = useWallet();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('buy');
  const [paymentMethod, setPaymentMethod] = useState('sol');
  const [amount, setAmount] = useState('');
  const [presaleData, setPresaleData] = useState({
    currentPrice: 0.0598,
    solPrice: 185.5,
    totalRaised: 0,
    progress: 0
  });

  useEffect(() => {
    loadPresaleData();
  }, [connected]);

  const loadPresaleData = async () => {
    if (!connected || DEMO_MODE) {
      // Demo data
      setPresaleData({
        currentPrice: 0.0598,
        solPrice: 185.5,
        totalRaised: 2847.5,
        progress: 35.6
      });
      return;
    }

    try {
      // Real presale data loading would go here
      // const service = new PresaleService();
      // Load real data here
    } catch (error) {
      console.error('Error loading presale data:', error);
    }
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
        alert(`✅ Demo transaction successful! You would receive ${calculateVibesAmount()} VIBES tokens.`);
      } else {
        // Real transaction logic would go here
        // const service = new PresaleService();
        // await service.buyWithSol(...) or similar
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('❌ Transaction failed. Please try again.');
    } finally {
      setLoading(false);
      setAmount('');
    }
  };

  return (
    <section id="presale" className="section-spacing">
      <div className="container-spacing">
        <div className="text-center mb-16">
          <h2 className="heading-xl text-gradient mb-6">
            🚀 VIBES Token Presale
          </h2>
          <p className="body-lg text-gray-300 max-w-3xl mx-auto">
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
                  <span className="progress-value">{presaleData.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${presaleData.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="stat-item">
                <span className="stat-value">${presaleData.totalRaised.toLocaleString()}</span>
                <span className="stat-label">Total Raised</span>
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
