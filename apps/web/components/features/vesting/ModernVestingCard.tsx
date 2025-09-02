'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { VestingService, VestingSchedule } from '@/services/vesting';
import { PresaleService } from '@/services/presale-simple';
import { connection } from '@/lib/solana';
import { DEMO_MODE, RPC_ENDPOINT } from '@/lib/config';
import { Connection } from '@solana/web3.js';

const ModernVestingCard: React.FC = () => {
  const { connected, publicKeyObj } = useWallet();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'view' | 'create'>('view');
  const [beneficiaryAddress, setBeneficiaryAddress] = useState('');
  const [createAmount, setCreateAmount] = useState('');
  
  // Vesting data - simplified for clean UI
  const [vestingData, setVestingData] = useState({
    totalLocked: 5000,
    totalClaimed: 1250,
    claimableNow: 416.67,
    nextUnlock: new Date('2026-09-01T00:00:00.000Z'),
    progressPercent: 25,
    monthlyRelease: 416.67,
    cliffEnded: true,
    totalSchedules: 2,
    // Additional properties for anticipated vesting
    immediateRelease: 0,
    isAnticipated: false,
    purchasedAmount: 0,
    estimatedRewards: 0
  });

  useEffect(() => {
    loadVestingData();
  }, [connected]);

  const loadVestingData = async () => {
    if (DEMO_MODE || !connected) {
      // Demo data for UI showcase
      setVestingData({
        totalLocked: 5000,
        totalClaimed: 1250,
        claimableNow: 416.67,
        nextUnlock: new Date('2026-09-01T00:00:00.000Z'),
        progressPercent: 25,
        monthlyRelease: 416.67,
        cliffEnded: true,
        totalSchedules: 2,
        immediateRelease: 2000,
        isAnticipated: false,
        purchasedAmount: 3000,
        estimatedRewards: 2000
      });
      return;
    }

    try {
      // Load actual vesting data from smart contract
      if (!publicKeyObj) return;
      
      const vestingService = new VestingService(connection);
      const schedule = await vestingService.getVestingSchedule(publicKeyObj);
      
      if (schedule) {
        // Calculate claimable amount (12-month linear vesting)
        const now = Date.now() / 1000;
        const vestingDuration = 12 * 30 * 24 * 60 * 60; // 12 months in seconds
        const elapsedTime = Math.max(0, now - schedule.listingTs);
        const vestingProgress = Math.min(1, elapsedTime / vestingDuration);
        
        const totalVestable = schedule.totalAmount / 1_000_000; // Convert from lamports to VIBES
        const vestedAmount = totalVestable * vestingProgress;
        const claimedAmount = schedule.claimedAmount / 1_000_000;
        const claimableNow = Math.max(0, vestedAmount - claimedAmount);
        
        // Calculate next unlock (monthly releases)
        const monthlyRelease = totalVestable / 12;
        const nextUnlockTime = schedule.listingTs + Math.ceil(elapsedTime / (30 * 24 * 60 * 60)) * 30 * 24 * 60 * 60;
        
        setVestingData({
          totalLocked: totalVestable,
          totalClaimed: claimedAmount,
          claimableNow: claimableNow,
          nextUnlock: new Date(nextUnlockTime * 1000),
          progressPercent: Math.round(vestingProgress * 100),
          monthlyRelease: monthlyRelease,
          cliffEnded: elapsedTime > 0,
          totalSchedules: 1,
          immediateRelease: 0, // Real vesting doesn't have immediate release concept
          isAnticipated: false, // This is real vesting data
          purchasedAmount: 0,
          estimatedRewards: 0
        });
      } else {
        // No vesting schedule found - Show anticipated vesting based on presale purchases
        try {
          const rpcConnection = new Connection(RPC_ENDPOINT);
          const presaleService = new PresaleService(rpcConnection);
          const buyerState = await presaleService.getBuyerState(publicKeyObj);
          
          if (buyerState && buyerState.totalPurchasedVibes > 0) {
            // Calculate anticipated vesting amounts
            const totalPurchased = buyerState.totalPurchasedVibes;
            
            // Calculate estimated pending rewards (simplified calculation)
            // This would normally use the calculatePendingRewards function from PresaleService
            const timeNow = Date.now() / 1000;
            const timeSinceLastUpdate = Math.max(0, timeNow - buyerState.lastUpdateTs);
            const secondsInYear = 365 * 24 * 60 * 60;
            const apyRate = 0.40; // 40% APY
            const estimatedPendingRewards = (totalPurchased * apyRate * timeSinceLastUpdate) / secondsInYear;
            
            const totalAccumulatedRewards = buyerState.accumulatedRewards + estimatedPendingRewards;
            const totalForVesting = totalPurchased + totalAccumulatedRewards; // Total that will go to vesting
            
            // Vesting schedule: 40% immediate, 60% over 12 months
            const immediateRelease = totalForVesting * 0.4; // 40% on listing
            const vestedAmount = totalForVesting * 0.6; // 60% to be vested
            const monthlyRelease = vestedAmount / 12; // Monthly release over 12 months
            
            // Estimated listing date (for demo purposes - could be configurable)
            const estimatedListingDate = new Date();
            estimatedListingDate.setMonth(estimatedListingDate.getMonth() + 2); // Assume 2 months from now
            
            setVestingData({
              totalLocked: totalForVesting, // Total that will be locked (purchased + rewards)
              totalClaimed: 0, // Nothing claimed yet
              claimableNow: 0, // Nothing claimable during presale
              nextUnlock: estimatedListingDate, // Estimated listing date
              progressPercent: 0, // 0% until listing
              monthlyRelease: monthlyRelease,
              cliffEnded: false, // Cliff hasn't started yet
              totalSchedules: 1,
              // Additional info for display
              immediateRelease: immediateRelease,
              isAnticipated: true, // Flag to show this is anticipated data
              purchasedAmount: totalPurchased,
              estimatedRewards: totalAccumulatedRewards
            });
          } else {
            // No presale purchases either
            setVestingData({
              totalLocked: 0,
              totalClaimed: 0,
              claimableNow: 0,
              nextUnlock: new Date(),
              progressPercent: 0,
              monthlyRelease: 0,
              cliffEnded: false,
              totalSchedules: 0,
              immediateRelease: 0,
              isAnticipated: false,
              purchasedAmount: 0,
              estimatedRewards: 0
            });
          }
        } catch (presaleError) {
          console.error('Error loading presale data for vesting anticipation:', presaleError);
          // Fallback to zero values
          setVestingData({
            totalLocked: 0,
            totalClaimed: 0,
            claimableNow: 0,
            nextUnlock: new Date(),
            progressPercent: 0,
            monthlyRelease: 0,
            cliffEnded: false,
            totalSchedules: 0,
            immediateRelease: 0,
            isAnticipated: false,
            purchasedAmount: 0,
            estimatedRewards: 0
          });
        }
      }
    } catch (error) {
      console.error('Error loading vesting data:', error);
      // Fallback to zero values on error
      setVestingData({
        totalLocked: 0,
        totalClaimed: 0,
        claimableNow: 0,
        nextUnlock: new Date(),
        progressPercent: 0,
        monthlyRelease: 0,
        cliffEnded: false,
        totalSchedules: 0,
        immediateRelease: 0,
        isAnticipated: false,
        purchasedAmount: 0,
        estimatedRewards: 0
      });
    }
  };

  const handleClaim = async () => {
    setLoading(true);
    try {
      if (DEMO_MODE) {
        // Demo simulation
        await new Promise(resolve => setTimeout(resolve, 2000));
        setVestingData(prev => ({
          ...prev,
          totalClaimed: prev.totalClaimed + prev.claimableNow,
          claimableNow: 0
        }));
      } else {
        // Real claiming logic would require wallet signing integration
        if (!publicKeyObj) throw new Error('Wallet not connected');
        
        // For now, just show that claiming is not yet implemented in production
        console.log('Claiming functionality will be implemented when needed');
        
        // The transaction would need proper wallet integration for signing
        // await vestingService.claim(publicKeyObj, signTransaction);
        
        // Reload data after claiming
        await loadVestingData();
      }
    } catch (error) {
      console.error('Claim error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    if (!createAmount || !beneficiaryAddress) return;
    
    setLoading(true);
    try {
      if (DEMO_MODE) {
        // Demo simulation
        await new Promise(resolve => setTimeout(resolve, 2000));
        setVestingData(prev => ({
          ...prev,
          totalSchedules: prev.totalSchedules + 1
        }));
        setCreateAmount('');
        setBeneficiaryAddress('');
      } else {
        // Real schedule creation logic would go here
      }
    } catch (error) {
      console.error('Create schedule error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    // For very large numbers, use abbreviated format
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1) + 'B';
    } else if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + 'M';
    } else if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + 'K';
    }
    
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatNumberFull = (num: number, decimals: number = 0) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Simplified Your Dashboard */}
      <div className="production-card">
        <div className="card-header">
          <div className="card-icon">💎</div>
          <div>
            <h3 className="card-title">Your Dashboard</h3>
            <p className="card-subtitle">Track your presale activity and vesting schedule</p>
          </div>
        </div>
        <div className="card-content">
          
          {!DEMO_MODE && vestingData.isAnticipated && vestingData.purchasedAmount > 0 ? (
            // Real data from presale
            <div className="vesting-dashboard">
              {/* Key Stats */}
              <div className="dashboard-stats">
                <div className="stat-row">
                  <div className="stat-info">
                    <span className="stat-icon">🛒</span>
                    <div>
                      <div className="stat-label">Presale Purchases</div>
                      <div className="stat-value">{formatNumber(vestingData.purchasedAmount, 0)} VIBES</div>
                    </div>
                  </div>
                </div>
                
                <div className="stat-row">
                  <div className="stat-info">
                    <span className="stat-icon">⚡</span>
                    <div>
                      <div className="stat-label">Staking Rewards Earned</div>
                      <div className="stat-value text-green-400">{formatNumber(vestingData.estimatedRewards, 0)} VIBES</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Withdrawal Schedule */}
              <div className="withdrawal-schedule">
                <h4 className="schedule-title">💰 Withdrawal Schedule</h4>
                
                <div className="withdrawal-item">
                  <div className="withdrawal-percent">40%</div>
                  <div className="withdrawal-details">
                    <div className="withdrawal-label">First Withdrawal</div>
                    <div className="withdrawal-amount">{formatNumber(vestingData.immediateRelease, 0)} VIBES</div>
                    <div className="withdrawal-when">Available at token listing</div>
                  </div>
                </div>
                
                <div className="withdrawal-item">
                  <div className="withdrawal-percent">60%</div>
                  <div className="withdrawal-details">
                    <div className="withdrawal-label">Monthly Withdrawals</div>
                    <div className="withdrawal-amount">{formatNumber(vestingData.monthlyRelease, 0)} VIBES/month</div>
                    <div className="withdrawal-when">12 monthly releases after listing</div>
                  </div>
                </div>
              </div>


            </div>
          ) : !DEMO_MODE ? (
            // No presale activity
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h4 className="empty-title">No Presale Activity</h4>
              <p className="empty-message">Purchase tokens during presale to see your vesting schedule here.</p>
            </div>
          ) : (
            // Demo mode
            <div className="demo-notice">
              <span className="demo-badge">DEMO</span>
              <span>Connect wallet to see real vesting data</span>
            </div>
          )}

        </div>
      </div>

      {/* Claimable Tokens - Only shown in demo mode */}
      {DEMO_MODE && (
        <div className="production-card">
        <div className="card-header">
          <div className="card-icon">💎</div>
          <div>
            <h3 className="card-title">Available to Claim</h3>
            <p className="card-subtitle">Unlock your tokens</p>
          </div>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="balance-item">
              <div className="balance-label">Claimable Now</div>
              <div className="balance-value text-green-400">{formatNumber(vestingData.claimableNow)} VIBES</div>
            </div>
            <div className="balance-item">
              <div className="balance-label">Next Unlock</div>
              <div className="balance-value">{formatDate(vestingData.nextUnlock)}</div>
            </div>
            <div className="balance-item">
              <div className="balance-label">Monthly Release</div>
              <div className="balance-value">{formatNumber(vestingData.monthlyRelease)} VIBES</div>
            </div>
          </div>

          {vestingData.claimableNow > 0 && (
            <button
              onClick={handleClaim}
              disabled={loading || !connected}
              className="action-button primary w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="spinner"></div>
                  <span>Claiming...</span>
                </div>
              ) : (
                `🎁 Claim ${formatNumber(vestingData.claimableNow)} VIBES`
              )}
            </button>
          )}

          {vestingData.claimableNow === 0 && (
            <div className="info-box">
              <p className="text-sm">
                💡 No tokens available to claim right now. 
                Next unlock: <strong>{formatDate(vestingData.nextUnlock)}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Vesting Management - Hidden during presale */}
      {DEMO_MODE && (
        <div className="lg:col-span-2 xl:col-span-1 production-card">
        <div className="card-header">
          <div className="card-icon">⚙️</div>
          <div>
            <h3 className="card-title">Vesting Management</h3>
            <p className="card-subtitle">Create new schedules</p>
          </div>
        </div>
        <div className="card-content">
          {/* Tab Navigation */}
          <div className="tab-navigation mb-6">
            <button
              onClick={() => setActiveTab('view')}
              className={`tab-button ${activeTab === 'view' ? 'active' : ''}`}
            >
              📊 View Schedules
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
            >
              ➕ Create Schedule
            </button>
          </div>

          {/* View Tab */}
          {activeTab === 'view' && (
            <div className="schedules-view">
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div className="schedule-item">
                  <div className="schedule-header">
                    <span className="schedule-title">Personal Vesting</span>
                    <span className="schedule-status active">Active</span>
                  </div>
                  <div className="schedule-details">
                    <div className="schedule-detail">
                      <span>Total Amount:</span>
                      <span>3,000 VIBES</span>
                    </div>
                    <div className="schedule-detail">
                      <span>Claimed:</span>
                      <span>750 VIBES</span>
                    </div>
                    <div className="schedule-detail">
                      <span>Remaining:</span>
                      <span>2,250 VIBES</span>
                    </div>
                  </div>
                </div>

                <div className="schedule-item">
                  <div className="schedule-header">
                    <span className="schedule-title">Team Allocation</span>
                    <span className="schedule-status active">Active</span>
                  </div>
                  <div className="schedule-details">
                    <div className="schedule-detail">
                      <span>Total Amount:</span>
                      <span>2,000 VIBES</span>
                    </div>
                    <div className="schedule-detail">
                      <span>Claimed:</span>
                      <span>500 VIBES</span>
                    </div>
                    <div className="schedule-detail">
                      <span>Remaining:</span>
                      <span>1,500 VIBES</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="summary-stats">
                <p className="text-center text-gray-300">
                  📈 Total Active Schedules: <strong>{vestingData.totalSchedules}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Create Tab */}
          {activeTab === 'create' && (
            <div className="create-form">
              <div className="form-group mb-4">
                <label className="form-label">Beneficiary Address</label>
                <input
                  type="text"
                  value={beneficiaryAddress}
                  onChange={(e) => setBeneficiaryAddress(e.target.value)}
                  placeholder="Enter Solana wallet address"
                  className="form-input"
                  disabled={loading || !connected}
                />
                <div className="form-help">
                  The wallet address that will receive the vested tokens
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Total Amount</label>
                <div className="input-group">
                  <input
                    type="number"
                    value={createAmount}
                    onChange={(e) => setCreateAmount(e.target.value)}
                    placeholder="0.00"
                    className="form-input"
                    disabled={loading || !connected}
                  />
                  <span className="input-suffix">VIBES</span>
                </div>
                <div className="form-help">
                  Total tokens to be vested over time
                </div>
              </div>

              <div className="vesting-terms mb-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Vesting Terms</h4>
                <div className="terms-grid">
                  <div className="term-item">
                    <span>Cliff Period:</span>
                    <span>6 months</span>
                  </div>
                  <div className="term-item">
                    <span>Vesting Duration:</span>
                    <span>12 months</span>
                  </div>
                  <div className="term-item">
                    <span>Release Schedule:</span>
                    <span>Monthly</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateSchedule}
                disabled={loading || !connected || !createAmount || !beneficiaryAddress}
                className="action-button primary w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="spinner"></div>
                    <span>Creating...</span>
                  </div>
                ) : connected ? (
                  `⚙️ Create Vesting Schedule`
                ) : (
                  '🔗 Connect Wallet to Create'
                )}
              </button>

              <div className="info-box mt-4">
                <p className="text-sm">
                  💡 <strong>Note:</strong> Vesting schedules include a 6-month cliff period 
                  followed by monthly releases over 12 months.
                </p>
              </div>
            </div>
          )}

          {!connected && (
            <div className="connect-prompt">
              <p className="text-center text-gray-400">
                Connect your wallet to manage vesting schedules
              </p>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default ModernVestingCard;