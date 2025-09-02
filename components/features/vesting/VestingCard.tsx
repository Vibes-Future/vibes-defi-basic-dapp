'use client';

import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@/hooks/useWallet';
import { VestingService, VestingSchedule } from '@/services/vesting';
import { connection } from '@/lib/solana';

export const VestingCard: React.FC = () => {
  const { connected, publicKeyObj, signTransaction, updateBalances } = useWallet();
  const [vestingService] = useState(() => new VestingService(connection));
  
  // Form states
  const [createAmount, setCreateAmount] = useState<string>('');
  const [beneficiaryAddress, setBeneficiaryAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

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
      return;
    }

    if (!beneficiaryAddress.trim()) {
      setStatus('Please enter beneficiary address');
      return;
    }

    setLoading(true);
    setStatus('Creating vesting schedule...');

    try {
      // Use current timestamp as listing timestamp for demo
      const listingTs = Math.floor(Date.now() / 1000);
      
      const signature = await vestingService.createSchedule(
        publicKeyObj,
        new PublicKey(beneficiaryAddress),
        amount,
        listingTs,
        signTransaction
      );
      
      if (signature) {
        setStatus(`Schedule created! Transaction: ${signature.slice(0, 8)}...`);
        setCreateAmount('');
        setBeneficiaryAddress('');
        await loadVestingData();
      } else {
        setStatus('Schedule creation failed');
      }
    } catch (error) {
      console.error('Create schedule error:', error);
      setStatus('Schedule creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!connected || !publicKeyObj || !signTransaction || !vestingInfo) return;

    if (vestingInfo.claimableAmount <= 0) {
      setStatus('No tokens available to claim');
      return;
    }

    setLoading(true);
    setStatus('Claiming vested tokens...');

    try {
      const signature = await vestingService.claim(publicKeyObj, signTransaction);
      if (signature) {
        setStatus(`Claim successful! Transaction: ${signature.slice(0, 8)}...`);
        await Promise.all([updateBalances(), loadVestingData()]);
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

  const handleCancel = async () => {
    if (!connected || !publicKeyObj || !signTransaction) return;

    setLoading(true);
    setStatus('Cancelling vesting schedule...');

    try {
      const signature = await vestingService.cancel(publicKeyObj, signTransaction);
      if (signature) {
        setStatus(`Cancel successful! Transaction: ${signature.slice(0, 8)}...`);
        await loadVestingData();
      } else {
        setStatus('Cancel failed');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      setStatus('Cancel failed');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatTimeRemaining = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = timestamp - now;
    
    if (diff <= 0) return 'Available now';
    
    const days = Math.floor(diff / (24 * 60 * 60));
    const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
    
    if (days > 0) return `${days} days, ${hours} hours`;
    return `${hours} hours`;
  };

  if (!connected) {
    return (
      <div style={{ border: '1px solid #ccc', padding: '20px', margin: '10px', borderRadius: '8px' }}>
        <h3>⏰ VIBES Vesting</h3>
        <p>Connect your wallet to manage vesting schedules</p>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', margin: '10px', borderRadius: '8px' }}>
      <h3>⏰ VIBES Token Vesting</h3>
      
      {/* Vesting Info */}
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <p><strong>Vesting Logic:</strong></p>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
          <li>1 year cliff period</li>
          <li>40% released after cliff</li>
          <li>20% released monthly for 3 months</li>
          <li>Total vesting period: 15 months</li>
        </ul>
      </div>

      {/* Current Vesting Schedule */}
      {vestingSchedule && vestingInfo ? (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
          <h4>📋 Your Vesting Schedule</h4>
          <div style={{ marginBottom: '10px' }}>
            <p><strong>Total Amount:</strong> {vestingSchedule.totalAmount.toFixed(4)} VIBES</p>
            <p><strong>Claimed Amount:</strong> {vestingSchedule.claimedAmount.toFixed(4)} VIBES</p>
            <p><strong>Vested Amount:</strong> {vestingInfo.vestedAmount.toFixed(4)} VIBES</p>
            <p><strong>Claimable Amount:</strong> {vestingInfo.claimableAmount.toFixed(4)} VIBES</p>
            <p><strong>Progress:</strong> {vestingInfo.vestingProgress.toFixed(1)}%</p>
            <p><strong>Listing Date:</strong> {formatDate(vestingSchedule.listingTs)}</p>
            <p><strong>Cliff End Date:</strong> {vestingInfo.cliffEndDate.toLocaleDateString()}</p>
            <p><strong>Status:</strong> {vestingInfo.isInCliff ? '⏳ In Cliff Period' : '✅ Vesting Active'}</p>
            <p><strong>Monthly Releases Done:</strong> {vestingInfo.monthlyReleasesDone}/3</p>
            {vestingInfo.nextVestingDate && (
              <p><strong>Next Vesting:</strong> {formatDate(vestingInfo.nextVestingDate)} ({formatTimeRemaining(vestingInfo.nextVestingDate)})</p>
            )}
          </div>

          {/* Progress bar */}
          <div style={{ 
            width: '100%', 
            backgroundColor: '#e0e0e0', 
            borderRadius: '4px', 
            marginBottom: '15px' 
          }}>
            <div style={{
              width: `${vestingInfo.vestingProgress}%`,
              height: '20px',
              backgroundColor: '#4CAF50',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleClaim}
              disabled={loading || vestingInfo.claimableAmount <= 0}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading || vestingInfo.claimableAmount <= 0 ? 'not-allowed' : 'pointer',
                flex: 1
              }}
            >
              {loading ? 'Processing...' : `Claim ${vestingInfo.claimableAmount.toFixed(4)} VIBES`}
            </button>
            
            <button
              onClick={handleCancel}
              disabled={loading || vestingSchedule.isCancelled}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading || vestingSchedule.isCancelled ? 'not-allowed' : 'pointer',
                flex: 1
              }}
            >
              {loading ? 'Processing...' : 'Cancel Schedule'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
          <p>No vesting schedule found for your wallet.</p>
        </div>
      )}

      {/* Create Vesting Schedule */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h4>📝 Create Vesting Schedule</h4>
        <div style={{ marginBottom: '10px' }}>
          <label>Beneficiary Address:</label>
          <input
            type="text"
            value={beneficiaryAddress}
            onChange={(e) => setBeneficiaryAddress(e.target.value)}
            placeholder="Enter wallet address or use your own"
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <button
            onClick={() => setBeneficiaryAddress(publicKeyObj?.toString() || '')}
            disabled={!publicKeyObj}
            style={{
              padding: '4px 8px',
              backgroundColor: '#e0e0e0',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '12px',
              marginTop: '5px',
              cursor: 'pointer'
            }}
          >
            Use My Address
          </button>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Total VIBES Amount:</label>
          <input
            type="number"
            value={createAmount}
            onChange={(e) => setCreateAmount(e.target.value)}
            placeholder="1000"
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
          onClick={handleCreateSchedule}
          disabled={loading || !createAmount || !beneficiaryAddress}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !createAmount || !beneficiaryAddress ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {loading ? 'Processing...' : 'Create Vesting Schedule'}
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
