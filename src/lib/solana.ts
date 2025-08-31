import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { RPC_ENDPOINT } from './config';

// Create connection to Solana
export const connection = new Connection(RPC_ENDPOINT, 'confirmed');

/**
 * Get SOL balance for a given public key
 */
export async function getSolBalance(publicKey: PublicKey): Promise<number> {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error getting SOL balance:', error);
    return 0;
  }
}

/**
 * Get token balance for a given mint and owner
 */
export async function getTokenBalance(
  mint: PublicKey,
  owner: PublicKey
): Promise<number> {
  try {
    // Check if mint exists first
    const mintInfo = await connection.getAccountInfo(mint);
    if (!mintInfo) {
      console.log(`Token mint ${mint.toString()} not found`);
      return 0;
    }

    const tokenAccounts = await connection.getTokenAccountsByOwner(owner, {
      mint,
    });

    if (tokenAccounts.value.length === 0) {
      return 0;
    }

    const accountInfo = await connection.getTokenAccountBalance(
      tokenAccounts.value[0].pubkey
    );

    return parseFloat(accountInfo.value.uiAmount?.toString() || '0');
  } catch (error: unknown) {
    // Handle specific error types
    if (error instanceof Error && error.message?.includes('could not find mint')) {
      console.log(`Token mint ${mint.toString()} does not exist on devnet`);
      return 0;
    }
    if (error instanceof Error && (error.message?.includes('429') || error.message?.includes('Too many requests'))) {
      console.log('Rate limited - will retry later');
      return 0;
    }
    console.error('Error getting token balance:', error);
    return 0;
  }
}

/**
 * Request airdrop for devnet testing with better error handling
 */
export async function requestAirdrop(publicKey: PublicKey, amount = 2): Promise<string | null> {
  try {
    console.log(`🚰 Requesting ${amount} SOL airdrop for ${publicKey.toString().slice(0, 8)}...`);
    
    const signature = await connection.requestAirdrop(
      publicKey,
      amount * LAMPORTS_PER_SOL
    );
    
    console.log('⏳ Confirming airdrop transaction...');
    await connection.confirmTransaction(signature);
    console.log('✅ Airdrop confirmed!');
    return signature;
  } catch (error: unknown) {
    console.error('❌ Airdrop failed:', error);
    
    if (error instanceof Error) {
      // Check for rate limit errors
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        throw new Error('⚠️ Airdrop rate limit reached. Try again later or use a different wallet.');
      }
      // Check for daily limit errors
      if (error.message.includes('limit') && error.message.includes('day')) {
        throw new Error('⚠️ Daily airdrop limit reached (1 SOL per project per day). Try again tomorrow.');
      }
      // Check for insufficient funds in faucet
      if (error.message.includes('insufficient') || error.message.includes('faucet')) {
        throw new Error('⚠️ Devnet faucet is temporarily empty. Try again later.');
      }
    }
    
    throw new Error('⚠️ Airdrop failed. You may need to try a different wallet or wait.');
  }
}

/**
 * Confirm transaction
 */
export async function confirmTransaction(signature: string): Promise<boolean> {
  try {
    const confirmation = await connection.confirmTransaction(signature);
    return !confirmation.value.err;
  } catch (error) {
    console.error('Error confirming transaction:', error);
    return false;
  }
}
