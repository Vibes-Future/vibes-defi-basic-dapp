'use client';

import React, { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';

export const PresaleInitializer: React.FC = () => {
  const { connected, publicKeyObj } = useWallet();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const handleInitializePresale = async () => {
    if (!connected || !publicKeyObj) {
      setStatus('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setStatus('🔧 Initializing presale...');

    try {
      // This would normally initialize the presale
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 3000));
      setStatus('✅ Presale initialization simulated! In production, this would deploy the presale contract.');
    } catch (error) {
      console.error('Initialization error:', error);
      setStatus('❌ Initialization failed');
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="card max-w-md mx-auto text-center">
        <h3 className="text-lg font-heading font-semibold text-gradient mb-4">
          🔧 Admin Panel
        </h3>
        <p className="text-gray-400 mb-4">Connect wallet to access admin functions</p>
      </div>
    );
  }

  return (
    <div className="card max-w-md mx-auto">
      <h3 className="text-lg font-heading font-semibold text-gradient mb-4">
        🔧 Admin Panel
      </h3>
      
      <div className="space-y-4">
        <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
          <h4 className="font-semibold text-warning mb-2">⚠️ Presale Status</h4>
          <p className="text-sm text-gray-300">
            Presale contract needs initialization before real transactions can work.
          </p>
        </div>

        <button
          onClick={handleInitializePresale}
          disabled={loading}
          className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
        >
          {loading ? 'Initializing...' : 'Initialize Presale Contract'}
        </button>

        {status && (
          <div className={`p-3 rounded-lg text-sm ${
            status.includes('✅') 
              ? 'bg-success/10 border border-success/20 text-success'
              : status.includes('❌')
              ? 'bg-error/10 border border-error/20 text-error'  
              : 'bg-info/10 border border-info/20 text-info'
          }`}>
            {status}
          </div>
        )}

        <div className="text-xs text-gray-400 space-y-1">
          <p>• Use this in development to simulate contract initialization</p>
          <p>• In production, this would deploy real smart contracts</p>
          <p>• Demo mode is currently active for UI testing</p>
        </div>
      </div>
    </div>
  );
};
