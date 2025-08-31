'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { PresaleService } from '@/services/presale-simple';
import { connection } from '@/lib/solana';
import { requestAirdrop } from '@/lib/solana';

export const ModernPresaleCard: React.FC = () => {
  const { connected, publicKeyObj, signTransaction, updateBalances, solBalance, usdcBalance } = useWallet();
  const [presaleService] = useState(() => new PresaleService(connection));
  
  // Form states
  const [solAmount, setSolAmount] = useState<string>('');
  const [usdcAmount, setUsdcAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'sol' | 'usdc'>('sol');

  // Presale data
  const [currentPrice, setCurrentPrice] = useState<number>(0.0598);
  const [solUsdPrice, setSolUsdPrice] = useState<number>(100);
  const [vibesForSol, setVibesForSol] = useState<number>(0);
  const [vibesForUsdc, setVibesForUsdc] = useState<number>(0);
  const [presaleStats, setPresaleStats] = useState<{
    totalRaisedSol: number;
    totalRaisedUsdc: number;
    isActive: boolean;
    endDate: Date | null;
  } | null>(null);

  // Load presale data on component mount
  useEffect(() => {
    loadPresaleData();
  }, []);

  const loadPresaleData = async () => {
    try {
      const [presaleState, price, solPrice] = await Promise.all([
        presaleService.getPresaleState(),
        presaleService.getCurrentPrice(),
        presaleService.getSolPrice()
      ]);

      if (presaleState) {
        setPresaleStats({
          totalRaisedSol: presaleState.raisedSol / 1000000000,
          totalRaisedUsdc: presaleState.raisedUsdc / 1000000,
          isActive: Date.now() / 1000 >= presaleState.startTs && Date.now() / 1000 <= presaleState.endTs,
          endDate: new Date(presaleState.endTs * 1000)
        });
      }

      setCurrentPrice(price);
      setSolUsdPrice(solPrice);
    } catch (error) {
      console.error('Error loading presale data:', error);
    }
  };

  // Calculate VIBES tokens when amounts change
  useEffect(() => {
    if (solAmount) {
      const sol = parseFloat(solAmount);
      if (!isNaN(sol)) {
        const vibes = presaleService.calculateVibesForSolSync(sol, solUsdPrice);
        setVibesForSol(vibes);
      }
    } else {
      setVibesForSol(0);
    }
  }, [solAmount, solUsdPrice, presaleService]);

  useEffect(() => {
    if (usdcAmount) {
      const usdc = parseFloat(usdcAmount);
      if (!isNaN(usdc)) {
        const vibes = presaleService.calculateVibesForUsdcSync(usdc);
        setVibesForUsdc(vibes);
      }
    } else {
      setVibesForUsdc(0);
    }
  }, [usdcAmount, presaleService]);

  const handleSolAirdrop = async () => {
    if (!publicKeyObj) return;
    
    setLoading(true);
    setStatus('Requesting SOL airdrop...');
    
    try {
      const signature = await requestAirdrop(publicKeyObj, 2);
      if (signature) {
        setStatus('Airdrop successful! 🎉');
        await updateBalances();
      } else {
        setStatus('Airdrop failed ❌');
      }
    } catch (error) {
      console.error('Airdrop error:', error);
      setStatus('Airdrop failed ❌');
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const handleBuyWithSol = async () => {
    if (!connected || !publicKeyObj || !signTransaction) return;
    
    const sol = parseFloat(solAmount);
    if (isNaN(sol) || sol <= 0) {
      setStatus('Please enter a valid SOL amount');
      setTimeout(() => setStatus(''), 3000);
      return;
    }

    if (sol > solBalance) {
      setStatus('Insufficient SOL balance');
      setTimeout(() => setStatus(''), 3000);
      return;
    }

    setLoading(true);
    setStatus('Processing purchase...');

    try {
      const signature = await presaleService.buyWithSol(publicKeyObj, sol, signTransaction);
      if (signature) {
        setStatus(`Purchase successful! 🎉`);
        setSolAmount('');
        await updateBalances();
      } else {
        setStatus('Purchase failed ❌');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setStatus('Purchase failed ❌');
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  const handleBuyWithUsdc = async () => {
    if (!connected || !publicKeyObj || !signTransaction) return;
    
    const usdc = parseFloat(usdcAmount);
    if (isNaN(usdc) || usdc <= 0) {
      setStatus('Please enter a valid USDC amount');
      setTimeout(() => setStatus(''), 3000);
      return;
    }

    if (usdc > usdcBalance) {
      setStatus('Insufficient USDC balance');
      setTimeout(() => setStatus(''), 3000);
      return;
    }

    setLoading(true);
    setStatus('Processing purchase...');

    try {
      const signature = await presaleService.buyWithUsdc(publicKeyObj, usdc, signTransaction);
      if (signature) {
        setStatus(`Purchase successful! 🎉`);
        setUsdcAmount('');
        await updateBalances();
      } else {
        setStatus('Purchase failed ❌');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setStatus('Purchase failed ❌');
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  if (!connected) {
    return (
      <section id="presale" className="py-20">
        <div className="container">
          <div className="card max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-6">🚀</div>
            <h3 className="text-3xl font-heading font-bold text-gradient mb-4">
              VIBES Token Presale
            </h3>
            <p className="text-gray-300 mb-6">
              Connect your wallet to participate in the presale and secure your VIBES tokens at the best price.
            </p>
            <div className="btn btn-primary opacity-75 cursor-not-allowed">
              Connect Wallet to Continue
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="presale" className="py-12 sm:py-16 lg:py-20">
      <div className="container p-mobile sm:p-tablet lg:p-desktop">
        <div className="text-center mb-8 sm:mb-12 px-4 sm:px-0">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-gradient mb-3 sm:mb-4">
            🚀 VIBES Token Presale
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Get in early with VIBES tokens at the presale price. Limited time opportunity to join the future of DeFi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {/* Presale Stats */}
          <div className="card">
            <h3 className="text-xl font-heading font-semibold mb-6 text-gradient">
              📊 Presale Statistics
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-3 bg-primary-5/30 rounded-lg">
                <span className="text-gray-300">VIBES Price</span>
                <span className="font-bold text-primary-1">${currentPrice.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary-5/30 rounded-lg">
                <span className="text-gray-300">SOL Price</span>
                <span className="font-bold text-highlight-1">${solUsdPrice.toFixed(2)}</span>
              </div>
            </div>

            {presaleStats && (
              <div className="space-y-3">
                <div className="text-center p-4 bg-gradient-primary/10 rounded-lg border border-primary-1/20">
                  <div className="text-sm text-gray-400 mb-1">Status</div>
                  <div className={`font-semibold ${presaleStats.isActive ? 'text-success' : 'text-warning'}`}>
                    {presaleStats.isActive ? '🟢 Active' : '🟡 Inactive'}
                  </div>
                </div>
                <div className="text-center p-4 bg-gradient-primary/10 rounded-lg border border-primary-1/20">
                  <div className="text-sm text-gray-400 mb-1">Total Raised</div>
                  <div className="font-semibold text-primary-1">
                    {presaleStats.totalRaisedSol.toFixed(2)} SOL + {presaleStats.totalRaisedUsdc.toFixed(2)} USDC
                  </div>
                </div>
              </div>
            )}

            {/* Devnet Airdrop */}
            <div className="mt-6 p-4 bg-info/10 rounded-lg border border-info/20">
              <h4 className="font-semibold text-info mb-2">💧 Devnet Testing</h4>
              <p className="text-sm text-gray-400 mb-3">Need SOL for testing?</p>
              <button
                onClick={handleSolAirdrop}
                disabled={loading}
                className="btn btn-outline btn-sm w-full"
              >
                {loading ? 'Requesting...' : 'Get 2 SOL Airdrop'}
              </button>
            </div>
          </div>

          {/* Purchase Interface */}
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-xl font-heading font-semibold mb-6 text-gradient">
                💰 Purchase VIBES Tokens
              </h3>

              {/* Tab Navigation */}
              <div className="flex mb-6 bg-primary-5/30 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('sol')}
                  className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                    activeTab === 'sol'
                      ? 'bg-gradient-primary text-primary-4'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  💎 Pay with SOL
                </button>
                <button
                  onClick={() => setActiveTab('usdc')}
                  className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                    activeTab === 'usdc'
                      ? 'bg-gradient-primary text-primary-4'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  💳 Pay with USDC
                </button>
              </div>

              {/* Your Balances */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-primary-5/20 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">SOL Balance</div>
                  <div className="font-bold text-lg">{solBalance.toFixed(4)}</div>
                </div>
                <div className="text-center p-3 bg-primary-5/20 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">USDC Balance</div>
                  <div className="font-bold text-lg">{usdcBalance.toFixed(2)}</div>
                </div>
              </div>

              {/* SOL Purchase Tab */}
              {activeTab === 'sol' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      SOL Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={solAmount}
                        onChange={(e) => setSolAmount(e.target.value)}
                        placeholder="0.1"
                        step="0.01"
                        min="0"
                        className="w-full p-4 bg-primary-5/30 border border-primary-1/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-1 transition-colors"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        SOL
                      </div>
                    </div>
                  </div>

                  {vibesForSol > 0 && (
                    <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-success mb-2">
                          {vibesForSol.toFixed(2)} VIBES
                        </div>
                        <div className="text-sm text-gray-400">
                          Rate: ${(parseFloat(solAmount) * solUsdPrice / vibesForSol).toFixed(4)} per VIBES
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleBuyWithSol}
                    disabled={loading || !solAmount || parseFloat(solAmount) <= 0}
                    className={`btn btn-primary w-full py-4 text-lg ${loading ? 'loading' : ''}`}
                  >
                    {loading ? 'Processing...' : `Buy with ${solAmount || '0'} SOL`}
                  </button>
                </div>
              )}

              {/* USDC Purchase Tab */}
              {activeTab === 'usdc' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      USDC Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={usdcAmount}
                        onChange={(e) => setUsdcAmount(e.target.value)}
                        placeholder="10"
                        step="0.01"
                        min="0"
                        className="w-full p-4 bg-primary-5/30 border border-primary-1/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-1 transition-colors"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        USDC
                      </div>
                    </div>
                  </div>

                  {vibesForUsdc > 0 && (
                    <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-success mb-2">
                          {vibesForUsdc.toFixed(2)} VIBES
                        </div>
                        <div className="text-sm text-gray-400">
                          Rate: ${currentPrice.toFixed(4)} per VIBES
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleBuyWithUsdc}
                    disabled={loading || !usdcAmount || parseFloat(usdcAmount) <= 0}
                    className={`btn btn-primary w-full py-4 text-lg ${loading ? 'loading' : ''}`}
                  >
                    {loading ? 'Processing...' : `Buy with ${usdcAmount || '0'} USDC`}
                  </button>
                </div>
              )}

              {/* Status Message */}
              {status && (
                <div className={`mt-4 p-4 rounded-lg text-center font-medium ${
                  status.includes('successful') || status.includes('🎉')
                    ? 'bg-success/10 border border-success/20 text-success'
                    : status.includes('failed') || status.includes('❌')
                    ? 'bg-error/10 border border-error/20 text-error'
                    : 'bg-info/10 border border-info/20 text-info'
                }`}>
                  {status}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernPresaleCard;
