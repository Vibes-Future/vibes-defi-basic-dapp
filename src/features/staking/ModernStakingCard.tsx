'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { StakingService, UserStake, StakePool } from '@/services/staking';
import { connection } from '@/lib/solana';

const ModernStakingCard: React.FC = () => {
  const { connected, publicKeyObj, signTransaction, updateBalances, vibesBalance } = useWallet();
  const [stakingService] = useState(() => new StakingService(connection));
  
  // Form states
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [unstakeAmount, setUnstakeAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake' | 'rewards'>('stake');

  // Staking data
  const [userStake, setUserStake] = useState<UserStake | null>(null);
  const [stakePool, setStakePool] = useState<StakePool | null>(null);
  const [pendingRewards, setPendingRewards] = useState<number>(0);
  const [stakingStats, setStakingStats] = useState<{
    totalStaked: number;
    totalStakers: number;
    averageApy: number;
    totalRewardsDistributed: number;
  } | null>(null);

  // Load staking data
  useEffect(() => {
    if (connected && publicKeyObj) {
      loadStakingData();
      const interval = setInterval(loadStakingData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [connected, publicKeyObj]);

  // Calculate pending rewards
  useEffect(() => {
    if (userStake && stakePool) {
      const rewards = stakingService.calculatePendingRewards(userStake, stakePool);
      setPendingRewards(rewards);
    }
  }, [userStake, stakePool, stakingService]);

  const loadStakingData = async () => {
    if (!publicKeyObj) return;

    try {
      const [poolData, userData, stats] = await Promise.all([
        stakingService.getStakePool(),
        stakingService.getUserStake(publicKeyObj),
        stakingService.getStakingStats()
      ]);

      setStakePool(poolData);
      setUserStake(userData);
      setStakingStats(stats);
    } catch (error) {
      console.error('Error loading staking data:', error);
    }
  };

  const handleStake = async () => {
    if (!connected || !publicKeyObj || !signTransaction) return;
    
    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      setStatus('Please enter a valid stake amount');
      setTimeout(() => setStatus(''), 3000);
      return;
    }

    if (amount > vibesBalance) {
      setStatus('Insufficient VIBES balance');
      setTimeout(() => setStatus(''), 3000);
      return;
    }

    setLoading(true);
    setStatus('Staking VIBES tokens...');

    try {
      const signature = await stakingService.stake(publicKeyObj, amount, signTransaction);
      if (signature) {
        setStatus(`Staking successful! 🎉`);
        setStakeAmount('');
        await Promise.all([updateBalances(), loadStakingData()]);
      } else {
        setStatus('Staking failed ❌');
      }
    } catch (error) {
      console.error('Staking error:', error);
      setStatus('Staking failed ❌');
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  const handleUnstake = async () => {
    if (!connected || !publicKeyObj || !signTransaction || !userStake) return;
    
    const amount = parseFloat(unstakeAmount);
    if (isNaN(amount) || amount <= 0) {
      setStatus('Please enter a valid unstake amount');
      setTimeout(() => setStatus(''), 3000);
      return;
    }

    if (amount > userStake.stakeAmount) {
      setStatus('Insufficient staked amount');
      setTimeout(() => setStatus(''), 3000);
      return;
    }

    setLoading(true);
    setStatus('Unstaking VIBES tokens...');

    try {
      const signature = await stakingService.unstake(publicKeyObj, amount, signTransaction);
      if (signature) {
        setStatus(`Unstaking successful! 🎉`);
        setUnstakeAmount('');
        await Promise.all([updateBalances(), loadStakingData()]);
      } else {
        setStatus('Unstaking failed ❌');
      }
    } catch (error) {
      console.error('Unstaking error:', error);
      setStatus('Unstaking failed ❌');
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  const handleClaimRewards = async () => {
    if (!connected || !publicKeyObj || !signTransaction) return;

    if (pendingRewards <= 0) {
      setStatus('No rewards to claim');
      setTimeout(() => setStatus(''), 3000);
      return;
    }

    setLoading(true);
    setStatus('Claiming staking rewards...');

    try {
      const signature = await stakingService.claimRewards(publicKeyObj, signTransaction);
      if (signature) {
        setStatus(`Claim successful! 🎉`);
        await Promise.all([updateBalances(), loadStakingData()]);
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

  if (!connected) {
    return (
      <section id="staking" className="py-20">
        <div className="container">
          <div className="card max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-6">📈</div>
            <h3 className="text-3xl font-heading font-bold text-gradient mb-4">
              VIBES Staking Pool
            </h3>
            <p className="text-gray-300 mb-6">
              Connect your wallet to start earning 40% APY by staking your VIBES tokens.
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
    <section id="staking" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-gradient mb-4">
            📈 VIBES Staking Pool
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Earn 40% APY by staking your VIBES tokens. Secure the network and earn rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Pool Statistics */}
          <div className="card">
            <h3 className="text-xl font-heading font-semibold mb-6 text-gradient">
              🏊‍♂️ Pool Statistics
            </h3>
            
            {stakePool && stakingStats && (
              <div className="space-y-4">
                <div className="text-center p-4 bg-gradient-primary/10 rounded-lg border border-primary-1/20">
                  <div className="text-3xl font-bold text-success mb-2">
                    {(stakePool.apyBps / 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-400">Annual APY</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-primary-5/30 rounded-lg">
                    <span className="text-gray-300">Total Staked</span>
                    <span className="font-bold text-primary-1">
                      {stakingStats.totalStaked.toLocaleString()} VIBES
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-primary-5/30 rounded-lg">
                    <span className="text-gray-300">Rewards Distributed</span>
                    <span className="font-bold text-highlight-1">
                      {stakingStats.totalRewardsDistributed.toFixed(2)} VIBES
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-primary-5/30 rounded-lg">
                    <span className="text-gray-300">Global Cap</span>
                    <span className="font-bold text-gray-300">
                      {(stakePool.globalCap / 1000000).toLocaleString()}M VIBES
                    </span>
                  </div>
                </div>

                <div className="text-center p-3 bg-info/10 rounded-lg border border-info/20">
                  <div className="text-sm text-gray-400 mb-1">Distribution</div>
                  <div className="text-info font-medium">97% to Stakers | 3% to Charity</div>
                </div>
              </div>
            )}
          </div>

          {/* Staking Interface */}
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-xl font-heading font-semibold mb-6 text-gradient">
                💎 Staking Dashboard
              </h3>

              {/* User Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-primary-5/20 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Available VIBES</div>
                  <div className="text-xl font-bold text-primary-1">{vibesBalance.toFixed(2)}</div>
                </div>
                <div className="text-center p-4 bg-primary-5/20 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Staked Amount</div>
                  <div className="text-xl font-bold text-highlight-1">
                    {userStake?.stakeAmount.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div className="text-center p-4 bg-primary-5/20 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Pending Rewards</div>
                  <div className="text-xl font-bold text-success">{pendingRewards.toFixed(4)}</div>
                </div>
              </div>

              {/* Additional User Info */}
              {userStake && userStake.stakeAmount > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-primary-5/10 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Last Staked</div>
                    <div className="font-medium text-gray-300">
                      {new Date(userStake.lastStakeTs * 1000).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-primary-5/10 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Days Staking</div>
                    <div className="font-medium text-gray-300">
                      {Math.floor((Date.now() / 1000 - userStake.lastStakeTs) / 86400)} days
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Navigation */}
              <div className="flex mb-6 bg-primary-5/30 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('stake')}
                  className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                    activeTab === 'stake'
                      ? 'bg-gradient-primary text-primary-4'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  🔒 Stake
                </button>
                <button
                  onClick={() => setActiveTab('unstake')}
                  className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                    activeTab === 'unstake'
                      ? 'bg-gradient-primary text-primary-4'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  disabled={!userStake || userStake.stakeAmount <= 0}
                >
                  🔓 Unstake
                </button>
                <button
                  onClick={() => setActiveTab('rewards')}
                  className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                    activeTab === 'rewards'
                      ? 'bg-gradient-primary text-primary-4'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  🎁 Rewards
                </button>
              </div>

              {/* Stake Tab */}
              {activeTab === 'stake' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Stake Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        placeholder="100"
                        step="0.01"
                        min="0"
                        max={vibesBalance}
                        className="w-full p-4 bg-primary-5/30 border border-primary-1/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-1 transition-colors"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        VIBES
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-400">
                      <span>Available: {vibesBalance.toFixed(2)} VIBES</span>
                      <button
                        onClick={() => setStakeAmount(vibesBalance.toString())}
                        className="text-primary-1 hover:text-primary-2 transition-colors"
                      >
                        Max
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleStake}
                    disabled={loading || !stakeAmount || parseFloat(stakeAmount) <= 0}
                    className={`btn btn-primary w-full py-4 text-lg ${loading ? 'loading' : ''}`}
                  >
                    {loading ? 'Processing...' : `Stake ${stakeAmount || '0'} VIBES`}
                  </button>
                </div>
              )}

              {/* Unstake Tab */}
              {activeTab === 'unstake' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Unstake Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={unstakeAmount}
                        onChange={(e) => setUnstakeAmount(e.target.value)}
                        placeholder="50"
                        step="0.01"
                        min="0"
                        max={userStake?.stakeAmount || 0}
                        className="w-full p-4 bg-primary-5/30 border border-primary-1/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-1 transition-colors"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        VIBES
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-400">
                      <span>Staked: {userStake?.stakeAmount.toFixed(2) || '0.00'} VIBES</span>
                      <button
                        onClick={() => setUnstakeAmount(userStake?.stakeAmount.toString() || '0')}
                        className="text-primary-1 hover:text-primary-2 transition-colors"
                      >
                        Max
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleUnstake}
                    disabled={loading || !unstakeAmount || parseFloat(unstakeAmount) <= 0 || !userStake}
                    className={`btn btn-secondary w-full py-4 text-lg ${loading ? 'loading' : ''}`}
                  >
                    {loading ? 'Processing...' : `Unstake ${unstakeAmount || '0'} VIBES`}
                  </button>
                </div>
              )}

              {/* Rewards Tab */}
              {activeTab === 'rewards' && (
                <div className="space-y-6 text-center">
                  <div className="p-6 bg-success/10 border border-success/20 rounded-lg">
                    <div className="text-4xl font-bold text-success mb-2">
                      {pendingRewards.toFixed(4)} VIBES
                    </div>
                    <div className="text-gray-400">Pending Rewards</div>
                  </div>

                  <div className="text-sm text-gray-400 space-y-2">
                    <div>📊 Daily Estimated Rewards: {((userStake?.stakeAmount || 0) * 0.4 / 365 * 0.97).toFixed(4)} VIBES</div>
                    <div>🎯 Current APY: 40% (after 3% charity fee)</div>
                    <div>⏰ Rewards update in real-time</div>
                  </div>

                  <button
                    onClick={handleClaimRewards}
                    disabled={loading || pendingRewards <= 0}
                    className={`btn btn-primary w-full py-4 text-lg ${loading ? 'loading' : ''}`}
                  >
                    {loading ? 'Processing...' : `Claim ${pendingRewards.toFixed(4)} VIBES`}
                  </button>
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
        </div>
      </div>
    </section>
  );
};

export default ModernStakingCard;
