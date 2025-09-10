'use client';

import React, { FC, ReactNode, useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider as BaseWalletProvider,
} from '@solana/wallet-adapter-react';

import {
  // PhantomWalletAdapter, // Removed - Phantom auto-registers as Standard Wallet
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { RPC_ENDPOINT } from '@/lib/config';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletProviderProps {
  children: ReactNode;
}

const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  // Use Helius RPC endpoint directly instead of public Solana RPC
  const endpoint = useMemo(() => RPC_ENDPOINT, []);

  const wallets = useMemo(
    () => [
      // Popular Solana wallets in order of popularity
      // PhantomWalletAdapter removed - Phantom auto-registers as Standard Wallet
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <BaseWalletProvider 
        wallets={wallets} 
        autoConnect={false} // Changed to false to avoid auto-connect conflicts
        onError={(error) => {
          // Suppress common wallet extension errors and Phantom Standard Wallet warnings
          if (error.message.includes('message channel closed') || 
              error.message.includes('listener indicated an asynchronous response') ||
              error.message.includes('Phantom was registered as a Standard Wallet')) {
            console.log('🔔 Wallet info (safe to ignore):', error.message);
            return;
          }
          // Log other wallet errors for debugging
          console.error('❌ WALLET ERROR:', error);
          console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
        }}
      >
        <WalletModalProvider
          features={{
            'mobile-wallet-adapter': true,
          }}
        >
          {children}
        </WalletModalProvider>
      </BaseWalletProvider>
    </ConnectionProvider>
  );
};

export default WalletProvider;
