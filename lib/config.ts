import { PublicKey } from '@solana/web3.js';

// Network configuration
export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 
  process.env.NEXT_PUBLIC_HELIUS_RPC_ENDPOINT || 
  'https://devnet.helius-rpc.com/?api-key=your-api-key';

// String constants for program IDs (converted to PublicKey when needed)
// Updated with deployed devnet addresses from Docker environment
export const PRESALE_PROGRAM_ID_STRING = 
  process.env.NEXT_PUBLIC_PRESALE_PROGRAM_ID || 'GEHYySidFB8XWXkPFBrnfgqEhoA8sGeMZooUouqZuP7S';
export const VESTING_PROGRAM_ID_STRING = 
  process.env.NEXT_PUBLIC_VESTING_PROGRAM_ID || '37QayjEeVsvBJfoUwgpWCLyon5zbMyPqg4iLDLzjwYyk';
export const STAKING_PROGRAM_ID_STRING = 
  process.env.NEXT_PUBLIC_STAKING_PROGRAM_ID || 'FPhhnGDDLECMQYzcZrxqq5GKCcECmhuLeEepy3mCE5TX';

// Token mint address strings
// Updated with deployed devnet addresses from Docker environment
export const VIBES_MINT_STRING = 
  process.env.NEXT_PUBLIC_VIBES_MINT || '3PpEoHtqRBTvWopXp37m3TUid3fPhTMhC8fid82xHPY6';
export const USDC_MINT_STRING = 
  process.env.NEXT_PUBLIC_USDC_MINT || 'ANzKJEL57EUNiqkeWExXoMEG78AN5kcxB4c1hUshNJmy';

// Helper functions to create PublicKeys safely (only on client side)
export const getPresaleProgramId = () => new PublicKey(PRESALE_PROGRAM_ID_STRING);
export const getVestingProgramId = () => new PublicKey(VESTING_PROGRAM_ID_STRING);
export const getStakingProgramId = () => new PublicKey(STAKING_PROGRAM_ID_STRING);
export const getVibesMint = () => new PublicKey(VIBES_MINT_STRING);
export const getUsdcMint = () => new PublicKey(USDC_MINT_STRING);

// Lazy-loaded PublicKey instances to avoid build-time issues
let _PRESALE_PROGRAM_ID: PublicKey | null = null;
let _VESTING_PROGRAM_ID: PublicKey | null = null;
let _STAKING_PROGRAM_ID: PublicKey | null = null;
let _VIBES_MINT: PublicKey | null = null;
let _USDC_MINT: PublicKey | null = null;

// Backwards compatibility exports with lazy loading
export const PRESALE_PROGRAM_ID = new Proxy({} as PublicKey, {
  get(target, prop) {
    if (!_PRESALE_PROGRAM_ID) _PRESALE_PROGRAM_ID = getPresaleProgramId();
    return (_PRESALE_PROGRAM_ID as any)[prop];
  }
});

export const VESTING_PROGRAM_ID = new Proxy({} as PublicKey, {
  get(target, prop) {
    if (!_VESTING_PROGRAM_ID) _VESTING_PROGRAM_ID = getVestingProgramId();
    return (_VESTING_PROGRAM_ID as any)[prop];
  }
});

export const STAKING_PROGRAM_ID = new Proxy({} as PublicKey, {
  get(target, prop) {
    if (!_STAKING_PROGRAM_ID) _STAKING_PROGRAM_ID = getStakingProgramId();
    return (_STAKING_PROGRAM_ID as any)[prop];
  }
});

export const VIBES_MINT = new Proxy({} as PublicKey, {
  get(target, prop) {
    if (!_VIBES_MINT) _VIBES_MINT = getVibesMint();
    return (_VIBES_MINT as any)[prop];
  }
});

export const USDC_MINT = new Proxy({} as PublicKey, {
  get(target, prop) {
    if (!_USDC_MINT) _USDC_MINT = getUsdcMint();
    return (_USDC_MINT as any)[prop];
  }
});

// Demo mode flag - disabled for production use with real contracts
export const DEMO_MODE = false;

// Common constants
export const LAMPORTS_PER_SOL = 1000000000;
export const SOL_DECIMALS = 9;
export const USDC_DECIMALS = 6;
export const VIBES_DECIMALS = 9; // VIBES token uses 9 decimals (standard Solana)
