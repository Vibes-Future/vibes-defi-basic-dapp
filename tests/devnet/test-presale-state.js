/**
 * Test script to check presale state on devnet and potentially initialize it
 */

const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

// Configuration (Updated with correct devnet addresses from wallet-summary.md)
const RPC_ENDPOINT = 'https://devnet.helius-rpc.com/?api-key=10bdc822-0b46-4952-98fc-095c326565d7';
const PRESALE_PROGRAM_ID = new PublicKey('GS3E6DPPkpkD6dV2vnM7LKiMghiJ4TXk1fzHFistTHQE');
const VIBES_MINT = new PublicKey('F7u5fGkXo7DApEnzBWd6zYfMgML2ueCZLP1QXfCcBbE');
const USDC_MINT = new PublicKey('HQqcfMMrPXWoWk5BLp1bGXpBHyAvjrMvq5QqjbHacnoj');

async function main() {
  console.log('🔍 Testing Presale State on Devnet...\n');
  
  const connection = new Connection(RPC_ENDPOINT, 'confirmed');
  
  // Get presale PDA
  const [presalePDA, presaleBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('presale')],
    PRESALE_PROGRAM_ID
  );
  
  console.log('📋 Configuration:');
  console.log('   RPC Endpoint:', RPC_ENDPOINT);
  console.log('   Program ID:', PRESALE_PROGRAM_ID.toString());
  console.log('   Presale PDA:', presalePDA.toString());
  console.log('   Presale Bump:', presaleBump);
  console.log('   VIBES Mint:', VIBES_MINT.toString());
  console.log('   USDC Mint:', USDC_MINT.toString());
  console.log('');
  
  try {
    // Check if presale account exists
    console.log('🔍 Checking presale account...');
    const presaleAccountInfo = await connection.getAccountInfo(presalePDA);
    
    if (!presaleAccountInfo) {
      console.log('❌ Presale account NOT INITIALIZED');
      console.log('   This is why transactions are failing!');
      console.log('   The presale needs to be initialized first.');
      console.log('');
      
      await checkRequiredAccounts(connection);
      await suggestInitialization();
    } else {
      console.log('✅ Presale account EXISTS');
      console.log('   Data length:', presaleAccountInfo.data.length, 'bytes');
      console.log('   Owner:', presaleAccountInfo.owner.toString());
      console.log('   Lamports:', presaleAccountInfo.lamports);
      console.log('');
      
      // Try to parse the data (basic parsing)
      await parsePresaleData(presaleAccountInfo.data);
    }
    
  } catch (error) {
    console.error('❌ Error checking presale state:', error.message);
  }
}

async function checkRequiredAccounts(connection) {
  console.log('🔍 Checking required token accounts...');
  
  // Check VIBES mint
  try {
    const vibesMintInfo = await connection.getAccountInfo(VIBES_MINT);
    if (vibesMintInfo) {
      console.log('✅ VIBES mint exists');
    } else {
      console.log('❌ VIBES mint NOT FOUND');
    }
  } catch (error) {
    console.log('❌ Error checking VIBES mint:', error.message);
  }
  
  // Check USDC mint  
  try {
    const usdcMintInfo = await connection.getAccountInfo(USDC_MINT);
    if (usdcMintInfo) {
      console.log('✅ USDC mint exists');
    } else {
      console.log('❌ USDC mint NOT FOUND');
    }
  } catch (error) {
    console.log('❌ Error checking USDC mint:', error.message);
  }
  
  console.log('');
}

async function parsePresaleData(data) {
  console.log('📊 Parsing presale data...');
  
  try {
    // Basic parsing - in a real scenario you'd use Anchor's coder
    if (data.length < 8) {
      console.log('❌ Data too short to be valid presale account');
      return;
    }
    
    // Skip anchor discriminator (8 bytes)
    const accountData = data.slice(8);
    
    if (accountData.length >= 32) {
      const authority = new PublicKey(accountData.slice(0, 32));
      console.log('   Authority:', authority.toString());
    }
    
    console.log('   Raw data length:', data.length, 'bytes');
    console.log('   Account data length:', accountData.length, 'bytes');
    
  } catch (error) {
    console.log('❌ Error parsing data:', error.message);
  }
  
  console.log('');
}

async function suggestInitialization() {
  console.log('💡 SOLUTION - Presale Initialization Required:');
  console.log('');
  console.log('The presale account needs to be initialized with:');
  console.log('   1. start_ts (start timestamp)');
  console.log('   2. end_ts (end timestamp)'); 
  console.log('   3. hard_cap_total (total VIBES tokens)');
  console.log('   4. price_schedule (array of price tiers)');
  console.log('');
  console.log('This should be done by the presale authority/admin.');
  console.log('');
  console.log('🔧 Next Steps:');
  console.log('   1. Create initialization script');
  console.log('   2. Run init_presale instruction');
  console.log('   3. Then users can buy tokens');
  console.log('');
}

// Run the test
main().catch(console.error);
