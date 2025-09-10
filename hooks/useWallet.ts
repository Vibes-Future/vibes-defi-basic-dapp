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
        loading: false,
      }));
      return;
    }

    setWalletState(prev => ({ ...prev, loading: true }));

    try {
      // Get all balances in parallel with proper error handling
      const [solBalance, vibesBalance, usdcBalance] = await Promise.allSettled([
        getSolBalance(publicKey),
        VIBES_MINT ? getTokenBalance(VIBES_MINT, publicKey).catch(() => 0) : Promise.resolve(0),
        USDC_MINT ? getTokenBalance(USDC_MINT, publicKey).catch(() => 0) : Promise.resolve(0),
      ]);

      // Update all state at once to minimize re-renders
      setWalletState(prev => ({
        ...prev,
        connected,
        publicKey: publicKey.toString(),
        solBalance: solBalance.status === 'fulfilled' ? solBalance.value : 0,
        vibesBalance: vibesBalance.status === 'fulfilled' ? vibesBalance.value : 0,
        usdcBalance: usdcBalance.status === 'fulfilled' ? usdcBalance.value : 0,
        loading: false,
      }));
    } catch (error) {
      console.error('Error updating balances:', error);
      setWalletState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    // Only update balances when connection state changes meaningfully
    if (connected && publicKey) {
      const timeoutId = setTimeout(() => {
        updateBalances();
      }, 100); // Reduced delay for better UX
      
      return () => clearTimeout(timeoutId);
    } else if (!connected) {
      // Clear state immediately when disconnected
      setWalletState(prev => ({
        ...prev,
        connected: false,
        publicKey: null,
        solBalance: 0,
        vibesBalance: 0,
        usdcBalance: 0,
        loading: false,
      }));
    }
  }, [connected, publicKey?.toString()]); // Use string comparison to avoid object reference issues

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
