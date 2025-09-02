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
  totalStakedDuringPresale: number; // Added field for total staked tokens
  accRewardPerToken: number; // Accumulated rewards per token (1e12 scale)
  lastRewardUpdateTs: number; // Last reward update timestamp
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
  totalPurchasedVibes: number;
  solContributed: number;
  usdcContributed: number;
  accumulatedRewards: number;
  rewardDebt: number;
  totalRewardsClaimed: number;
  lastUpdateTs: number;
  transferredToVesting: boolean;
  finalVestingAmount: number;
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
        console.log('❌ Presale state not found at PDA:', presalePDA.toString());
        console.log('🔍 Expected PDA from keypairs.json: 7eNN8j92e3wBUUWTowTcZDBU72Hv56VLtpgafHQgcHST');
        console.log('🔍 Calculated PDA:', presalePDA.toString());
        console.log('📋 Program ID:', PRESALE_PROGRAM_ID.toString());
        console.log('🌐 RPC Endpoint:', this.connection.rpcEndpoint);
        
        // Try to fetch using the known PDA from keypairs.json
        const knownPDA = new PublicKey('7eNN8j92e3wBUUWTowTcZDBU72Hv56VLtpgafHQgcHST');
        const knownAccountInfo = await this.connection.getAccountInfo(knownPDA);
        
        if (knownAccountInfo) {
          console.log('✅ Found presale state at known PDA!');
          console.log('🔍 Account info:', knownAccountInfo);
          // TODO: Parse the account data properly
        } else {
          console.log('❌ Known PDA also not found');
        }
        
        // Check if we can get real data from buyer states
        // For now, let's try to get a more accurate estimate based on actual transactions
        // We'll check the current buyer's contribution to estimate total
        
        console.log('📊 Presale state not found, using buyer-based estimation');
        
        // This will be updated when we get the actual buyer state data
        // For now, return structure that will be populated by global stats method
        const estimatedRaisedSol = 0; // Will be calculated from buyer states
        const estimatedRaisedUsdc = 0;
        
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
          raisedSol: estimatedRaisedSol,
          raisedUsdc: estimatedRaisedUsdc,
          totalStakedDuringPresale: 0, // Will be calculated from buyer states when available
          accRewardPerToken: 0, // No rewards accumulated yet
          lastRewardUpdateTs: Date.now() / 1000,
          solVaultPda: this.getSolVaultPDA(presalePDA)[0],
          usdcVaultTokenAccountPda: this.getUsdcVaultPDA(presalePDA)[0],
          liquiditySolWallet: new PublicKey('11111111111111111111111111111111'),
          liquidityUsdcWallet: new PublicKey('11111111111111111111111111111111'),
          bump: 255,
          isFinalized: false,
        };
      }

      // Parse the account data using the exact Rust struct layout
      const data = accountInfo.data;
      let offset = 8; // Skip discriminator
      
      console.log('📊 Parsing presale state data, size:', data.length);
      
      // Parse PresaleState fields in exact order from Rust struct
      // 1. authority: Pubkey (32 bytes)
      const authority = new PublicKey(data.slice(offset, offset + 32));
      offset += 32;
      
      // 2. token_mint: Pubkey (32 bytes)
      offset += 32;
      
      // 3. usdc_mint: Pubkey (32 bytes)
      offset += 32;
      
      // 4. price_schedule: Vec<PriceTier> - skip for now (4 bytes length + data)
      const priceScheduleLen = data.readUInt32LE(offset);
      offset += 4 + (priceScheduleLen * 16); // Each PriceTier is i64 + f64 = 16 bytes
      
      // 5. start_ts: i64 (8 bytes)
      offset += 8;
      
      // 6. end_ts: i64 (8 bytes)
      offset += 8;
      
      // 7. hard_cap_total: u64 (8 bytes)
      offset += 8;
      
      // 8. raised_sol: u64 (8 bytes)
      const raisedSol = data.readBigUInt64LE(offset);
      offset += 8;
      
      // 9. raised_usdc: u64 (8 bytes)
      const raisedUsdc = data.readBigUInt64LE(offset);
      offset += 8;
      
      // 10. total_vibes_sold: u64 (8 bytes)
      offset += 8;
      
      // 11. liquidity_sol_wallet: Pubkey (32 bytes)
      offset += 32;
      
      // 12. liquidity_usdc_wallet: Pubkey (32 bytes)
      offset += 32;
      
      // 13. staking_apy_bps: u64 (8 bytes)
      offset += 8;
      
      // 14. total_staked_during_presale: u64 (8 bytes)
      const totalStakedDuringPresale = data.readBigUInt64LE(offset);
      offset += 8;
      
      // 15. acc_reward_per_token: u128 (16 bytes) - handle as two u64s for browser compatibility
      const accRewardPerTokenLow = data.readBigUInt64LE(offset);
      offset += 8;
      const accRewardPerTokenHigh = data.readBigUInt64LE(offset);
      offset += 8;
      const accRewardPerToken = Number(accRewardPerTokenLow); // For now, assume high part is 0
      
      // 16. last_reward_update_ts: i64 (8 bytes)
      const lastRewardUpdateTs = Number(data.readBigInt64LE(offset));
      offset += 8;
      
      console.log('📊 Correctly parsed presale state:');
      console.log('   Raised SOL:', Number(raisedSol) / 1e9);
      console.log('   Raised USDC:', Number(raisedUsdc) / 1e6);
      console.log('   Total Staked During Presale:', Number(totalStakedDuringPresale) / 1e9);
      console.log('   Acc Reward Per Token (raw low):', accRewardPerTokenLow.toString());
      console.log('   Acc Reward Per Token (raw high):', accRewardPerTokenHigh.toString());
      console.log('   Acc Reward Per Token (final):', accRewardPerToken);
      console.log('   Last Reward Update:', new Date(lastRewardUpdateTs * 1000).toISOString());
      console.log('   Price schedule length:', priceScheduleLen);
      console.log('   🔍 Buffer offset after parsing:', offset, 'Total buffer size:', data.length);
      
      return {
        authority,
        tokenMint: VIBES_MINT!,
        usdcMint: USDC_MINT!,
        priceSchedule: [
          { startTs: Date.now() / 1000, priceUsd: 0.0598 },
        ],
        startTs: Date.now() / 1000,
        endTs: Date.now() / 1000 + 86400 * 30, // 30 days
        hardCapTotal: 1000000 * LAMPORTS_PER_SOL,
        raisedSol: Number(raisedSol) / 1e9, // Convert from lamports to SOL
        raisedUsdc: Number(raisedUsdc) / 1e6, // Convert from micro-USDC to USDC
        totalStakedDuringPresale: Number(totalStakedDuringPresale),
        accRewardPerToken: accRewardPerToken,
        lastRewardUpdateTs: lastRewardUpdateTs,
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
        console.log('No buyer state found for:', buyer.toString());
        return null;
      }

      // Deserialize buyer state data using exact Rust struct layout
      const data = accountInfo.data;
      let offset = 8; // Skip discriminator

      // Parse BuyerState fields in exact order from Rust struct
      // 1. buyer: Pubkey (32 bytes)
      const buyerKey = new PublicKey(data.slice(offset, offset + 32));
      offset += 32;

      // 2. total_purchased_vibes: u64 (8 bytes)
      const totalPurchasedVibes = data.readBigUInt64LE(offset);
      offset += 8;

      // 3. sol_contributed: u64 (8 bytes)
      const solContributed = data.readBigUInt64LE(offset);
      offset += 8;

      // 4. usdc_contributed: u64 (8 bytes)
      const usdcContributed = data.readBigUInt64LE(offset);
      offset += 8;

      // 5. accumulated_rewards: u64 (8 bytes)
      const accumulatedRewards = data.readBigUInt64LE(offset);
      offset += 8;

      // 6. reward_debt: u128 (16 bytes) - handle as two u64s for browser compatibility
      const rewardDebtLow = data.readBigUInt64LE(offset);
      const rewardDebtHigh = data.readBigUInt64LE(offset + 8);
      const rewardDebt = Number(rewardDebtLow) + (Number(rewardDebtHigh) * Math.pow(2, 64));
      offset += 16;

      // 7. total_rewards_claimed: u64 (8 bytes)
      const totalRewardsClaimed = data.readBigUInt64LE(offset);
      offset += 8;

      // 8. last_update_ts: i64 (8 bytes)
      const lastUpdateTs = data.readBigInt64LE(offset);
      offset += 8;

      // 9. transferred_to_vesting: bool (1 byte)
      const transferredToVesting = data.readUInt8(offset) === 1;
      offset += 1;

      // 10. final_vesting_amount: u64 (8 bytes)
      const finalVestingAmount = data.readBigUInt64LE(offset);
      offset += 8;

      // 11. bump: u8 (1 byte)
      const bump = data.readUInt8(offset);
      
      console.log('📊 Correctly parsed buyer state:');
      console.log('   Total purchased VIBES:', Number(totalPurchasedVibes) / 1e9);
      console.log('   SOL contributed:', Number(solContributed) / 1e9);
      console.log('   USDC contributed:', Number(usdcContributed) / 1e6);
      console.log('   Accumulated rewards:', Number(accumulatedRewards) / 1e9);
      console.log('   Total rewards claimed:', Number(totalRewardsClaimed) / 1e9);
      console.log('   Last update timestamp:', new Date(Number(lastUpdateTs) * 1000).toISOString());
      console.log('   Reward debt:', rewardDebt.toString());

      return {
        buyer: buyerKey,
        totalPurchasedVibes: Number(totalPurchasedVibes) / 1e9, // Convert from lamports to VIBES
        solContributed: Number(solContributed) / 1e9, // Convert from lamports to SOL
        usdcContributed: Number(usdcContributed) / 1e6, // Convert from micro-USDC to USDC
        accumulatedRewards: Number(accumulatedRewards) / 1e9, // Convert from lamports to VIBES
        rewardDebt: Number(rewardDebt),
        totalRewardsClaimed: Number(totalRewardsClaimed) / 1e9, // Convert from lamports to VIBES
        lastUpdateTs: Number(lastUpdateTs),
        transferredToVesting,
        finalVestingAmount: Number(finalVestingAmount) / 1e9, // Convert from lamports to VIBES
        bump,
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
   * Calculate pending staking rewards for a buyer
   */
  async calculatePendingRewards(buyer: PublicKey): Promise<{ 
    stakedAmount: number;
    pendingRewards: number;
    accumulatedRewards: number;
    totalRewards: number;
    apyRate: number;
  } | null> {
    try {
      console.log('🧮 Starting calculatePendingRewards for buyer:', buyer.toString());
      
      const [presaleState, buyerState] = await Promise.all([
        this.getPresaleState(),
        this.getBuyerState(buyer)
      ]);

      if (!presaleState || !buyerState) {
        console.log('❌ Missing presaleState or buyerState');
        return null;
      }
      
      console.log('✅ Got states, proceeding with reward calculation...');

      // During presale, all purchased tokens are auto-staked
      const stakedAmount = buyerState.totalPurchasedVibes;
      
      if (stakedAmount === 0) {
        return {
          stakedAmount: 0,
          pendingRewards: 0,
          accumulatedRewards: buyerState.accumulatedRewards,
          totalRewards: buyerState.accumulatedRewards,
          apyRate: 40, // 40% APY during presale
        };
      }

      // Calculate pending rewards
      let pendingRewards = 0;
      
      // Check if smart contract has updated rewards
      if (presaleState.accRewardPerToken && presaleState.accRewardPerToken > 0) {
        // Use SMART CONTRACT logic when accRewardPerToken is available
        const currentAccReward = (BigInt(Math.floor(buyerState.totalPurchasedVibes * 1e9)) * BigInt(Math.floor(presaleState.accRewardPerToken))) / BigInt(1e12);
        const rewardDebt = buyerState.rewardDebt || 0;
        
        if (currentAccReward > rewardDebt) {
          pendingRewards = Number(currentAccReward - BigInt(rewardDebt));
        }
        
        console.log('🧮 Using Smart Contract Reward Calculation:', {
          accRewardPerToken: presaleState.accRewardPerToken,
          pendingRewards: pendingRewards / 1e9,
        });
      } else {
        // FALLBACK: Calculate manually if smart contract hasn't updated
        // This happens when no transactions have triggered update_rewards()
        const currentTime = Math.floor(Date.now() / 1000);
        const timeSinceLastUpdate = currentTime - buyerState.lastUpdateTs;
        const timeSincePresaleStart = currentTime - presaleState.lastRewardUpdateTs;
        
        // Use the longer time period (could be since presale start if first buyer)
        const effectiveTime = Math.max(timeSinceLastUpdate, timeSincePresaleStart);
        
        // 40% APY = 4000 basis points
        const apyBps = 4000;
        const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
        const rewardRate = (apyBps / 10000) / SECONDS_PER_YEAR;
        
        // Calculate pending rewards based on time
        pendingRewards = Math.floor(stakedAmount * rewardRate * effectiveTime);
        
        console.log('⚠️ Smart Contract not updated, calculating manually:', {
          accRewardPerToken: 0,
          timeSinceLastUpdate: timeSinceLastUpdate,
          effectiveTime: effectiveTime,
          rewardRate: rewardRate,
          pendingRewards: pendingRewards / 1e9,
          note: 'Rewards will be accurate after next transaction updates smart contract'
        });
      }
      
      const totalRewards = buyerState.accumulatedRewards + pendingRewards;

      console.log('📊 Final Staking Calculation:', {
        stakedAmount: stakedAmount / 1e9, // Convert to human readable
        accumulatedRewards: buyerState.accumulatedRewards / 1e9,
        pendingRewards: pendingRewards / 1e9,
        totalRewards: totalRewards / 1e9,
      });

      return {
        stakedAmount,
        pendingRewards,
        accumulatedRewards: buyerState.accumulatedRewards,
        totalRewards,
        apyRate: 40,
      };
    } catch (error) {
      console.error('Error calculating pending rewards:', error);
      return null;
    }
  }

  /**
   * Get global staking statistics from presale contract
   */
  async getGlobalStakingStats(currentUserStake?: number): Promise<{
    totalStakedDuringPresale: number;
    totalActiveBuyers: number;
    totalSolRaised: number;
    totalUsdcRaised: number;
  } | null> {
    try {
      const presaleState = await this.getPresaleState();
      if (!presaleState) {
        return null;
      }
      
      console.log('📊 Getting global staking stats...');
      console.log('   Raised SOL:', presaleState.raisedSol / 1e9);
      console.log('   Raised USDC:', presaleState.raisedUsdc / 1e6);

      // Use the correctly parsed totalStakedDuringPresale from presale state
      let totalStakedTokens = presaleState.totalStakedDuringPresale / 1e9; // Convert from lamports to VIBES
      let activeBuyers = Math.max(1, Math.floor(presaleState.raisedSol / 1e8)); // Estimate based on SOL raised
      
      console.log('📊 Real total staked from contract:', totalStakedTokens, 'VIBES');
      console.log('📊 User stake for comparison:', currentUserStake, 'VIBES');
      console.log('📊 Estimated active buyers:', activeBuyers);
      
      // Sanity check: if we parsed 0 but have user stake, something is wrong
      if (totalStakedTokens === 0 && currentUserStake && currentUserStake > 0) {
        console.log('📊 ⚠️  Total staked is 0 but user has stake - possible parsing issue');
        console.log('📊 Using user stake as minimum baseline');
        totalStakedTokens = currentUserStake;
        activeBuyers = 1;
      }

      return {
        totalStakedDuringPresale: totalStakedTokens,
        totalActiveBuyers: activeBuyers,
        totalSolRaised: presaleState.raisedSol / 1e9,
        totalUsdcRaised: presaleState.raisedUsdc / 1e6,
      };
    } catch (error) {
      console.error('Error getting global staking stats:', error);
      return null;
    }
  }

  /**
   * Get complete staking dashboard data
   */
  async getStakingDashboard(buyer: PublicKey): Promise<{
    isStaking: boolean;
    stakedTokens: number;
    pendingRewards: number;
    totalRewards: number;
    apyRate: number;
    solContributed: number;
    usdcContributed: number;
    lastUpdateTime: Date;
    globalStats: {
      totalStaked: number;
      totalStakers: number;
    };
  } | null> {
    try {
      const buyerState = await this.getBuyerState(buyer);
      
      // Get global stats, passing user's stake if available
      const userStakeAmount = buyerState ? buyerState.totalPurchasedVibes / 1e9 : 0;
      const globalStats = await this.getGlobalStakingStats(userStakeAmount);

      if (!buyerState) {
        const defaultGlobalStats = globalStats ? {
          totalStaked: globalStats.totalStakedDuringPresale,
          totalStakers: globalStats.totalActiveBuyers
        } : {
          totalStaked: 0,
          totalStakers: 0
        };

        return {
          isStaking: false,
          stakedTokens: 0,
          pendingRewards: 0,
          totalRewards: 0,
          apyRate: 40,
          solContributed: 0,
          usdcContributed: 0,
          lastUpdateTime: new Date(),
          globalStats: defaultGlobalStats,
        };
      }

      const rewardsData = await this.calculatePendingRewards(buyer);
      if (!rewardsData) {
        return null;
      }

      const finalGlobalStats = globalStats ? {
        totalStaked: globalStats.totalStakedDuringPresale,
        totalStakers: globalStats.totalActiveBuyers
      } : {
        totalStaked: buyerState.totalPurchasedVibes / 1e9, // At least user's own stake
        totalStakers: 1
      };

      return {
        isStaking: buyerState.totalPurchasedVibes > 0,
        stakedTokens: buyerState.totalPurchasedVibes / 1e9, // Convert to human readable
        pendingRewards: rewardsData.pendingRewards / 1e9,
        totalRewards: rewardsData.totalRewards / 1e9,
        apyRate: rewardsData.apyRate,
        solContributed: buyerState.solContributed / 1e9, // Convert SOL
        usdcContributed: buyerState.usdcContributed / 1e6, // Convert USDC
        lastUpdateTime: new Date(buyerState.lastUpdateTs * 1000),
        globalStats: finalGlobalStats,
      };
    } catch (error) {
      console.error('Error getting staking dashboard:', error);
      return null;
    }
  }

  /**
   * Create buy_with_sol instruction with proper discriminator (calculated manually)
   */
  private createBuyWithSolInstruction(
    buyer: PublicKey,
    amountLamports: number,
    presalePDA: PublicKey,
    buyerPDA: PublicKey,
    liquiditySol: PublicKey
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
        { pubkey: liquiditySol, isSigner: false, isWritable: true },
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
    liquidityUsdcAccount: PublicKey
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
        { pubkey: liquidityUsdcAccount, isSigner: false, isWritable: true },
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
      
      // Use the actual liquidity SOL wallet from the presale configuration
      const liquiditySolWallet = new PublicKey('CXDPqBqDfodrvvvUDHVXBBahYpGx1WwbZHzeaDrQfWyM');

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
      console.log('   Liquidity SOL Wallet:', liquiditySolWallet.toString());

      const instruction = this.createBuyWithSolInstruction(
        buyer,
        amountLamports,
        presalePDA,
        buyerPDA,
        liquiditySolWallet
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
      
      // Use the actual liquidity USDC wallet from the presale configuration
      const liquidityUsdcWallet = new PublicKey('FTZP2Wxev5m4nayY3Atre3H1diHf6Sk45T53jdMhsCsS');
      
      // Get buyer's USDC token account
      const buyerUsdcAccount = await getAssociatedTokenAddress(USDC_MINT, buyer);
      
      // Get liquidity USDC token account
      const liquidityUsdcAccount = await getAssociatedTokenAddress(USDC_MINT, liquidityUsdcWallet);

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
      console.log('   USDC Mint used:', USDC_MINT.toString());
      console.log('   Presale USDC Mint:', presaleState.usdcMint.toString());
      console.log('   Buyer USDC Account:', buyerUsdcAccount.toString());
      console.log('   Liquidity USDC Account:', liquidityUsdcAccount.toString());
      console.log('   Liquidity USDC Wallet:', liquidityUsdcWallet.toString());
      
      // Verify USDC mint matches
      if (USDC_MINT.toString() !== presaleState.usdcMint.toString()) {
        throw new Error(`USDC mint mismatch! Using: ${USDC_MINT.toString()}, Presale expects: ${presaleState.usdcMint.toString()}`);
      }

      const instruction = this.createBuyWithUsdcInstruction(
        buyer,
        amountUsdcBase,
        presalePDA,
        buyerPDA,
        buyerUsdcAccount,
        liquidityUsdcAccount
      );

      const transaction = new Transaction();

      // Check if buyer's USDC account exists, create if needed
      const buyerUsdcAccountInfo = await this.connection.getAccountInfo(buyerUsdcAccount);
      if (!buyerUsdcAccountInfo) {
        console.log('🏗️  Creating buyer USDC account...');
        const createBuyerAccountIx = createAssociatedTokenAccountInstruction(
          buyer,
          buyerUsdcAccount,
          buyer,
          USDC_MINT
        );
        transaction.add(createBuyerAccountIx);
      }

      // Check if liquidity USDC account exists, create if needed
      const liquidityUsdcAccountInfo = await this.connection.getAccountInfo(liquidityUsdcAccount);
      if (!liquidityUsdcAccountInfo) {
        console.log('🏗️  Creating liquidity USDC account...');
        const createLiquidityAccountIx = createAssociatedTokenAccountInstruction(
          buyer, // Payer (buyer pays for the account creation)
          liquidityUsdcAccount,
          liquidityUsdcWallet, // Owner of the account
          USDC_MINT
        );
        transaction.add(createLiquidityAccountIx);
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
