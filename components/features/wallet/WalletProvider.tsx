'use client';

import React, { FC, ReactNode, useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider as BaseWalletProvider,
} from '@solana/wallet-adapter-react';

import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  TrustWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { RPC_ENDPOINT } from '@/lib/config';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletProviderProps {
  children: ReactNode;
}

const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  // Stable RPC endpoint reference
  const endpoint = useMemo(() => RPC_ENDPOINT, []);

  const wallets = useMemo(
    () => {
      const walletList = [
        new PhantomWalletAdapter(),
        new TrustWalletAdapter(),
        new SolflareWalletAdapter(),
        new TorusWalletAdapter(),
        new LedgerWalletAdapter(),
      ];
      
      return walletList;
    },
    []
  );

  const handleError = useMemo(() => (error: Error) => {
    // Professional error handling without excessive logging
    console.error('Wallet Error:', error.message);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <BaseWalletProvider 
        wallets={wallets} 
        autoConnect={true}
        onError={handleError}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </BaseWalletProvider>
    </ConnectionProvider>
  );
};

export default WalletProvider;
