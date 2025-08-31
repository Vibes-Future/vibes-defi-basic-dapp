import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';
import { PRESALE_PROGRAM_ID, VIBES_MINT, USDC_MINT, DEMO_MODE } from '@/lib/config';
import { PriceService } from '@/lib/priceService';

export interface PresaleState {
  authority: PublicKey;
  tokenMint: PublicKey;
  usdcMint: PublicKey;
  priceSchedule: PriceTier[];
  startTs: number;
  endTs: number;
  hardCapTotal: number;
  raisedSol: number;
  raisedUsdc: number;
  solVaultPda: PublicKey;
  usdcVaultTokenAccountPda: PublicKey;
  liquiditySolWallet: PublicKey;
  liquidityUsdcWallet: PublicKey;
  bump: number;
  isFinalized: boolean;
}

export interface PriceTier {
  startTs: number;
  priceUsd: number;
}

export interface BuyerState {
  buyer: PublicKey;
  purchasedAmountVibes: number;
  claimedToVesting: boolean;
  bump: number;
}

export class PresaleService {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
    console.log('✅ Simple PresaleService initialized with program ID:', PRESALE_PROGRAM_ID.toString());
  }

  /**
   * Get presale state PDA
   */
  getPresalePDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('presale')],
      PRESALE_PROGRAM_ID
    );
  }

  /**
   * Get buyer state PDA
   */
  getBuyerPDA(buyer: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('buyer'), buyer.toBuffer()],
      PRESALE_PROGRAM_ID
    );
  }

  /**
   * Get SOL vault PDA
   */
  getSolVaultPDA(presaleState: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('sol_vault'), presaleState.toBuffer()],
      PRESALE_PROGRAM_ID
    );
  }

  /**
   * Get USDC vault PDA
   */
  getUsdcVaultPDA(presaleState: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('usdc_vault'), presaleState.toBuffer()],
      PRESALE_PROGRAM_ID
    );
  }

  /**
   * Fetch presale state
   */
  async getPresaleState(): Promise<PresaleState | null> {
    try {
      const [presalePDA] = this.getPresalePDA();
      const accountInfo = await this.connection.getAccountInfo(presalePDA);
      
      if (!accountInfo) {
        console.log('Presale state not found - this is normal if presale is not initialized yet');
        // Return mock data for demo purposes
        return {
          authority: new PublicKey('824Fqqt99SJbyd2mLERNPuoxXSXUAyN8Sefbwn3Vsatu'),
          tokenMint: VIBES_MINT!,
          usdcMint: USDC_MINT!,
          priceSchedule: [
            { startTs: Date.now() / 1000, priceUsd: 0.0598 },
          ],
          startTs: Date.now() / 1000,
          endTs: Date.now() / 1000 + 86400 * 30, // 30 days
          hardCapTotal: 1000000 * LAMPORTS_PER_SOL,
          raisedSol: 0,
          raisedUsdc: 0,
          solVaultPda: this.getSolVaultPDA(presalePDA)[0],
          usdcVaultTokenAccountPda: this.getUsdcVaultPDA(presalePDA)[0],
          liquiditySolWallet: new PublicKey('11111111111111111111111111111111'),
          liquidityUsdcWallet: new PublicKey('11111111111111111111111111111111'),
          bump: 255,
          isFinalized: false,
        };
      }

      // Parse the account data using manual parsing (simplified for now)
      const data = accountInfo.data;
      
      return {
        authority: new PublicKey(data.slice(8, 40)),
        tokenMint: VIBES_MINT!,
        usdcMint: USDC_MINT!,
        priceSchedule: [
          { startTs: Date.now() / 1000, priceUsd: 0.0598 },
        ],
        startTs: Date.now() / 1000,
        endTs: Date.now() / 1000 + 86400 * 30, // 30 days
        hardCapTotal: 1000000 * LAMPORTS_PER_SOL,
        raisedSol: 0,
        raisedUsdc: 0,
        solVaultPda: this.getSolVaultPDA(presalePDA)[0],
        usdcVaultTokenAccountPda: this.getUsdcVaultPDA(presalePDA)[0],
        liquiditySolWallet: new PublicKey('11111111111111111111111111111111'),
        liquidityUsdcWallet: new PublicKey('11111111111111111111111111111111'),
        bump: 255,
        isFinalized: false,
      };
    } catch (error) {
      console.error('Error fetching presale state:', error);
      return null;
    }
  }

  /**
   * Fetch buyer state
   */
  async getBuyerState(buyer: PublicKey): Promise<BuyerState | null> {
    try {
      const [buyerPDA] = this.getBuyerPDA(buyer);
      const accountInfo = await this.connection.getAccountInfo(buyerPDA);
      
      if (!accountInfo) {
        return null;
      }

      // Mock data - replace with proper deserialization
      return {
        buyer,
        purchasedAmountVibes: 0,
        claimedToVesting: false,
        bump: 255,
      };
    } catch (error) {
      console.error('Error fetching buyer state:', error);
      return null;
    }
  }

  /**
   * Get current VIBES price from presale state
   */
  async getCurrentPrice(): Promise<number> {
    try {
      const presaleState = await this.getPresaleState();
      if (presaleState && presaleState.priceSchedule.length > 0) {
        // Find current price tier based on timestamp
        const currentTime = Date.now() / 1000;
        let currentTier = presaleState.priceSchedule[0];
        
        for (const tier of presaleState.priceSchedule) {
          if (tier.startTs <= currentTime) {
            currentTier = tier;
          } else {
            break;
          }
        }
        
        return currentTier.priceUsd;
      }
      return 0.0598; // Fallback price
    } catch (error) {
      console.error('Error getting current price:', error);
      return 0.0598; // Fallback price
    }
  }

  /**
   * Calculate VIBES tokens for SOL amount using real-time pricing
   */
  async calculateVibesForSol(solAmount: number): Promise<number> {
    const [priceUsd, solUsdPrice] = await Promise.all([
      this.getCurrentPrice(),
      PriceService.getSolUsdPrice()
    ]);
    const solUsdValue = solAmount * solUsdPrice;
    return solUsdValue / priceUsd;
  }

  /**
   * Calculate VIBES tokens for USDC amount using real-time pricing
   */
  async calculateVibesForUsdc(usdcAmount: number): Promise<number> {
    const priceUsd = await this.getCurrentPrice();
    return usdcAmount / priceUsd;
  }

  /**
   * Calculate VIBES tokens for SOL amount (synchronous version for UI)
   * Uses cached SOL price when available, otherwise uses fallback
   */
  calculateVibesForSolSync(solAmount: number, solUsdPrice: number = 100): number {
    const priceUsd = 0.0598; // Current tier price
    const solUsdValue = solAmount * solUsdPrice;
    return solUsdValue / priceUsd;
  }

  /**
   * Get real-time SOL price for calculations
   */
  async getSolPrice(): Promise<number> {
    return await PriceService.getSolUsdPrice();
  }

  /**
   * Calculate VIBES tokens for USDC amount (synchronous version for UI)
   */
  calculateVibesForUsdcSync(usdcAmount: number): number {
    const priceUsd = 0.0598; // Current tier price
    return usdcAmount / priceUsd;
  }

  /**
   * Create buy_with_sol instruction with proper discriminator (calculated manually)
   */
  private createBuyWithSolInstruction(
    buyer: PublicKey,
    amountLamports: number,
    presalePDA: PublicKey,
    buyerPDA: PublicKey,
    solVaultPDA: PublicKey
  ): anchor.web3.TransactionInstruction {
    // Discriminator for "buy_with_sol" calculated from Anchor sighash
    const discriminator = Buffer.from([49, 57, 124, 194, 240, 20, 216, 102]);
    
    // Write 64-bit number as two 32-bit values (browser-compatible)
    const amountBuffer = Buffer.alloc(8);
    const amountLow = amountLamports & 0xFFFFFFFF;
    const amountHigh = Math.floor(amountLamports / 0x100000000);
    amountBuffer.writeUInt32LE(amountLow, 0);
    amountBuffer.writeUInt32LE(amountHigh, 4);
    
    const data = Buffer.concat([discriminator, amountBuffer]);

    return new anchor.web3.TransactionInstruction({
      keys: [
        { pubkey: presalePDA, isSigner: false, isWritable: true },
        { pubkey: buyerPDA, isSigner: false, isWritable: true },
        { pubkey: buyer, isSigner: true, isWritable: true },
        { pubkey: solVaultPDA, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: PRESALE_PROGRAM_ID,
      data: data,
    });
  }

  /**
   * Create buy_with_usdc instruction with proper discriminator (calculated manually)
   */
  private createBuyWithUsdcInstruction(
    buyer: PublicKey,
    amountUsdc: number,
    presalePDA: PublicKey,
    buyerPDA: PublicKey,
    buyerUsdcAccount: PublicKey,
    usdcVaultPDA: PublicKey
  ): anchor.web3.TransactionInstruction {
    // Discriminator for "buy_with_usdc" calculated from Anchor sighash
    const discriminator = Buffer.from([33, 209, 211, 124, 55, 142, 122, 212]);
    
    // Write 64-bit number as two 32-bit values (browser-compatible)
    const amountBuffer = Buffer.alloc(8);
    const amountLow = amountUsdc & 0xFFFFFFFF;
    const amountHigh = Math.floor(amountUsdc / 0x100000000);
    amountBuffer.writeUInt32LE(amountLow, 0);
    amountBuffer.writeUInt32LE(amountHigh, 4);
    
    const data = Buffer.concat([discriminator, amountBuffer]);

    return new anchor.web3.TransactionInstruction({
      keys: [
        { pubkey: presalePDA, isSigner: false, isWritable: true },
        { pubkey: buyerPDA, isSigner: false, isWritable: true },
        { pubkey: buyer, isSigner: true, isWritable: true },
        { pubkey: buyerUsdcAccount, isSigner: false, isWritable: true },
        { pubkey: usdcVaultPDA, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: PRESALE_PROGRAM_ID,
      data: data,
    });
  }

  /**
   * Buy tokens with SOL using manual instruction creation
   */
  async buyWithSol(
    buyer: PublicKey,
    amountSol: number,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
  ): Promise<string | null> {
    if (DEMO_MODE) {
      console.log('🎭 DEMO MODE: Simulating buyWithSol transaction...');
      // Simulate a realistic transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ DEMO MODE: Transaction simulation completed successfully!');
      return 'DEMO_TX_SOL_' + Math.random().toString(36).substr(2, 9);
    }

    try {
      const [presalePDA] = this.getPresalePDA();
      const [buyerPDA] = this.getBuyerPDA(buyer);
      const [solVaultPDA] = this.getSolVaultPDA(presalePDA);

      const amountLamports = Math.floor(amountSol * LAMPORTS_PER_SOL);

      // Check if presale is active
      const presaleState = await this.getPresaleState();
      if (!presaleState) {
        throw new Error('Presale not initialized');
      }
      
      const currentTime = Date.now() / 1000;
      if (currentTime < presaleState.startTs || currentTime > presaleState.endTs) {
        throw new Error('Presale is not currently active');
      }

      console.log('🔧 Creating buyWithSol transaction...');
      console.log('   Amount SOL:', amountSol);
      console.log('   Amount Lamports:', amountLamports);
      console.log('   Presale PDA:', presalePDA.toString());
      console.log('   Buyer PDA:', buyerPDA.toString());
      console.log('   SOL Vault PDA:', solVaultPDA.toString());

      const instruction = this.createBuyWithSolInstruction(
        buyer,
        amountLamports,
        presalePDA,
        buyerPDA,
        solVaultPDA
      );

      const transaction = new Transaction().add(instruction);
      transaction.feePayer = buyer;
      
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      console.log('✅ Transaction created, requesting signature...');
      const signedTransaction = await signTransaction(transaction);
      
      console.log('📡 Sending transaction...');
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());
      
      console.log('⏳ Confirming transaction...');
      await this.connection.confirmTransaction(signature);
      
      console.log('🎉 Transaction confirmed:', signature);
      return signature;
    } catch (error) {
      console.error('❌ Error buying with SOL:', error);
      return null;
    }
  }

  /**
   * Buy tokens with USDC using manual instruction creation
   */
  async buyWithUsdc(
    buyer: PublicKey,
    amountUsdc: number,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
  ): Promise<string | null> {
    if (DEMO_MODE) {
      console.log('🎭 DEMO MODE: Simulating buyWithUsdc transaction...');
      // Simulate a realistic transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ DEMO MODE: Transaction simulation completed successfully!');
      return 'DEMO_TX_USDC_' + Math.random().toString(36).substr(2, 9);
    }

    try {
      if (!USDC_MINT) {
        throw new Error('USDC mint not configured');
      }

      const [presalePDA] = this.getPresalePDA();
      const [buyerPDA] = this.getBuyerPDA(buyer);
      const [usdcVaultPDA] = this.getUsdcVaultPDA(presalePDA);

      // Get buyer's USDC token account
      const buyerUsdcAccount = await getAssociatedTokenAddress(USDC_MINT, buyer);

      const amountUsdcBase = Math.floor(amountUsdc * 1000000); // USDC has 6 decimals

      // Check if presale is active
      const presaleState = await this.getPresaleState();
      if (!presaleState) {
        throw new Error('Presale not initialized');
      }
      
      const currentTime = Date.now() / 1000;
      if (currentTime < presaleState.startTs || currentTime > presaleState.endTs) {
        throw new Error('Presale is not currently active');
      }

      console.log('🔧 Creating buyWithUsdc transaction...');
      console.log('   Amount USDC:', amountUsdc);
      console.log('   Amount Base Units:', amountUsdcBase);

      const instruction = this.createBuyWithUsdcInstruction(
        buyer,
        amountUsdcBase,
        presalePDA,
        buyerPDA,
        buyerUsdcAccount,
        usdcVaultPDA
      );

      const transaction = new Transaction();

      // Check if USDC account exists, create if needed
      const usdcAccountInfo = await this.connection.getAccountInfo(buyerUsdcAccount);
      if (!usdcAccountInfo) {
        const createAccountIx = createAssociatedTokenAccountInstruction(
          buyer,
          buyerUsdcAccount,
          buyer,
          USDC_MINT
        );
        transaction.add(createAccountIx);
      }

      transaction.add(instruction);
      transaction.feePayer = buyer;
      
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTransaction = await signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());
      
      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Error buying with USDC:', error);
      return null;
    }
  }
}
