import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';
import { PRESALE_PROGRAM_ID, VIBES_MINT, USDC_MINT, DEMO_MODE } from '@/lib/config';

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
  private program: anchor.Program | null = null;

  constructor(connection: Connection) {
    this.connection = connection;
    this.initializeProgram();
  }

  private async initializeProgram() {
    try {
      console.log('🔧 Initializing Anchor program...');
      console.log('📋 PRESALE_PROGRAM_ID:', PRESALE_PROGRAM_ID);
      console.log('🌐 Fetching IDL from /presale_program.json...');
      
      // Load IDL dynamically
      const response = await fetch('/presale_program.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch IDL: ${response.status} ${response.statusText}`);
      }
      
      const presaleIdl = await response.json();
      console.log('✅ IDL loaded successfully:', presaleIdl.name);
      
      // Create a dummy wallet for read-only operations
      const dummyWallet = {
        publicKey: PublicKey.default,
        signTransaction: async () => { throw new Error('Not implemented'); },
        signAllTransactions: async () => { throw new Error('Not implemented'); }
      };
      
      console.log('🔐 Creating AnchorProvider...');
      const provider = new anchor.AnchorProvider(this.connection, dummyWallet, {});
      
      console.log('📡 Creating Anchor Program with:');
      console.log('   IDL:', presaleIdl.name);
      console.log('   Program ID:', PRESALE_PROGRAM_ID.toString());
      
      this.program = new anchor.Program(presaleIdl as anchor.Idl, provider);
      console.log('✅ Anchor program initialized successfully!');
    } catch (error) {
      console.error('❌ Failed to initialize Anchor program:', error);
      this.program = null;
    }
  }

  /**
   * Get presale state PDA
   */
  getPresalePDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('presale_state')],
      PRESALE_PROGRAM_ID
    );
  }

  /**
   * Get buyer state PDA
   */
  getBuyerPDA(buyer: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('buyer_state'), buyer.toBuffer()],
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
        console.log('❌ Presale state not found at PDA:', presalePDA.toString());
        console.log('🔍 Expected PDA from keypairs.json: 7eNN8j92e3wBUUWTowTcZDBU72Hv56VLtpgafHQgcHST');
        console.log('🔍 Calculated PDA:', presalePDA.toString());
        console.log('📋 Program ID:', PRESALE_PROGRAM_ID.toString());
        
        // Return mock data to allow frontend to work while debugging
        return {
          authority: new PublicKey('DsdeSisDE3djpMJdjDeaUH26giPxdcF3FqEJzdjf9Uwq'), // Real authority from keypairs.json
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
          liquiditySolWallet: new PublicKey('CXDPqBqDfodrvvvUDHVXBBahYpGx1WwbZHzeaDrQfWyM'), // Real liquidity wallets from keypairs.json
          liquidityUsdcWallet: new PublicKey('FTZP2Wxev5m4nayY3Atre3H1diHf6Sk45T53jdMhsCsS'),
          bump: 255,
          isFinalized: false,
        };
      }

      // Parse the account data using Anchor (simplified for now)
      // TODO: Implement proper account deserialization with Anchor
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
   * Calculate VIBES tokens for SOL amount
   */
  calculateVibesForSol(solAmount: number, solUsdPrice: number = 100): number {
    const priceUsd = 0.0598; // Current tier price
    const solUsdValue = solAmount * solUsdPrice;
    return solUsdValue / priceUsd;
  }

  /**
   * Calculate VIBES tokens for USDC amount
   */
  calculateVibesForUsdc(usdcAmount: number): number {
    const priceUsd = 0.0598; // Current tier price
    return usdcAmount / priceUsd;
  }

  /**
   * Buy tokens with SOL using Anchor IDL
   */
  async buyWithSol(
    buyer: PublicKey,
    amountSol: number,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
  ): Promise<string | null> {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Simulating buyWithSol transaction.');
      return 'DEMO_TX_SIMULATED_SOL';
    }

    try {
      // Wait for program to be initialized
      if (!this.program) {
        console.log('Program not initialized yet, waiting...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!this.program) {
          throw new Error('Anchor program failed to initialize');
        }
      }

      const [presalePDA] = this.getPresalePDA();
      const [buyerPDA] = this.getBuyerPDA(buyer);
      const [solVaultPDA] = this.getSolVaultPDA(presalePDA);

      const amountLamports = Math.floor(amountSol * LAMPORTS_PER_SOL);

      // Use Anchor to build the instruction with correct discriminator
      const instruction = await this.program.methods
        .buyWithSol(new anchor.BN(amountLamports))
        .accounts({
          presaleState: presalePDA,
          buyerState: buyerPDA,
          buyer: buyer,
          solVaultPda: solVaultPDA,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      const transaction = new Transaction().add(instruction);
      transaction.feePayer = buyer;
      
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTransaction = await signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());
      
      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Error buying with SOL:', error);
      return null;
    }
  }

  /**
   * Buy tokens with USDC using Anchor IDL
   */
  async buyWithUsdc(
    buyer: PublicKey,
    amountUsdc: number,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
  ): Promise<string | null> {
    if (DEMO_MODE) {
      console.log('DEMO MODE: Simulating buyWithUsdc transaction.');
      return 'DEMO_TX_SIMULATED_USDC';
    }

    try {
      if (!USDC_MINT) {
        throw new Error('USDC mint not configured');
      }

      // Wait for program to be initialized
      if (!this.program) {
        console.log('Program not initialized yet, waiting...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!this.program) {
          throw new Error('Anchor program failed to initialize');
        }
      }

      const [presalePDA] = this.getPresalePDA();
      const [buyerPDA] = this.getBuyerPDA(buyer);
      const [usdcVaultPDA] = this.getUsdcVaultPDA(presalePDA);

      // Get buyer's USDC token account
      const buyerUsdcAccount = await getAssociatedTokenAddress(USDC_MINT, buyer);

      const amountUsdcBase = Math.floor(amountUsdc * 1000000); // USDC has 6 decimals

      // Use Anchor to build the instruction with correct discriminator
      const instruction = await this.program.methods
        .buyWithUsdc(new anchor.BN(amountUsdcBase))
        .accounts({
          presaleState: presalePDA,
          buyerState: buyerPDA,
          buyer: buyer,
          buyerUsdcAccount: buyerUsdcAccount,
          usdcVaultTokenAccountPda: usdcVaultPDA,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

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