'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { VestingService, VestingSchedule } from '@/services/vesting';
import { connection } from '@/lib/solana';
import { DEMO_MODE } from '@/lib/config';

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
    nextUnlock: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    progressPercent: 25,
    monthlyRelease: 416.67,
    cliffEnded: true,
    totalSchedules: 2
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
        nextUnlock: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        progressPercent: 25,
        monthlyRelease: 416.67,
        cliffEnded: true,
        totalSchedules: 2
      });
      return;
    }

    try {
      // Real vesting data loading would go here
      // Load actual vesting data from smart contract
    } catch (error) {
      console.error('Error loading vesting data:', error);
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
        // Real claiming logic would go here
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
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
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
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {/* Vesting Overview */}
      <div className="production-card">
        <div className="card-header">
          <div className="card-icon">⏰</div>
          <div>
            <h3 className="card-title">Vesting Overview</h3>
            <p className="card-subtitle">Track your locked tokens</p>
          </div>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="stat-item">
              <div className="stat-label">Total Locked</div>
              <div className="stat-value">{formatNumber(vestingData.totalLocked, 0)} VIBES</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Already Claimed</div>
              <div className="stat-value text-green-400">{formatNumber(vestingData.totalClaimed, 0)} VIBES</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Vesting Progress</div>
              <div className="stat-value">{vestingData.progressPercent}%</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="vesting-progress mb-4">
            <div className="progress-header">
              <span className="text-sm text-gray-300">Unlocked</span>
              <span className="text-sm text-gray-300">{vestingData.progressPercent}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${vestingData.progressPercent}%` }}
              ></div>
            </div>
          </div>

          {DEMO_MODE && (
            <div className="demo-notice">
              <span className="demo-badge">DEMO</span>
              <span>Simulated vesting data for testing</span>
            </div>
          )}
        </div>
      </div>

      {/* Claimable Tokens */}
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

      {/* Vesting Management */}
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
    </div>
  );
};

export default ModernVestingCard;