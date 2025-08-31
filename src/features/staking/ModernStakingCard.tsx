'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { StakingService, UserStake, StakePool } from '@/services/staking';
import { connection } from '@/lib/solana';
import { DEMO_MODE } from '@/lib/config';

const ModernStakingCard: React.FC = () => {
  const { connected, publicKeyObj } = useWallet();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake' | 'rewards'>('stake');
  const [amount, setAmount] = useState('');
  
  // Staking data - simplified for clean UI
  const [stakingData, setStakingData] = useState({
    availableVibes: 0,
    stakedAmount: 0,
    pendingRewards: 0,
    apy: 40,
    totalStaked: 1250000,
    totalStakers: 342
  });

  useEffect(() => {
    loadStakingData();
  }, [connected]);

  const loadStakingData = async () => {
    if (DEMO_MODE || !connected) {
      // Demo data for UI showcase
      setStakingData({
        availableVibes: 1000,
        stakedAmount: 2500,
        pendingRewards: 12.5,
        apy: 40,
        totalStaked: 1250000,
        totalStakers: 342
      });
      return;
    }

    try {
      // Real staking data loading would go here
      // Load actual staking data from smart contract
    } catch (error) {
      console.error('Error loading staking data:', error);
    }
  };

  const handleStake = async () => {
    if (!amount || isNaN(Number(amount))) return;
    
    setLoading(true);
    try {
      if (DEMO_MODE) {
        // Demo simulation
        await new Promise(resolve => setTimeout(resolve, 2000));
        setStakingData(prev => ({
          ...prev,
          stakedAmount: prev.stakedAmount + Number(amount),
          availableVibes: prev.availableVibes - Number(amount)
        }));
        setAmount('');
      } else {
        // Real staking logic would go here
      }
    } catch (error) {
      console.error('Staking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!amount || isNaN(Number(amount))) return;
    
    setLoading(true);
    try {
      if (DEMO_MODE) {
        // Demo simulation
        await new Promise(resolve => setTimeout(resolve, 2000));
        setStakingData(prev => ({
          ...prev,
          stakedAmount: prev.stakedAmount - Number(amount),
          availableVibes: prev.availableVibes + Number(amount)
        }));
        setAmount('');
      } else {
        // Real unstaking logic would go here
      }
    } catch (error) {
      console.error('Unstaking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    setLoading(true);
    try {
      if (DEMO_MODE) {
        // Demo simulation
        await new Promise(resolve => setTimeout(resolve, 2000));
        setStakingData(prev => ({
          ...prev,
          availableVibes: prev.availableVibes + prev.pendingRewards,
          pendingRewards: 0
        }));
      } else {
        // Real rewards claiming logic would go here
      }
    } catch (error) {
      console.error('Claim rewards error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {/* Staking Statistics */}
      <div className="production-card">
        <div className="card-header">
          <div className="card-icon">🥩</div>
          <div>
            <h3 className="card-title">Staking Pool</h3>
            <p className="card-subtitle">Earn passive rewards</p>
          </div>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="stat-item">
              <div className="stat-label">Total Staked</div>
              <div className="stat-value">{formatNumber(stakingData.totalStaked, 0)} VIBES</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Active Stakers</div>
              <div className="stat-value">{stakingData.totalStakers}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Current APY</div>
              <div className="stat-value text-green-400">{stakingData.apy}%</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Your Stake</div>
              <div className="stat-value">{formatNumber(stakingData.stakedAmount)} VIBES</div>
            </div>
          </div>

          {DEMO_MODE && (
            <div className="demo-notice">
              <span className="demo-badge">DEMO</span>
              <span>Simulated staking data for testing</span>
            </div>
          )}
        </div>
      </div>

      {/* Your Staking Dashboard */}
      <div className="production-card">
        <div className="card-header">
          <div className="card-icon">💎</div>
          <div>
            <h3 className="card-title">Your Dashboard</h3>
            <p className="card-subtitle">Manage your stake</p>
          </div>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="balance-item">
              <div className="balance-label">Available VIBES</div>
              <div className="balance-value">{formatNumber(stakingData.availableVibes)}</div>
            </div>
            <div className="balance-item">
              <div className="balance-label">Staked Amount</div>
              <div className="balance-value">{formatNumber(stakingData.stakedAmount)}</div>
            </div>
            <div className="balance-item">
              <div className="balance-label">Pending Rewards</div>
              <div className="balance-value text-green-400">{formatNumber(stakingData.pendingRewards)}</div>
            </div>
          </div>

          {stakingData.pendingRewards > 0 && (
            <button
              onClick={handleClaimRewards}
              disabled={loading || !connected}
              className="action-button secondary mb-4 w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="spinner"></div>
                  <span>Claiming...</span>
                </div>
              ) : (
                `🎁 Claim ${formatNumber(stakingData.pendingRewards)} VIBES`
              )}
            </button>
          )}
        </div>
      </div>

      {/* Staking Interface */}
      <div className="lg:col-span-2 xl:col-span-1 production-card">
        <div className="card-header">
          <div className="card-icon">⚡</div>
          <div>
            <h3 className="card-title">Stake & Earn</h3>
            <p className="card-subtitle">Start earning {stakingData.apy}% APY</p>
          </div>
        </div>
        <div className="card-content">
          {/* Tab Navigation */}
          <div className="tab-navigation mb-6">
            <button
              onClick={() => setActiveTab('stake')}
              className={`tab-button ${activeTab === 'stake' ? 'active' : ''}`}
            >
              🔒 Stake
            </button>
            <button
              onClick={() => setActiveTab('unstake')}
              className={`tab-button ${activeTab === 'unstake' ? 'active' : ''}`}
            >
              🔓 Unstake
            </button>
          </div>

          {/* Stake Tab */}
          {activeTab === 'stake' && (
            <div className="staking-form">
              <div className="form-group mb-4">
                <label className="form-label">Amount to Stake</label>
                <div className="input-group">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="form-input"
                    disabled={loading || !connected}
                  />
                  <span className="input-suffix">VIBES</span>
                </div>
                <div className="form-help">
                  Available: {formatNumber(stakingData.availableVibes)} VIBES
                </div>
              </div>

              <div className="quick-amount-buttons mb-4">
                <button
                  onClick={() => setAmount((stakingData.availableVibes * 0.25).toString())}
                  className="quick-amount-btn"
                  disabled={loading || !connected}
                >
                  25%
                </button>
                <button
                  onClick={() => setAmount((stakingData.availableVibes * 0.5).toString())}
                  className="quick-amount-btn"
                  disabled={loading || !connected}
                >
                  50%
                </button>
                <button
                  onClick={() => setAmount((stakingData.availableVibes * 0.75).toString())}
                  className="quick-amount-btn"
                  disabled={loading || !connected}
                >
                  75%
                </button>
                <button
                  onClick={() => setAmount(stakingData.availableVibes.toString())}
                  className="quick-amount-btn"
                  disabled={loading || !connected}
                >
                  MAX
                </button>
              </div>

              <button
                onClick={handleStake}
                disabled={loading || !connected || !amount || Number(amount) <= 0}
                className="action-button primary w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="spinner"></div>
                    <span>Staking...</span>
                  </div>
                ) : connected ? (
                  `🔒 Stake ${amount ? formatNumber(Number(amount)) : '0'} VIBES`
                ) : (
                  '🔗 Connect Wallet to Stake'
                )}
              </button>
            </div>
          )}

          {/* Unstake Tab */}
          {activeTab === 'unstake' && (
            <div className="staking-form">
              <div className="form-group mb-4">
                <label className="form-label">Amount to Unstake</label>
                <div className="input-group">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="form-input"
                    disabled={loading || !connected}
                  />
                  <span className="input-suffix">VIBES</span>
                </div>
                <div className="form-help">
                  Staked: {formatNumber(stakingData.stakedAmount)} VIBES
                </div>
              </div>

              <div className="quick-amount-buttons mb-4">
                <button
                  onClick={() => setAmount((stakingData.stakedAmount * 0.25).toString())}
                  className="quick-amount-btn"
                  disabled={loading || !connected}
                >
                  25%
                </button>
                <button
                  onClick={() => setAmount((stakingData.stakedAmount * 0.5).toString())}
                  className="quick-amount-btn"
                  disabled={loading || !connected}
                >
                  50%
                </button>
                <button
                  onClick={() => setAmount((stakingData.stakedAmount * 0.75).toString())}
                  className="quick-amount-btn"
                  disabled={loading || !connected}
                >
                  75%
                </button>
                <button
                  onClick={() => setAmount(stakingData.stakedAmount.toString())}
                  className="quick-amount-btn"
                  disabled={loading || !connected}
                >
                  MAX
                </button>
              </div>

              <button
                onClick={handleUnstake}
                disabled={loading || !connected || !amount || Number(amount) <= 0}
                className="action-button secondary w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="spinner"></div>
                    <span>Unstaking...</span>
                  </div>
                ) : connected ? (
                  `🔓 Unstake ${amount ? formatNumber(Number(amount)) : '0'} VIBES`
                ) : (
                  '🔗 Connect Wallet to Unstake'
                )}
              </button>

              {stakingData.stakedAmount > 0 && (
                <div className="info-box mt-4">
                  <p className="text-sm text-gray-300">
                    💡 <strong>Tip:</strong> Unstaking will forfeit any unclaimed rewards. 
                    Consider claiming rewards first!
                  </p>
                </div>
              )}
            </div>
          )}

          {!connected && (
            <div className="connect-prompt">
              <p className="text-center text-gray-400">
                Connect your wallet to start staking and earning rewards
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernStakingCard;