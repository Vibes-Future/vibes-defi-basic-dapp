'use client';

import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@/hooks/useWallet';
import { VestingService, VestingSchedule } from '@/services/vesting';
import { connection } from '@/lib/solana';

const ModernVestingCard: React.FC = () => {
  const { connected, publicKeyObj, signTransaction, updateBalances } = useWallet();
  const [vestingService] = useState(() => new VestingService(connection));
  
  // Form states
  const [createAmount, setCreateAmount] = useState<string>('');
  const [beneficiaryAddress, setBeneficiaryAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'view' | 'create'>('view');

  // Vesting data
  const [vestingSchedule, setVestingSchedule] = useState<VestingSchedule | null>(null);
  const [vestingInfo, setVestingInfo] = useState<{
    vestedAmount: number;
    claimableAmount: number;
    nextVestingDate: number | null;
    vestingProgress: number;
    cliffEndDate: Date;
    isInCliff: boolean;
    monthlyReleasesDone: number;
  } | null>(null);

  // Load vesting data
  useEffect(() => {
    if (connected && publicKeyObj) {
      loadVestingData();
      const interval = setInterval(loadVestingData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [connected, publicKeyObj]);

  // Calculate vesting info when schedule changes
  useEffect(() => {
    if (vestingSchedule) {
      const info = vestingService.calculateVestedAmount(vestingSchedule);
      setVestingInfo(info);
    }
  }, [vestingSchedule, vestingService]);

  const loadVestingData = async () => {
    if (!publicKeyObj) return;

    try {
      const schedule = await vestingService.getVestingSchedule(publicKeyObj);
      setVestingSchedule(schedule);
    } catch (error) {
      console.error('Error loading vesting data:', error);
    }
  };

  const handleCreateSchedule = async () => {
    if (!connected || !publicKeyObj || !signTransaction) return;
    
    const amount = parseFloat(createAmount);
    if (isNaN(amount) || amount <= 0) {
      setStatus('Please enter a valid amount');
      setTimeout(() => setStatus(''), 3000);
      return;
    }

    if (!beneficiaryAddress.trim()) {
      setStatus('Please enter beneficiary address');
      setTimeout(() => setStatus(''), 3000);
      return;
    }

    try {
      new PublicKey(beneficiaryAddress);
    } catch {
      setStatus('Invalid beneficiary address');
      setTimeout(() => setStatus(''), 3000);
      return;
    }

    setLoading(true);
    setStatus('Creating vesting schedule...');

    try {
      const listingTs = Math.floor(Date.now() / 1000);
      
      const signature = await vestingService.createSchedule(
        publicKeyObj,
        new PublicKey(beneficiaryAddress),
        amount,
        listingTs,
        signTransaction
      );
      
      if (signature) {
        setStatus(`Schedule created successfully! 🎉`);
        setCreateAmount('');
        setBeneficiaryAddress('');
        await loadVestingData();
        setActiveTab('view');
      } else {
        setStatus('Schedule creation failed ❌');
      }
    } catch (error) {
      console.error('Create schedule error:', error);
      setStatus('Schedule creation failed ❌');
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  const handleClaim = async () => {
    if (!connected || !publicKeyObj || !signTransaction || !vestingInfo) return;

    if (vestingInfo.claimableAmount <= 0) {
      setStatus('No tokens available to claim');
      setTimeout(() => setStatus(''), 3000);
      return;
    }

    setLoading(true);
    setStatus('Claiming vested tokens...');

    try {
      const signature = await vestingService.claim(publicKeyObj, signTransaction);
      if (signature) {
        setStatus(`Claim successful! 🎉`);
        await Promise.all([updateBalances(), loadVestingData()]);
      } else {
        setStatus('Claim failed ❌');
      }
    } catch (error) {
      console.error('Claim error:', error);
      setStatus('Claim failed ❌');
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  const handleCancel = async () => {
    if (!connected || !publicKeyObj || !signTransaction) return;

    setLoading(true);
    setStatus('Cancelling vesting schedule...');

    try {
      const signature = await vestingService.cancel(publicKeyObj, signTransaction);
      if (signature) {
        setStatus(`Cancel successful! 🎉`);
        await loadVestingData();
      } else {
        setStatus('Cancel failed ❌');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      setStatus('Cancel failed ❌');
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimeRemaining = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = timestamp - now;
    
    if (diff <= 0) return 'Available now';
    
    const days = Math.floor(diff / (24 * 60 * 60));
    const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
    
    if (days > 30) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? 's' : ''}, ${days % 30} days`;
    }
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}, ${hours} hours`;
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  };

  if (!connected) {
    return (
      <section id="vesting" className="py-20">
        <div className="container">
          <div className="card max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-6">⏰</div>
            <h3 className="text-3xl font-heading font-bold text-gradient mb-4">
              VIBES Token Vesting
            </h3>
            <p className="text-gray-300 mb-6">
              Connect your wallet to manage vesting schedules and claim your vested tokens.
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
    <section id="vesting" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-gradient mb-4">
            ⏰ VIBES Token Vesting
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Secure time-locked token releases with cliff periods and gradual unlocking.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Vesting Logic Info */}
          <div className="card mb-8">
            <h3 className="text-xl font-heading font-semibold mb-4 text-gradient">
              📋 Vesting Logic
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary-5/20 rounded-lg">
                <div className="text-2xl font-bold text-primary-1 mb-2">1 Year</div>
                <div className="text-sm text-gray-400">Cliff Period</div>
              </div>
              <div className="text-center p-4 bg-primary-5/20 rounded-lg">
                <div className="text-2xl font-bold text-highlight-1 mb-2">40%</div>
                <div className="text-sm text-gray-400">After Cliff</div>
              </div>
              <div className="text-center p-4 bg-primary-5/20 rounded-lg">
                <div className="text-2xl font-bold text-highlight-2 mb-2">20%</div>
                <div className="text-sm text-gray-400">Monthly (3x)</div>
              </div>
              <div className="text-center p-4 bg-primary-5/20 rounded-lg">
                <div className="text-2xl font-bold text-success mb-2">15</div>
                <div className="text-sm text-gray-400">Total Months</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-8 bg-primary-5/30 p-1 rounded-lg max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('view')}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                activeTab === 'view'
                  ? 'bg-gradient-primary text-primary-4'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              📊 View Schedule
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                activeTab === 'create'
                  ? 'bg-gradient-primary text-primary-4'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              📝 Create New
            </button>
          </div>

          {/* View Schedule Tab */}
          {activeTab === 'view' && (
            <div className="card">
              {vestingSchedule && vestingInfo ? (
                <div className="space-y-6">
                  <h3 className="text-xl font-heading font-semibold text-gradient text-center">
                    📈 Your Vesting Schedule
                  </h3>

                  {/* Progress Overview */}
                  <div className="text-center p-6 bg-gradient-primary/10 rounded-lg border border-primary-1/20">
                    <div className="text-4xl font-bold text-gradient mb-2">
                      {vestingInfo.vestingProgress.toFixed(1)}%
                    </div>
                    <div className="text-gray-400 mb-4">Vesting Progress</div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-primary-5/30 rounded-full h-4 mb-4">
                      <div 
                        className="h-4 rounded-full bg-gradient-primary transition-all duration-500"
                        style={{ width: `${vestingInfo.vestingProgress}%` }}
                      ></div>
                    </div>

                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      vestingInfo.isInCliff 
                        ? 'bg-warning/20 text-warning border border-warning/30'
                        : 'bg-success/20 text-success border border-success/30'
                    }`}>
                      {vestingInfo.isInCliff ? '⏳ In Cliff Period' : '✅ Vesting Active'}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-primary-5/20 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Total Amount</div>
                        <div className="text-xl font-bold text-primary-1">
                          {vestingSchedule.totalAmount.toFixed(2)} VIBES
                        </div>
                      </div>
                      <div className="p-4 bg-primary-5/20 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Vested Amount</div>
                        <div className="text-xl font-bold text-highlight-1">
                          {vestingInfo.vestedAmount.toFixed(2)} VIBES
                        </div>
                      </div>
                      <div className="p-4 bg-primary-5/20 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Claimed Amount</div>
                        <div className="text-xl font-bold text-gray-300">
                          {vestingSchedule.claimedAmount.toFixed(2)} VIBES
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Claimable Now</div>
                        <div className="text-xl font-bold text-success">
                          {vestingInfo.claimableAmount.toFixed(4)} VIBES
                        </div>
                      </div>
                      <div className="p-4 bg-primary-5/20 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Cliff End Date</div>
                        <div className="font-medium text-gray-300">
                          {vestingInfo.cliffEndDate.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="p-4 bg-primary-5/20 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Monthly Releases</div>
                        <div className="font-medium text-gray-300">
                          {vestingInfo.monthlyReleasesDone}/3 Completed
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="p-4 bg-primary-5/10 rounded-lg">
                    <h4 className="font-semibold text-gray-300 mb-3">📅 Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Listing Date:</span>
                        <span className="text-gray-300">{formatDate(vestingSchedule.listingTs)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cliff Ends:</span>
                        <span className="text-gray-300">{vestingInfo.cliffEndDate.toLocaleDateString()}</span>
                      </div>
                      {vestingInfo.nextVestingDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Next Vesting:</span>
                          <span className="text-gray-300">
                            {formatDate(vestingInfo.nextVestingDate)} ({formatTimeRemaining(vestingInfo.nextVestingDate)})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleClaim}
                      disabled={loading || vestingInfo.claimableAmount <= 0}
                      className={`btn btn-primary flex-1 py-3 ${loading ? 'loading' : ''}`}
                    >
                      {loading ? 'Processing...' : `Claim ${vestingInfo.claimableAmount.toFixed(4)} VIBES`}
                    </button>
                    
                    <button
                      onClick={handleCancel}
                      disabled={loading || vestingSchedule.isCancelled}
                      className={`btn btn-secondary flex-1 py-3 ${loading ? 'loading' : ''}`}
                    >
                      {loading ? 'Processing...' : 'Cancel Schedule'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-heading font-semibold text-gray-300 mb-3">
                    No Vesting Schedule Found
                  </h3>
                  <p className="text-gray-400 mb-6">
                    You don&apos;t have an active vesting schedule yet.
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="btn btn-primary"
                  >
                    Create Vesting Schedule
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Create Schedule Tab */}
          {activeTab === 'create' && (
            <div className="card">
              <h3 className="text-xl font-heading font-semibold mb-6 text-gradient text-center">
                📝 Create Vesting Schedule
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Beneficiary Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={beneficiaryAddress}
                      onChange={(e) => setBeneficiaryAddress(e.target.value)}
                      placeholder="Enter wallet address or use your own"
                      className="w-full p-4 bg-primary-5/30 border border-primary-1/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-1 transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => setBeneficiaryAddress(publicKeyObj?.toString() || '')}
                    disabled={!publicKeyObj}
                    className="mt-2 text-sm text-primary-1 hover:text-primary-2 transition-colors"
                  >
                    📋 Use My Address
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Total VIBES Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={createAmount}
                      onChange={(e) => setCreateAmount(e.target.value)}
                      placeholder="1000"
                      step="0.01"
                      min="0"
                      className="w-full p-4 bg-primary-5/30 border border-primary-1/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-1 transition-colors"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      VIBES
                    </div>
                  </div>
                </div>

                {/* Preview */}
                {createAmount && parseFloat(createAmount) > 0 && (
                  <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                    <h4 className="font-semibold text-info mb-3">📊 Schedule Preview</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Amount:</span>
                        <span className="text-gray-300">{parseFloat(createAmount).toFixed(2)} VIBES</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">After 1 Year Cliff:</span>
                        <span className="text-gray-300">{(parseFloat(createAmount) * 0.4).toFixed(2)} VIBES (40%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Monthly Releases (3x):</span>
                        <span className="text-gray-300">{(parseFloat(createAmount) * 0.2).toFixed(2)} VIBES each (20%)</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleCreateSchedule}
                  disabled={loading || !createAmount || !beneficiaryAddress}
                  className={`btn btn-primary w-full py-4 text-lg ${loading ? 'loading' : ''}`}
                >
                  {loading ? 'Creating...' : 'Create Vesting Schedule'}
                </button>
              </div>
            </div>
          )}

          {/* Status Message */}
          {status && (
            <div className={`mt-6 p-4 rounded-lg text-center font-medium ${
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
    </section>
  );
};

export default ModernVestingCard;
