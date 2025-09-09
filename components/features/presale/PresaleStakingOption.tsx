'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { PresaleService } from '@/packages/services/presale-simple';
import { DEMO_MODE, RPC_ENDPOINT } from '@/lib/config';
import { Connection, PublicKey } from '@solana/web3.js';
import { useNotifications } from '@/components/ui/NotificationSystem';

interface PresaleStakingOptionProps {
  onStakingComplete?: (stakedAmount: number) => void;
}

const PresaleStakingOption: React.FC<PresaleStakingOptionProps> = ({
  onStakingComplete
}) => {
  const { connected, publicKeyObj, signTransaction } = useWallet();
  const { addNotification } = useNotifications();
  const [stakingAmount, setStakingAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [buyerData, setBuyerData] = useState({
    totalPurchased: 0,
    stakingAmount: 0,
    isStaking: false,
    solSpent: 0,
    usdcSpent: 0
  });

  const connection = new Connection(RPC_ENDPOINT, 'confirmed');
  const presaleService = new PresaleService(connection);

  // Helper function to get staking information directly from the contract
  const getStakingInfo = async (buyer: PublicKey) => {
    try {
      const [buyerPDA] = presaleService.getBuyerPDA(buyer);
      const account = await connection.getAccountInfo(buyerPDA);
      
      if (!account) {
        return { stakingAmount: 0, isStaking: false };
      }

      const data = account.data;
      let offset = 8; // Skip discriminator

      // Skip buyer pubkey (32 bytes)
      offset += 32;
      
      // Skip total_purchased (8 bytes)
      offset += 8;
      
      // Skip total_sol_spent (8 bytes)
      offset += 8;
      
      // Skip total_usdc_spent (8 bytes)
      offset += 8;

      // Read staking_amount (8 bytes)
      const stakingAmount = data.readBigUInt64LE(offset);
      offset += 8;

      // Read is_staking (1 byte)
      const isStaking = data.readUInt8(offset) === 1;

      return {
        stakingAmount: Number(stakingAmount) / 1e9, // Convert to VIBES
        isStaking
      };
    } catch (error) {
      console.error('Error getting staking info:', error);
      return { stakingAmount: 0, isStaking: false };
    }
  };

  useEffect(() => {
    if (connected && publicKeyObj) {
      loadBuyerData();
    } else {
      setDataLoading(false);
      setBuyerData({
        totalPurchased: 0,
        stakingAmount: 0,
        isStaking: false,
        solSpent: 0,
        usdcSpent: 0
      });
    }
  }, [connected, publicKeyObj]);

  const loadBuyerData = async () => {
    if (!connected || !publicKeyObj) return;

    setDataLoading(true);
    try {
      console.log('🔍 Loading real buyer data for staking...');
      const buyerState = await presaleService.getBuyerState(publicKeyObj);
      
      if (buyerState) {
        console.log('✅ Buyer state found:', buyerState);
        
        // Get staking information separately since it's not in the standard BuyerState interface
        const stakingInfo = await getStakingInfo(publicKeyObj);
        
        setBuyerData({
          totalPurchased: buyerState.totalPurchasedVibes, // Already converted in service
          stakingAmount: stakingInfo?.stakingAmount || 0,
          isStaking: stakingInfo?.isStaking || false,
          solSpent: buyerState.solContributed, // Already converted in service
          usdcSpent: buyerState.usdcContributed // Already converted in service
        });
      } else {
        console.log('ℹ️ No buyer state found - user has not purchased yet');
        setBuyerData({
          totalPurchased: 0,
          stakingAmount: 0,
          isStaking: false,
          solSpent: 0,
          usdcSpent: 0
        });
      }
    } catch (error) {
      console.error('❌ Error loading buyer data:', error);
      setBuyerData({
        totalPurchased: 0,
        stakingAmount: 0,
        isStaking: false,
        solSpent: 0,
        usdcSpent: 0
      });
    } finally {
      setDataLoading(false);
    }
  };

  const handleOptIntoStaking = async () => {
    if (!connected || !publicKeyObj || !signTransaction) {
      addNotification({
        type: 'error',
        title: 'Wallet Not Connected',
        message: 'Please connect your wallet to stake tokens',
        duration: 5000
      });
      return;
    }

    const amount = parseFloat(stakingAmount);
    if (isNaN(amount) || amount <= 0) {
      addNotification({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid staking amount',
        duration: 5000
      });
      return;
    }

    const availableToStake = buyerData.totalPurchased - buyerData.stakingAmount;
    if (amount > availableToStake) {
      addNotification({
        type: 'error',
        title: 'Insufficient Balance',
        message: `You can only stake up to ${formatNumber(availableToStake)} VIBES`,
        duration: 5000
      });
      return;
    }

    setLoading(true);
    try {
      console.log(`🥩 Attempting to stake ${amount} VIBES...`);
      
      const signature = await presaleService.optIntoStaking(
        publicKeyObj,
        amount,
        signTransaction
      );

      if (signature) {
        console.log('✅ Staking successful!', signature);
        
        addNotification({
          type: 'success',
          title: 'Staking Successful! 🎉',
          message: `Successfully staked ${formatNumber(amount)} VIBES`,
          duration: 8000
        });
        
        // Refresh buyer data
        await loadBuyerData();
        
        // Call callback if provided
        if (onStakingComplete) {
          onStakingComplete(amount);
        }
        
        setStakingAmount('');
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('❌ Staking error:', error);
      addNotification({
        type: 'error',
        title: 'Staking Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 8000
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(num);
  };

  const formatCurrency = (num: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(num) + ` ${currency}`;
  };

  const availableToStake = buyerData.totalPurchased - buyerData.stakingAmount;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
      {/* Staking Statistics */}
      <div className="production-card">
        <div className="card-header">
          <div className="card-icon">📊</div>
          <div>
            <h3 className="card-title">Staking Overview</h3>
            <p className="card-subtitle">Your staking statistics</p>
          </div>
        </div>

        <div className="card-content">
          {dataLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-primary-1 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading data...</p>
            </div>
          ) : !connected ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h4 className="heading-sm text-white mb-2">Connect Wallet</h4>
              <p className="text-gray-400 text-sm">Connect to view your staking data</p>
            </div>
          ) : (
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{formatNumber(buyerData.totalPurchased)}</span>
                <span className="stat-label">Total Purchased (VIBES)</span>
              </div>
              <div className="stat-item">
                <span className="stat-value text-success">{formatNumber(buyerData.stakingAmount)}</span>
                <span className="stat-label">Currently Staked (VIBES)</span>
                {buyerData.isStaking && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
                    <span className="text-xs text-success">Active</span>
                  </div>
                )}
              </div>
              <div className="stat-item">
                <span className="stat-value text-primary-1">{formatNumber(availableToStake)}</span>
                <span className="stat-label">Available to Stake (VIBES)</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {formatNumber(buyerData.solSpent)} SOL<br/>
                  <span className="text-sm">{formatNumber(buyerData.usdcSpent)} USDC</span>
                </span>
                <span className="stat-label">Total Invested</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Staking Interface */}
      <div className="lg:col-span-1 xl:col-span-2 production-card">
        <div className="card-header">
          <div className="card-icon">🥩</div>
          <div>
            <h3 className="card-title">Stake Your VIBES</h3>
            <p className="card-subtitle">Earn rewards by staking your purchased tokens</p>
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
                  Connect your Solana wallet to stake your VIBES tokens
                </p>
              </div>
              <div className="alert alert-info">
                <span>ℹ️</span>
                Use the wallet button in the header to connect
              </div>
            </div>
          ) : dataLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-2 border-primary-1 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h4 className="heading-md text-white mb-2">Loading Your Data</h4>
              <p className="text-gray-400">Fetching your staking information...</p>
            </div>
          ) : availableToStake > 0 ? (
            <div className="space-y-6">
              <div className="alert alert-success">
                <span>✅</span>
                You have <strong>{formatNumber(availableToStake)} VIBES</strong> available to stake
              </div>

              <div className="form-group">
                <label className="form-label">Amount to Stake (VIBES)</label>
                <div className="input-group">
                  <input
                    type="number"
                    value={stakingAmount}
                    onChange={(e) => setStakingAmount(e.target.value)}
                    placeholder="0.000000"
                    step="0.000001"
                    min="0"
                    max={availableToStake}
                    className="form-input"
                    disabled={loading}
                  />
                  <button
                    onClick={() => setStakingAmount(availableToStake.toString())}
                    className="input-button"
                    disabled={loading}
                  >
                    MAX
                  </button>
                </div>
                <div className="form-help">
                  Maximum available: {formatNumber(availableToStake)} VIBES
                </div>
              </div>

              {stakingAmount && parseFloat(stakingAmount) > 0 && (
                <div className="alert alert-info">
                  <span>🥩</span>
                  You will stake <strong>{formatNumber(parseFloat(stakingAmount))} VIBES</strong> tokens
                </div>
              )}

              <button
                onClick={handleOptIntoStaking}
                disabled={loading || !stakingAmount || parseFloat(stakingAmount) <= 0 || parseFloat(stakingAmount) > availableToStake}
                className={`btn-primary w-full ${loading ? 'btn-loading' : ''}`}
              >
                <span>🥩</span>
                <span>
                  {loading ? 'Processing Staking...' : 'Opt Into Staking'}
                </span>
              </button>
            </div>
          ) : buyerData.totalPurchased > 0 ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <h4 className="heading-md text-white mb-4">All Tokens Staked</h4>
                <p className="body-md text-gray-400">
                  Great job! You have staked all your purchased VIBES tokens and are earning rewards.
                </p>
              </div>
              <div className="alert alert-success">
                <span>🎉</span>
                {formatNumber(buyerData.stakingAmount)} VIBES actively staking
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💰</span>
                </div>
                <h4 className="heading-md text-white mb-4">No VIBES Purchased Yet</h4>
                <p className="body-md text-gray-400 mb-6">
                  Purchase VIBES tokens first to unlock staking rewards
                </p>
              </div>
              <a href="#presale" className="btn-secondary">
                <span>💳</span>
                <span>Go to Presale</span>
              </a>
            </div>
          )}

          {DEMO_MODE && (
            <div className="alert alert-warning mt-6">
              <span>🎭</span>
              Demo Mode: Staking transactions will be simulated
            </div>
          )}
        </div>
      </div>

      {/* Information Cards */}
      <div className="lg:col-span-2 xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* How it Works Card */}
        <div className="production-card">
          <div className="card-header">
            <div className="card-icon">💰</div>
            <div>
              <h3 className="card-title">How Staking Works</h3>
              <p className="card-subtitle">Earn rewards during presale</p>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-1/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-1 text-sm">1</span>
                </div>
                <div>
                  <h5 className="text-white font-semibold mb-1">Purchase VIBES Tokens</h5>
                  <p className="text-gray-400 text-sm">Buy VIBES tokens during the presale period</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-1/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-1 text-sm">2</span>
                </div>
                <div>
                  <h5 className="text-white font-semibold mb-1">Choose Amount to Stake</h5>
                  <p className="text-gray-400 text-sm">Decide how many of your tokens to stake (optional)</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-1/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-1 text-sm">3</span>
                </div>
                <div>
                  <h5 className="text-white font-semibold mb-1">Earn Rewards</h5>
                  <p className="text-gray-400 text-sm">Get proportional rewards based on your stake</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Card */}
        <div className="production-card">
          <div className="card-header">
            <div className="card-icon">🎁</div>
            <div>
              <h3 className="card-title">Staking Benefits</h3>
              <p className="card-subtitle">Why stake your VIBES</p>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-gray-300 text-sm">Additional rewards on top of token appreciation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-gray-300 text-sm">Participate in ecosystem growth</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-gray-300 text-sm">Completely optional - your choice</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-gray-300 text-sm">Maintain full control of your tokens</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-gray-300 text-sm">Proportional reward distribution</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PresaleStakingOption;
