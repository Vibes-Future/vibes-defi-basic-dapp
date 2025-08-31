import { PublicKey } from '@solana/web3.js';

// Network configuration
export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_HELIUS_RPC_ENDPOINT || 
  'https://api.devnet.solana.com';

// Smart contract program IDs
export const PRESALE_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PRESALE_PROGRAM_ID || 'GS3E6DPPkpkD6dV2vnM7LKiMghiJ4TXk1fzHFistTHQE'
);
export const VESTING_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_VESTING_PROGRAM_ID || 'HXiAcHVkxdpAkeyFtu47mRkcEF3AxjqmGV7kfcunnaLY'
);
export const STAKING_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_STAKING_PROGRAM_ID || 'HNQ66x9jd7tdghh4KyeyJbtEqBC7NDw1CyU5fiERS6DW'
);

// Token mint addresses from deployed smart contracts
export const VIBES_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_VIBES_MINT || '84LT3VSyUEoyyt4u3D4No2fCfHnMdh7noyG2qd8FiQbo'
);

export const USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_USDC_MINT || '3HUzJfpyyFS4XodTRPFkGqjjGo7MHhQqJMwFu1HMkuUe'
);

// Demo mode flag - set to true to simulate transactions without real smart contracts
// Enabled temporarily until presale is initialized
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || true;

// Common constants
export const LAMPORTS_PER_SOL = 1000000000;
export const SOL_DECIMALS = 9;
export const USDC_DECIMALS = 6;
export const VIBES_DECIMALS = 6; // VIBES token uses 6 decimals based on smart contract migration
