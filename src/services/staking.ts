import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';
import { STAKING_PROGRAM_ID, VIBES_MINT, DEMO_MODE } from '@/lib/config';

export interface StakePool {
  authority: PublicKey;
  stakeMint: PublicKey;
  rewardMint: PublicKey;
  apyBps: number; // APY in basis points (4000 = 40%)
  slotsPerYear: number;
  globalCap: number;
  totalStaked: number;
  totalRewards: number;
  lastUpdateSlot: number;
  stakeVaultTokenAccountPda: PublicKey;
  rewardVaultTokenAccountPda: PublicKey;
  charityWallet: PublicKey;
  rewardWallet: PublicKey;
  bump: number;
}

export interface UserStake {
  owner: PublicKey;
  stakeAmount: number;
  rewardDebt: number;
  lastStakeTs: number;
  bump: number;
}

export class StakingService {
  private connection: Connection;
  private programId: PublicKey;

  constructor(connection: Connection) {
    this.connection = connection;
    this.programId = STAKING_PROGRAM_ID;
  }

  /**
   * Get stake pool PDA
   */
  getStakePoolPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('pool')],
      this.programId
    );
  }

  /**
   * Get user stake PDA
   */
  getUserStakePDA(user: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('stake'), user.toBuffer()],
      this.programId
    );
  }

  /**
   * Get stake vault PDA
   */
  getStakeVaultPDA(stakePool: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('stake_vault'), stakePool.toBuffer()],
      this.programId
    );
  }

  /**
   * Get reward vault PDA
   */
  getRewardVaultPDA(stakePool: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('reward_vault'), stakePool.toBuffer()],
      this.programId
    );
  }

  /**
   * Fetch stake pool state
   */
  async getStakePool(): Promise<StakePool | null> {
    try {
      const [stakePoolPDA] = this.getStakePoolPDA();
      const accountInfo = await this.connection.getAccountInfo(stakePoolPDA);
      
      if (!accountInfo) {
        console.log('Staking pool not initialized yet - this is normal for testing');
        // Return mock data for demo purposes
        return {
          authority: new PublicKey('11111111111111111111111111111111'),
          stakeMint: VIBES_MINT!,
          rewardMint: VIBES_MINT!,
          apyBps: 4000, // 40% APY
          slotsPerYear: 63072000, // Approximate slots per year
          globalCap: 1000000000, // 1B tokens
          totalStaked: 0,
          totalRewards: 0,
          lastUpdateSlot: 0,
          stakeVaultTokenAccountPda: this.getStakeVaultPDA(stakePoolPDA)[0],
          rewardVaultTokenAccountPda: this.getRewardVaultPDA(stakePoolPDA)[0],
          charityWallet: new PublicKey('11111111111111111111111111111111'),
          rewardWallet: new PublicKey('11111111111111111111111111111111'),
          bump: 255,
        };
      }

      // Mock data - replace with proper deserialization
      return {
        authority: new PublicKey('11111111111111111111111111111111'),
        stakeMint: VIBES_MINT!,
        rewardMint: VIBES_MINT!,
        apyBps: 4000, // 40% APY
        slotsPerYear: 63072000, // Approximate slots per year
        globalCap: 1000000000, // 1B tokens
        totalStaked: 0,
        totalRewards: 0,
        lastUpdateSlot: 0,
        stakeVaultTokenAccountPda: this.getStakeVaultPDA(stakePoolPDA)[0],
        rewardVaultTokenAccountPda: this.getRewardVaultPDA(stakePoolPDA)[0],
        charityWallet: new PublicKey('11111111111111111111111111111111'),
        rewardWallet: new PublicKey('11111111111111111111111111111111'),
        bump: 255,
      };
    } catch (error) {
      console.error('Error fetching stake pool:', error);
      return null;
    }
  }

  /**
   * Fetch user stake state
   */
  async getUserStake(user: PublicKey): Promise<UserStake | null> {
    try {
      const [userStakePDA] = this.getUserStakePDA(user);
      const accountInfo = await this.connection.getAccountInfo(userStakePDA);
      
      if (!accountInfo) {
        return null;
      }

      // Mock data - replace with proper deserialization
      return {
        owner: user,
        stakeAmount: 0,
        rewardDebt: 0,
        lastStakeTs: Date.now() / 1000,
        bump: 255,
      };
    } catch (error) {
      console.error('Error fetching user stake:', error);
      return null;
    }
  }

  /**
   * Calculate pending rewards for a user based on real staking time
   */
  calculatePendingRewards(userStake: UserStake, stakePool: StakePool): number {
    if (userStake.stakeAmount === 0) return 0;
    
    const currentTime = Date.now() / 1000;
    const timeStaked = Math.max(0, currentTime - userStake.lastStakeTs);
    const secondsPerYear = 365 * 24 * 60 * 60;
    
    // Calculate APY: 40% = 0.4 (4000 basis points)
    const apy = stakePool.apyBps / 10000;
    const rewardPerSecond = (userStake.stakeAmount * apy) / secondsPerYear;
    
    // Apply 3% charity fee (97% goes to user)
    const userRewardPerSecond = rewardPerSecond * 0.97;
    
    return userRewardPerSecond * timeStaked;
  }

  /**
   * Get real-time staking statistics
   */
  async getStakingStats(): Promise<{
    totalStaked: number;
    totalStakers: number;
    averageApy: number;
    totalRewardsDistributed: number;
  }> {
    try {
      const stakePool = await this.getStakePool();
      if (!stakePool) {
        return {
          totalStaked: 0,
          totalStakers: 0,
          averageApy: 0,
          totalRewardsDistributed: 0
        };
      }

      return {
        totalStaked: stakePool.totalStaked,
        totalStakers: 0, // Would need to track this in contract
        averageApy: stakePool.apyBps / 100, // Convert to percentage
        totalRewardsDistributed: stakePool.totalRewards
      };
    } catch (error) {
      console.error('Error getting staking stats:', error);
      return {
        totalStaked: 0,
        totalStakers: 0,
        averageApy: 0,
        totalRewardsDistributed: 0
      };
    }
  }

  /**
   * Stake VIBES tokens
   */
  async stake(
    user: PublicKey,
    amount: number,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
  ): Promise<string | null> {
    if (DEMO_MODE) {
      console.log('🎭 DEMO MODE: Simulating stake transaction...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ DEMO MODE: Stake simulation completed successfully!');
      return 'DEMO_TX_STAKE_' + Math.random().toString(36).substr(2, 9);
    }

    try {
      if (!VIBES_MINT) {
        throw new Error('VIBES mint not configured');
      }

      const [stakePoolPDA] = this.getStakePoolPDA();
      const [userStakePDA] = this.getUserStakePDA(user);
      const [stakeVaultPDA] = this.getStakeVaultPDA(stakePoolPDA);

      // Get user's VIBES token account
      const userVibesAccount = await getAssociatedTokenAddress(VIBES_MINT, user);

      const amountTokens = Math.floor(amount * 1000000); // VIBES has 6 decimals

      // Create instruction data (simplified)
      const instructionData = Buffer.alloc(16);
      instructionData.writeUInt32LE(1, 0); // Instruction discriminator for stake
      
      // Write 64-bit amount as two 32-bit values (little endian)
      const amountLow = amountTokens & 0xFFFFFFFF;
      const amountHigh = Math.floor(amountTokens / 0x100000000);
      instructionData.writeUInt32LE(amountLow, 8);
      instructionData.writeUInt32LE(amountHigh, 12);

      const instruction = new anchor.web3.TransactionInstruction({
        keys: [
          { pubkey: stakePoolPDA, isSigner: false, isWritable: true },
          { pubkey: userStakePDA, isSigner: false, isWritable: true },
          { pubkey: user, isSigner: true, isWritable: true },
          { pubkey: userVibesAccount, isSigner: false, isWritable: true },
          { pubkey: stakeVaultPDA, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId: this.programId,
        data: instructionData,
      });

      const transaction = new Transaction();

      // Check if VIBES account exists, create if needed
      const vibesAccountInfo = await this.connection.getAccountInfo(userVibesAccount);
      if (!vibesAccountInfo) {
        const createAccountIx = createAssociatedTokenAccountInstruction(
          user,
          userVibesAccount,
          user,
          VIBES_MINT
        );
        transaction.add(createAccountIx);
      }

      transaction.add(instruction);
      transaction.feePayer = user;
      
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTransaction = await signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());
      
      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Error staking:', error);
      return null;
    }
  }

  /**
   * Unstake VIBES tokens
   */
  async unstake(
    user: PublicKey,
    amount: number,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
  ): Promise<string | null> {
    try {
      if (!VIBES_MINT) {
        throw new Error('VIBES mint not configured');
      }

      const [stakePoolPDA] = this.getStakePoolPDA();
      const [userStakePDA] = this.getUserStakePDA(user);
      const [stakeVaultPDA] = this.getStakeVaultPDA(stakePoolPDA);

      // Get user's VIBES token account
      const userVibesAccount = await getAssociatedTokenAddress(VIBES_MINT, user);

      const amountTokens = Math.floor(amount * 1000000); // VIBES has 6 decimals

      // Create instruction data (simplified)
      const instructionData = Buffer.alloc(16);
      instructionData.writeUInt32LE(2, 0); // Instruction discriminator for unstake
      
      // Write 64-bit amount as two 32-bit values (little endian)
      const amountLow = amountTokens & 0xFFFFFFFF;
      const amountHigh = Math.floor(amountTokens / 0x100000000);
      instructionData.writeUInt32LE(amountLow, 8);
      instructionData.writeUInt32LE(amountHigh, 12);

      const instruction = new anchor.web3.TransactionInstruction({
        keys: [
          { pubkey: stakePoolPDA, isSigner: false, isWritable: true },
          { pubkey: userStakePDA, isSigner: false, isWritable: true },
          { pubkey: user, isSigner: true, isWritable: true },
          { pubkey: userVibesAccount, isSigner: false, isWritable: true },
          { pubkey: stakeVaultPDA, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId: this.programId,
        data: instructionData,
      });

      const transaction = new Transaction().add(instruction);
      transaction.feePayer = user;
      
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTransaction = await signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());
      
      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Error unstaking:', error);
      return null;
    }
  }

  /**
   * Claim staking rewards
   */
  async claimRewards(
    user: PublicKey,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
  ): Promise<string | null> {
    try {
      if (!VIBES_MINT) {
        throw new Error('VIBES mint not configured');
      }

      const [stakePoolPDA] = this.getStakePoolPDA();
      const [userStakePDA] = this.getUserStakePDA(user);
      const [rewardVaultPDA] = this.getRewardVaultPDA(stakePoolPDA);

      // Get user's VIBES token account
      const userVibesAccount = await getAssociatedTokenAddress(VIBES_MINT, user);

      // Get charity wallet (mock for now)
      const charityWallet = await getAssociatedTokenAddress(
        VIBES_MINT, 
        new PublicKey('11111111111111111111111111111111')
      );

      // Create instruction data (simplified)
      const instructionData = Buffer.alloc(8);
      instructionData.writeUInt32LE(3, 0); // Instruction discriminator for claim_reward

      const instruction = new anchor.web3.TransactionInstruction({
        keys: [
          { pubkey: stakePoolPDA, isSigner: false, isWritable: true },
          { pubkey: userStakePDA, isSigner: false, isWritable: true },
          { pubkey: user, isSigner: true, isWritable: true },
          { pubkey: userVibesAccount, isSigner: false, isWritable: true },
          { pubkey: charityWallet, isSigner: false, isWritable: true },
          { pubkey: rewardVaultPDA, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId: this.programId,
        data: instructionData,
      });

      const transaction = new Transaction().add(instruction);
      transaction.feePayer = user;
      
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTransaction = await signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());
      
      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Error claiming rewards:', error);
      return null;
    }
  }
}
