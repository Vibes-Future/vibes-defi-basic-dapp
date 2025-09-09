'use client';

import React, { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { PublicKey } from '@solana/web3.js';
import { connection } from '@/lib/solana';
import { PRESALE_PROGRAM_ID } from '@/lib/config';

export const SimpleAdminPanel: React.FC = () => {
  const { connected, publicKeyObj } = useWallet();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  // Check if user is authority (for security)
  const isAuthority = connected && publicKeyObj?.toString() === 'Uvqj1b7jR1EKXyDAqoH1c3VPdjaRRGGHWPXGZe7LTH5';

  const checkPresaleStatus = async () => {
    setLoading(true);
    setStatus('🔍 Checking presale status...');

    try {
      // Get presale PDA
      const [presalePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('presale_state')],
        PRESALE_PROGRAM_ID
      );

      const presaleAccountInfo = await connection.getAccountInfo(presalePDA);
      
      if (!presaleAccountInfo) {
        setStatus('❌ Presale NOT INITIALIZED - This is why buy transactions fail');
      } else {
        setStatus('✅ Presale INITIALIZED - Buy transactions should work!');
      }

    } catch (error: unknown) {
      setStatus(`❌ Error checking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const showInitInstructions = () => {
    setStatus(`
📋 TO INITIALIZE PRESALE:

🔧 Option 1 - Use Backend Script:
cd /Users/osmelprieto/Projects/vibe-smart-contract
node scripts/init_presale_real.js

🔧 Option 2 - Anchor CLI:
anchor build
anchor run init-presale

🔧 Option 3 - Enable Demo Mode:
Set DEMO_MODE=true in config.ts

💡 The complex data structures (price schedule) make 
   manual instruction building difficult in browser.
   Backend scripts are more reliable.
    `);
  };

  if (!connected) {
    return (
      <div style={{ 
        padding: '20px', 
        border: '2px solid #ffa500', 
        borderRadius: '8px', 
        backgroundColor: '#fff5ee',
        margin: '20px 0'
      }}>
        <h3>🔧 Admin Panel</h3>
        <p>Connect wallet to check presale status</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #4caf50', 
      borderRadius: '8px', 
      backgroundColor: '#e8f5e8',
      margin: '20px 0'
    }}>
      <h3>🔧 Admin Panel</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Connected:</strong> {publicKeyObj?.toString()}</p>
        {isAuthority ? (
          <p style={{ color: '#4caf50' }}>✅ Authority wallet detected</p>
        ) : (
          <p style={{ color: '#ff9800' }}>⚠️ Not authority wallet</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={checkPresaleStatus}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            marginRight: '10px'
          }}
        >
          {loading ? '⏳ Checking...' : '🔍 Check Presale Status'}
        </button>

        <button
          onClick={showInitInstructions}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          📋 Show Init Instructions
        </button>
      </div>

      {status && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '4px',
          fontSize: '14px',
          whiteSpace: 'pre-line',
          fontFamily: 'monospace'
        }}>
          {status}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p><strong>🎯 Current Issue:</strong> AccountNotInitialized error means presale needs init_presale instruction.</p>
        <p><strong>📍 Presale PDA:</strong> Xu66emrcgtT57Kz1anrQzURyTWsYpHqSq8Cn5YuxQPZ</p>
        <p><strong>🔑 Authority:</strong> Uvqj1b7jR1EKXyDAqoH1c3VPdjaRRGGHWPXGZe7LTH5</p>
      </div>
    </div>
  );
};
