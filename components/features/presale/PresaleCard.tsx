'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { PresaleService } from '@/services/presale-simple';
import { connection } from '@/lib/solana';
import { requestAirdrop } from '@/lib/solana';

const PresaleCard: React.FC = () => {
  const { connected, publicKeyObj, signTransaction, updateBalances, solBalance, usdcBalance } = useWallet();
  const [presaleService] = useState(() => new PresaleService(connection));
  
  // Form states
  const [solAmount, setSolAmount] = useState<string>('');
  const [usdcAmount, setUsdcAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

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
          totalRaisedSol: presaleState.raisedSol / 1000000000, // Convert from lamports
          totalRaisedUsdc: presaleState.raisedUsdc / 1000000, // Convert from base units
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
        setStatus('Airdrop successful! Updating balances...');
        await updateBalances();
        setStatus('SOL airdrop completed');
      } else {
        setStatus('Airdrop failed');
      }
    } catch (error) {
      console.error('Airdrop error:', error);
      setStatus('Airdrop failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyWithSol = async () => {
    if (!connected || !publicKeyObj || !signTransaction) return;
    
    const sol = parseFloat(solAmount);
    if (isNaN(sol) || sol <= 0) {
      setStatus('Please enter a valid SOL amount');
      return;
    }

    if (sol > solBalance) {
      setStatus('Insufficient SOL balance');
      return;
    }

    setLoading(true);
    setStatus('Purchasing VIBES with SOL...');

    try {
      const signature = await presaleService.buyWithSol(publicKeyObj, sol, signTransaction);
      if (signature) {
        setStatus(`Purchase successful! Transaction: ${signature.slice(0, 8)}...`);
        setSolAmount('');
        await updateBalances();
      } else {
        setStatus('Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setStatus('Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyWithUsdc = async () => {
    if (!connected || !publicKeyObj || !signTransaction) return;
    
    const usdc = parseFloat(usdcAmount);
    if (isNaN(usdc) || usdc <= 0) {
      setStatus('Please enter a valid USDC amount');
      return;
    }

    if (usdc > usdcBalance) {
      setStatus('Insufficient USDC balance');
      return;
    }

    setLoading(true);
    setStatus('Purchasing VIBES with USDC...');

    try {
      const signature = await presaleService.buyWithUsdc(publicKeyObj, usdc, signTransaction);
      if (signature) {
        setStatus(`Purchase successful! Transaction: ${signature.slice(0, 8)}...`);
        setUsdcAmount('');
        await updateBalances();
      } else {
        setStatus('Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setStatus('Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div style={{ border: '1px solid #ccc', padding: '20px', margin: '10px', borderRadius: '8px' }}>
        <h3>🚀 VIBES Presale</h3>
        <p>Connect your wallet to participate in the presale</p>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', margin: '10px', borderRadius: '8px' }}>
      <h3>🚀 VIBES Token Presale</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '10px' }}>
          <div style={{ padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>VIBES Price</div>
            <div style={{ fontWeight: 'bold' }}>${currentPrice.toFixed(4)}</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>SOL Price</div>
            <div style={{ fontWeight: 'bold' }}>${solUsdPrice.toFixed(2)}</div>
          </div>
        </div>
        {presaleStats && (
          <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <p><strong>Presale Progress:</strong></p>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
              <li>Status: {presaleStats.isActive ? '🟢 Active' : '🔴 Inactive'}</li>
              <li>Total Raised: {presaleStats.totalRaisedSol.toFixed(2)} SOL + {presaleStats.totalRaisedUsdc.toFixed(2)} USDC</li>
              {presaleStats.endDate && (
                <li>Ends: {presaleStats.endDate.toLocaleDateString()}</li>
              )}
            </ul>
          </div>
        )}
        <p><strong>Your Balances:</strong></p>
        <ul>
          <li>SOL: {solBalance.toFixed(4)}</li>
          <li>USDC: {usdcBalance.toFixed(2)}</li>
        </ul>
      </div>

      {/* Airdrop button for devnet */}
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <p><strong>Devnet Testing:</strong></p>
        <button
          onClick={handleSolAirdrop}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Requesting...' : 'Get 2 SOL Airdrop'}
        </button>
      </div>

      {/* Buy with SOL */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h4>💰 Buy with SOL</h4>
        <div style={{ marginBottom: '10px' }}>
          <label>SOL Amount:</label>
          <input
            type="number"
            value={solAmount}
            onChange={(e) => setSolAmount(e.target.value)}
            placeholder="0.1"
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
        {vibesForSol > 0 && (
          <div style={{ padding: '8px', backgroundColor: '#e8f5e8', borderRadius: '4px', fontSize: '14px' }}>
            <strong>You will receive:</strong> {vibesForSol.toFixed(2)} VIBES<br/>
            <span style={{ color: '#666' }}>Rate: ${(parseFloat(solAmount) * solUsdPrice / vibesForSol).toFixed(4)} per VIBES</span>
          </div>
        )}
        <button
          onClick={handleBuyWithSol}
          disabled={loading || !solAmount}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !solAmount ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {loading ? 'Processing...' : 'Buy with SOL'}
        </button>
      </div>

      {/* Buy with USDC */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h4>💳 Buy with USDC</h4>
        <div style={{ marginBottom: '10px' }}>
          <label>USDC Amount:</label>
          <input
            type="number"
            value={usdcAmount}
            onChange={(e) => setUsdcAmount(e.target.value)}
            placeholder="10"
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
        {vibesForUsdc > 0 && (
          <div style={{ padding: '8px', backgroundColor: '#e8f5e8', borderRadius: '4px', fontSize: '14px' }}>
            <strong>You will receive:</strong> {vibesForUsdc.toFixed(2)} VIBES<br/>
            <span style={{ color: '#666' }}>Rate: ${currentPrice.toFixed(4)} per VIBES</span>
          </div>
        )}
        <button
          onClick={handleBuyWithUsdc}
          disabled={loading || !usdcAmount}
          style={{
            padding: '10px 20px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !usdcAmount ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {loading ? 'Processing...' : 'Buy with USDC'}
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

export default PresaleCard;
