'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { StakingService, UserStake, StakePool } from '@/services/staking';
import { connection } from '@/lib/solana';

export const StakingCard: React.FC = () => {
  const { connected, publicKeyObj, signTransaction, updateBalances, vibesBalance } = useWallet();
  const [stakingService] = useState(() => new StakingService(connection));
  
  // Form states
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [unstakeAmount, setUnstakeAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

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
      return;
    }

    if (amount > vibesBalance) {
      setStatus('Insufficient VIBES balance');
      return;
    }

    setLoading(true);
    setStatus('Staking VIBES tokens...');

    try {
      const signature = await stakingService.stake(publicKeyObj, amount, signTransaction);
      if (signature) {
        setStatus(`Staking successful! Transaction: ${signature.slice(0, 8)}...`);
        setStakeAmount('');
        await Promise.all([updateBalances(), loadStakingData()]);
      } else {
        setStatus('Staking failed');
      }
    } catch (error) {
      console.error('Staking error:', error);
      setStatus('Staking failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!connected || !publicKeyObj || !signTransaction || !userStake) return;
    
    const amount = parseFloat(unstakeAmount);
    if (isNaN(amount) || amount <= 0) {
      setStatus('Please enter a valid unstake amount');
      return;
    }

    if (amount > userStake.stakeAmount) {
      setStatus('Insufficient staked amount');
      return;
    }

    setLoading(true);
    setStatus('Unstaking VIBES tokens...');

    try {
      const signature = await stakingService.unstake(publicKeyObj, amount, signTransaction);
      if (signature) {
        setStatus(`Unstaking successful! Transaction: ${signature.slice(0, 8)}...`);
        setUnstakeAmount('');
        await Promise.all([updateBalances(), loadStakingData()]);
      } else {
        setStatus('Unstaking failed');
      }
    } catch (error) {
      console.error('Unstaking error:', error);
      setStatus('Unstaking failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!connected || !publicKeyObj || !signTransaction) return;

    if (pendingRewards <= 0) {
      setStatus('No rewards to claim');
      return;
    }

    setLoading(true);
    setStatus('Claiming staking rewards...');

    try {
      const signature = await stakingService.claimRewards(publicKeyObj, signTransaction);
      if (signature) {
        setStatus(`Claim successful! Transaction: ${signature.slice(0, 8)}...`);
        await Promise.all([updateBalances(), loadStakingData()]);
      } else {
        setStatus('Claim failed');
      }
    } catch (error) {
      console.error('Claim error:', error);
      setStatus('Claim failed');
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div style={{ border: '1px solid #ccc', padding: '20px', margin: '10px', borderRadius: '8px' }}>
        <h3>📈 VIBES Staking</h3>
        <p>Connect your wallet to start staking</p>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', margin: '10px', borderRadius: '8px' }}>
      <h3>📈 VIBES Staking Pool</h3>
      
      {/* Pool Info */}
      {stakePool && stakingStats && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <p><strong>Staking Pool Statistics:</strong></p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
            <li>APY: {(stakePool.apyBps / 100).toFixed(1)}%</li>
            <li>Total Staked: {stakingStats.totalStaked.toLocaleString()} VIBES</li>
            <li>Total Rewards Distributed: {stakingStats.totalRewardsDistributed.toFixed(2)} VIBES</li>
            <li>Reward Distribution: 97% to stakers, 3% to charity</li>
            <li>Global Cap: {(stakePool.globalCap / 1000000).toLocaleString()}M VIBES</li>
          </ul>
        </div>
      )}

      {/* User Stake Info */}
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Your Staking Status:</strong></p>
        <ul>
          <li>Available VIBES: {vibesBalance.toFixed(4)}</li>
          <li>Staked Amount: {userStake?.stakeAmount.toFixed(4) || '0.0000'} VIBES</li>
          <li>Pending Rewards: {pendingRewards.toFixed(4)} VIBES</li>
          {userStake && userStake.stakeAmount > 0 && (
            <>
              <li>Last Staked: {new Date(userStake.lastStakeTs * 1000).toLocaleDateString()}</li>
              <li>Time Staking: {Math.floor((Date.now() / 1000 - userStake.lastStakeTs) / 86400)} days</li>
            </>
          )}
        </ul>
      </div>

      {/* Stake Section */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h4>🔒 Stake VIBES</h4>
        <div style={{ marginBottom: '10px' }}>
          <label>Stake Amount:</label>
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="100"
            step="0.01"
            min="0"
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
        <button
          onClick={handleStake}
          disabled={loading || !stakeAmount}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !stakeAmount ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {loading ? 'Processing...' : 'Stake VIBES'}
        </button>
      </div>

      {/* Unstake Section */}
      {userStake && userStake.stakeAmount > 0 && (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
          <h4>🔓 Unstake VIBES</h4>
          <div style={{ marginBottom: '10px' }}>
            <label>Unstake Amount:</label>
            <input
              type="number"
              value={unstakeAmount}
              onChange={(e) => setUnstakeAmount(e.target.value)}
              placeholder="50"
              step="0.01"
              min="0"
              max={userStake.stakeAmount}
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>
          <button
            onClick={handleUnstake}
            disabled={loading || !unstakeAmount}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading || !unstakeAmount ? 'not-allowed' : 'pointer',
              width: '100%'
            }}
          >
            {loading ? 'Processing...' : 'Unstake VIBES'}
          </button>
        </div>
      )}

      {/* Claim Rewards Section */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h4>🎁 Claim Rewards</h4>
        <p>Pending Rewards: {pendingRewards.toFixed(4)} VIBES</p>
        <button
          onClick={handleClaimRewards}
          disabled={loading || pendingRewards <= 0}
          style={{
            padding: '10px 20px',
            backgroundColor: '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || pendingRewards <= 0 ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {loading ? 'Processing...' : 'Claim Rewards'}
        </button>
      </div>

      {/* Status */}
      {status && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: status.includes('successful') ? '#d4edda' : status.includes('failed') ? '#f8d7da' : '#e2e3e5',
          border: '1px solid',
          borderColor: status.includes('successful') ? '#c3e6cb' : status.includes('failed') ? '#f5c6cb' : '#d6d8db',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {status}
        </div>
      )}
    </div>
  );
};
