'use client';

import { useEffect, useState } from 'react';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { getSolBalance, getTokenBalance } from '@/lib/solana';
import { VIBES_MINT, USDC_MINT } from '@/lib/config';

export interface WalletState {
  connected: boolean;
  publicKey: string | null;
  solBalance: number;
  vibesBalance: number;
  usdcBalance: number;
  loading: boolean;
}

export const useWallet = () => {
  const { publicKey, connected, wallet, connect, disconnect, signTransaction } = useSolanaWallet();
  
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
    publicKey: null,
    solBalance: 0,
    vibesBalance: 0,
    usdcBalance: 0,
    loading: false,
  });

  const updateBalances = async () => {
    if (!publicKey || !connected) {
      setWalletState(prev => ({
        ...prev,
        connected: false,
        publicKey: null,
        solBalance: 0,
        vibesBalance: 0,
        usdcBalance: 0,
      }));
      return;
    }

    setWalletState(prev => ({ ...prev, loading: true }));

    try {
      // Update SOL balance first (most reliable)
      const solBalance = await getSolBalance(publicKey);
      
      // Update state with SOL balance immediately
      setWalletState(prev => ({
        ...prev,
        connected,
        publicKey: publicKey.toString(),
        solBalance,
        loading: false,
      }));

      // Try to get token balances with delay to avoid rate limiting
      if (VIBES_MINT || USDC_MINT) {
        setTimeout(async () => {
          try {
            const [vibesBalance, usdcBalance] = await Promise.all([
              VIBES_MINT ? getTokenBalance(VIBES_MINT, publicKey) : Promise.resolve(0),
              USDC_MINT ? getTokenBalance(USDC_MINT, publicKey) : Promise.resolve(0),
            ]);

            setWalletState(prev => ({
              ...prev,
              vibesBalance,
              usdcBalance,
            }));
                  } catch {
          console.log('Could not fetch token balances - this is normal if tokens don\'t exist yet');
        }
        }, 1000); // 1 second delay
      }
    } catch (error) {
      console.error('Error updating balances:', error);
      setWalletState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    // Debounce balance updates to avoid too many calls
    const timeoutId = setTimeout(() => {
      updateBalances();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [publicKey, connected]);

  return {
    ...walletState,
    wallet,
    connect,
    disconnect,
    signTransaction,
    updateBalances,
    publicKeyObj: publicKey,
  };
};
