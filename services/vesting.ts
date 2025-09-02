import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';
import { VESTING_PROGRAM_ID, VIBES_MINT } from '@/lib/config';

export interface VestingSchedule {
  authority: PublicKey;
  beneficiary: PublicKey;
  tokenMint: PublicKey;
  totalAmount: number;
  claimedAmount: number;
  listingTs: number; // Listing timestamp (start of cliff)
  vaultTokenAccountPda: PublicKey;
  isCancelled: boolean;
  bump: number;
}

export class VestingService {
  private connection: Connection;
  private programId: PublicKey;

  constructor(connection: Connection) {
    this.connection = connection;
    this.programId = VESTING_PROGRAM_ID;
  }

  /**
   * Get vesting schedule PDA
   */
  getVestingSchedulePDA(beneficiary: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('vesting'), beneficiary.toBuffer()],
      this.programId
    );
  }

  /**
   * Get vesting vault PDA
   */
  getVestingVaultPDA(vestingSchedule: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('vesting_vault'), vestingSchedule.toBuffer()],
      this.programId
    );
  }

  /**
   * Fetch vesting schedule
   */
  async getVestingSchedule(beneficiary: PublicKey): Promise<VestingSchedule | null> {
    try {
      const [vestingSchedulePDA] = this.getVestingSchedulePDA(beneficiary);
      const accountInfo = await this.connection.getAccountInfo(vestingSchedulePDA);
      
      if (!accountInfo) {
        return null;
      }

      // Mock data - replace with proper deserialization
      return {
        authority: new PublicKey('11111111111111111111111111111111'),
        beneficiary,
        tokenMint: VIBES_MINT!,
        totalAmount: 0,
        claimedAmount: 0,
        listingTs: Date.now() / 1000,
        vaultTokenAccountPda: this.getVestingVaultPDA(vestingSchedulePDA)[0],
        isCancelled: false,
        bump: 255,
      };
    } catch (error) {
      console.error('Error fetching vesting schedule:', error);
      return null;
    }
  }

  /**
   * Calculate vested amount based on current time with detailed breakdown
   * Vesting Logic:
   * - 1 year cliff
   * - 40% released after cliff
   * - 20% released each month for 3 months (60% total over 3 months)
   */
  calculateVestedAmount(vestingSchedule: VestingSchedule, currentTs?: number): {
    vestedAmount: number;
    claimableAmount: number;
    nextVestingDate: number | null;
    vestingProgress: number;
    cliffEndDate: Date;
    isInCliff: boolean;
    monthlyReleasesDone: number;
  } {
    const now = currentTs || Date.now() / 1000;
    const { totalAmount, claimedAmount, listingTs } = vestingSchedule;

    // 1 year cliff
    const cliffEndTs = listingTs + (365 * 24 * 60 * 60); // 1 year
    
    if (now < cliffEndTs) {
      // Still in cliff period
      return {
        vestedAmount: 0,
        claimableAmount: 0,
        nextVestingDate: cliffEndTs,
        vestingProgress: 0,
        cliffEndDate: new Date(cliffEndTs * 1000),
        isInCliff: true,
        monthlyReleasesDone: 0,
      };
    }

    // After cliff: 40% immediately available
    let vestedAmount = totalAmount * 0.4;

    // Calculate months after cliff
    const monthsAfterCliff = Math.floor((now - cliffEndTs) / (30 * 24 * 60 * 60));
    
    // Add 20% for each completed month (max 3 months)
    const monthlyReleases = Math.min(monthsAfterCliff, 3);
    vestedAmount += totalAmount * 0.2 * monthlyReleases;

    // Cap at total amount
    vestedAmount = Math.min(vestedAmount, totalAmount);

    const claimableAmount = Math.max(0, vestedAmount - claimedAmount);

    // Calculate next vesting date
    let nextVestingDate = null;
    if (monthlyReleases < 3) {
      const nextMonthIndex = monthlyReleases + 1;
      nextVestingDate = cliffEndTs + (nextMonthIndex * 30 * 24 * 60 * 60);
    }

    const vestingProgress = totalAmount > 0 ? (vestedAmount / totalAmount) * 100 : 0;

    return {
      vestedAmount,
      claimableAmount,
      nextVestingDate,
      vestingProgress,
      cliffEndDate: new Date(cliffEndTs * 1000),
      isInCliff: now < cliffEndTs,
      monthlyReleasesDone: monthlyReleases,
    };
  }

  /**
   * Create vesting schedule
   */
  async createSchedule(
    authority: PublicKey,
    beneficiary: PublicKey,
    totalAmount: number,
    listingTs: number,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
  ): Promise<string | null> {
    try {
      if (!VIBES_MINT) {
        throw new Error('VIBES mint not configured');
      }

      const [vestingSchedulePDA] = this.getVestingSchedulePDA(beneficiary);
      const [vaultTokenAccountPDA] = this.getVestingVaultPDA(vestingSchedulePDA);

      const totalAmountTokens = Math.floor(totalAmount * 1000000); // VIBES has 6 decimals

      // Create instruction data (simplified)
      const instructionData = Buffer.alloc(24);
      instructionData.writeUInt32LE(0, 0); // Instruction discriminator for create_schedule
      
      // Write 64-bit token amount as two 32-bit values (little endian)
      const tokenAmountLow = totalAmountTokens & 0xFFFFFFFF;
      const tokenAmountHigh = Math.floor(totalAmountTokens / 0x100000000);
      instructionData.writeUInt32LE(tokenAmountLow, 8);
      instructionData.writeUInt32LE(tokenAmountHigh, 12);
      
      // Write 64-bit timestamp as two 32-bit values (little endian)
      const timestampLow = listingTs & 0xFFFFFFFF;
      const timestampHigh = Math.floor(listingTs / 0x100000000);
      instructionData.writeUInt32LE(timestampLow, 16);
      instructionData.writeUInt32LE(timestampHigh, 20);

      const instruction = new anchor.web3.TransactionInstruction({
        keys: [
          { pubkey: vestingSchedulePDA, isSigner: false, isWritable: true },
          { pubkey: VIBES_MINT, isSigner: false, isWritable: false },
          { pubkey: authority, isSigner: true, isWritable: true },
          { pubkey: beneficiary, isSigner: false, isWritable: false },
          { pubkey: vaultTokenAccountPDA, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId: this.programId,
        data: instructionData,
      });

      const transaction = new Transaction().add(instruction);
      transaction.feePayer = authority;
      
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTransaction = await signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());
      
      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Error creating vesting schedule:', error);
      return null;
    }
  }

  /**
   * Claim vested tokens
   */
  async claim(
    beneficiary: PublicKey,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
  ): Promise<string | null> {
    try {
      if (!VIBES_MINT) {
        throw new Error('VIBES mint not configured');
      }

      const [vestingSchedulePDA] = this.getVestingSchedulePDA(beneficiary);
      const [vaultTokenAccountPDA] = this.getVestingVaultPDA(vestingSchedulePDA);

      // Get beneficiary's VIBES token account
      const beneficiaryVibesAccount = await getAssociatedTokenAddress(VIBES_MINT, beneficiary);

      // Create instruction data (simplified)
      const instructionData = Buffer.alloc(8);
      instructionData.writeUInt32LE(1, 0); // Instruction discriminator for claim

      const instruction = new anchor.web3.TransactionInstruction({
        keys: [
          { pubkey: vestingSchedulePDA, isSigner: false, isWritable: true },
          { pubkey: beneficiary, isSigner: true, isWritable: true },
          { pubkey: vaultTokenAccountPDA, isSigner: false, isWritable: true },
          { pubkey: beneficiaryVibesAccount, isSigner: false, isWritable: true },
          { pubkey: VIBES_MINT, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId: this.programId,
        data: instructionData,
      });

      const transaction = new Transaction();

      // Check if VIBES account exists, create if needed
      const vibesAccountInfo = await this.connection.getAccountInfo(beneficiaryVibesAccount);
      if (!vibesAccountInfo) {
        const createAccountIx = createAssociatedTokenAccountInstruction(
          beneficiary,
          beneficiaryVibesAccount,
          beneficiary,
          VIBES_MINT
        );
        transaction.add(createAccountIx);
      }

      transaction.add(instruction);
      transaction.feePayer = beneficiary;
      
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTransaction = await signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());
      
      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Error claiming vested tokens:', error);
      return null;
    }
  }

  /**
   * Cancel vesting schedule
   */
  async cancel(
    beneficiary: PublicKey,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
  ): Promise<string | null> {
    try {
      if (!VIBES_MINT) {
        throw new Error('VIBES mint not configured');
      }

      const [vestingSchedulePDA] = this.getVestingSchedulePDA(beneficiary);
      const [vaultTokenAccountPDA] = this.getVestingVaultPDA(vestingSchedulePDA);

      // Get beneficiary's VIBES token account
      const beneficiaryVibesAccount = await getAssociatedTokenAddress(VIBES_MINT, beneficiary);

      // Create instruction data (simplified)
      const instructionData = Buffer.alloc(8);
      instructionData.writeUInt32LE(2, 0); // Instruction discriminator for cancel

      const instruction = new anchor.web3.TransactionInstruction({
        keys: [
          { pubkey: vestingSchedulePDA, isSigner: false, isWritable: true },
          { pubkey: beneficiary, isSigner: true, isWritable: false },
          { pubkey: vaultTokenAccountPDA, isSigner: false, isWritable: true },
          { pubkey: beneficiaryVibesAccount, isSigner: false, isWritable: true },
          { pubkey: VIBES_MINT, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId: this.programId,
        data: instructionData,
      });

      const transaction = new Transaction().add(instruction);
      transaction.feePayer = beneficiary;
      
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTransaction = await signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());
      
      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Error canceling vesting schedule:', error);
      return null;
    }
  }
}
