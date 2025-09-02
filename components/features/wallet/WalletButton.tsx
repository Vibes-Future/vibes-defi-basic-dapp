'use client';

import React, { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@/hooks/useWallet';

export const WalletButton: React.FC = () => {
  const { connected, publicKey, solBalance, vibesBalance, usdcBalance, loading, updateBalances } = useWallet();
  const [showDetails, setShowDetails] = useState(false);

  const handleRefreshBalances = async () => {
    await updateBalances();
  };

  return (
    <div className="relative">
      {/* Custom styled wallet button */}
      <div className="relative">
        <WalletMultiButton
          style={{
            background: connected ? 'var(--gradient-primary)' : 'transparent',
            color: connected ? 'var(--primary-4)' : 'var(--white)',
            border: connected ? 'none' : '2px solid var(--primary-1)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-2) var(--space-4)',
            fontFamily: 'var(--font-heading)',
            fontWeight: '600',
            fontSize: 'var(--text-sm)',
            boxShadow: connected ? 'var(--shadow-md)' : 'none',
            transition: 'all var(--transition-base)',
            minHeight: '44px', // Touch target
            minWidth: window.innerWidth < 640 ? '120px' : 'auto'
          }}
        />
        
        {/* Connected indicator */}
        {connected && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-bg-primary animate-pulse"></div>
        )}
      </div>
      
      {/* Wallet Details Dropdown */}
      {connected && (
        <div className="mt-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-center text-sm text-gray-300 hover:text-primary-1 transition-colors flex items-center justify-center space-x-2"
          >
            <span>💼 {publicKey?.slice(0, 6)}...{publicKey?.slice(-4)}</span>
            <span className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          {showDetails && (
            <div className="mt-3 card-glass p-4 animate-fade-in">
              {loading ? (
                <div className="text-center text-gray-400 animate-pulse">
                  Loading balances...
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Balance Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-primary-5/30 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">SOL</div>
                      <div className="font-semibold text-white">{solBalance.toFixed(4)}</div>
                    </div>
                    <div className="p-2 bg-primary-5/30 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">VIBES</div>
                      <div className="font-semibold text-primary-1">{vibesBalance.toFixed(2)}</div>
                    </div>
                    <div className="p-2 bg-primary-5/30 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">USDC</div>
                      <div className="font-semibold text-highlight-1">{usdcBalance.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  {/* Refresh Button */}
                  <button
                    onClick={handleRefreshBalances}
                    disabled={loading}
                    className={`btn btn-outline btn-sm w-full ${loading ? 'loading' : ''}`}
                  >
                    {loading ? 'Refreshing...' : '🔄 Refresh Balances'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};