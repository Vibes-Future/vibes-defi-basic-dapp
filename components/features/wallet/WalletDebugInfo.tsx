'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

interface WalletDebugInfoProps {
  showDebug?: boolean;
}

/**
 * Professional wallet debugging component
 * Only shows debug info when explicitly enabled
 * Provides clean monitoring without excessive console logging
 */
const WalletDebugInfo: React.FC<WalletDebugInfoProps> = ({ showDebug = false }) => {
  const { publicKey, connected, connecting, wallet, wallets } = useWallet();
  const { visible } = useWalletModal();

  if (!showDebug) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg text-xs font-mono max-w-xs z-50">
      <div className="mb-2 font-bold text-green-400">Wallet Debug Info</div>
      <div className="space-y-1">
        <div>
          <span className="text-blue-300">Connected:</span> {connected ? '✅' : '❌'}
        </div>
        <div>
          <span className="text-blue-300">Connecting:</span> {connecting ? '⏳' : '⭕'}
        </div>
        <div>
          <span className="text-blue-300">Modal Visible:</span> {visible ? '👁️' : '👁️‍🗨️'}
        </div>
        <div>
          <span className="text-blue-300">Current Wallet:</span> {wallet?.adapter?.name || 'None'}
        </div>
        <div>
          <span className="text-blue-300">Available Wallets:</span> {wallets.length}
        </div>
        <div>
          <span className="text-blue-300">Public Key:</span> 
          {publicKey ? `${publicKey.toString().slice(0, 8)}...` : 'None'}
        </div>
        <div>
          <span className="text-blue-300">Phantom:</span> 
          {typeof window !== 'undefined' && window.solana?.isPhantom ? '✅' : '❌'}
        </div>
        <div>
          <span className="text-blue-300">Trust:</span> 
          {typeof window !== 'undefined' && window.trustwallet ? '✅' : '❌'}
        </div>
      </div>
    </div>
  );
};

export default WalletDebugInfo;
