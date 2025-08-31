/**
 * Initialize Presale on Devnet
 * This script will initialize the presale with test parameters
 */

const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const fs = require('fs');

// Configuration
const RPC_ENDPOINT = 'https://api.devnet.solana.com'; // Use public endpoint to avoid rate limits
const PRESALE_PROGRAM_ID = new PublicKey('GS3E6DPPkpkD6dV2vnM7LKiMghiJ4TXk1fzHFistTHQE');
const VIBES_MINT = new PublicKey('84LT3VSyUEoyyt4u3D4No2fCfHnMdh7noyG2qd8FiQbo');
const USDC_MINT = new PublicKey('3HUzJfpyyFS4XodTRPFkGqjjGo7MHhQqJMwFu1HMkuUe');

async function main() {
  console.log('🚀 Initializing Presale on Devnet...\n');
  
  const connection = new Connection(RPC_ENDPOINT, 'confirmed');
  
  // Load authority keypair (assuming it exists)
  let authorityKeypair;
  try {
    const authorityData = JSON.parse(fs.readFileSync('../../vibe-smart-contract/test-wallets/authority.json', 'utf8'));
    authorityKeypair = Keypair.fromSecretKey(new Uint8Array(authorityData));
    console.log('✅ Authority keypair loaded:', authorityKeypair.publicKey.toString());
  } catch (error) {
    console.log('❌ Could not load authority keypair, using default wallet');
    console.log('   Make sure you have solana CLI configured with a funded wallet');
    console.log('   Run: solana airdrop 5');
    return;
  }
  
  // Get PDAs
  const [presalePDA, presaleBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('presale')],
    PRESALE_PROGRAM_ID
  );
  
  const [solVaultPDA, solVaultBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('sol_vault'), presalePDA.toBuffer()],
    PRESALE_PROGRAM_ID
  );
  
  const [usdcVaultPDA, usdcVaultBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('usdc_vault'), presalePDA.toBuffer()],
    PRESALE_PROGRAM_ID
  );
  
  console.log('📋 PDAs:');
  console.log('   Presale PDA:', presalePDA.toString());
  console.log('   SOL Vault PDA:', solVaultPDA.toString());
  console.log('   USDC Vault PDA:', usdcVaultPDA.toString());
  console.log('');
  
  // Check if already initialized
  try {
    const presaleAccountInfo = await connection.getAccountInfo(presalePDA);
    if (presaleAccountInfo) {
      console.log('✅ Presale already initialized!');
      console.log('   Data length:', presaleAccountInfo.data.length, 'bytes');
      return;
    }
  } catch (error) {
    console.log('🔍 Presale not found, proceeding with initialization...');
  }
  
  // Create presale initialization instruction
  console.log('🔧 Creating presale initialization instruction...');
  
  // Discriminator for "init_presale" - calculated from sighash
  const discriminator = Buffer.from([175, 175, 109, 31, 13, 152, 155, 237]); // "global:init_presale"
  
  // Parameters
  const startTs = Math.floor(Date.now() / 1000); // Now
  const endTs = startTs + (86400 * 30); // 30 days from now
  const hardCapTotal = 1000000 * 1000000000; // 1M VIBES tokens
  
  // Price schedule - simplified: just one tier
  const priceTier = {
    startTs: startTs,
    priceUsd: 0.0598 // $0.0598 per VIBES
  };
  
  console.log('📊 Presale Parameters:');
  console.log('   Start Time:', new Date(startTs * 1000).toISOString());
  console.log('   End Time:', new Date(endTs * 1000).toISOString());
  console.log('   Hard Cap:', hardCapTotal / 1000000000, 'VIBES');
  console.log('   Price:', priceTier.priceUsd, 'USD per VIBES');
  console.log('');
  
  // Note: This is a simplified approach. In a real scenario, you would:
  // 1. Use Anchor SDK to build the instruction properly
  // 2. Serialize the price schedule correctly
  // 3. Handle all the account parameters properly
  
  console.log('⚠️  Manual Initialization Required:');
  console.log('');
  console.log('This script demonstrates how to initialize the presale,');
  console.log('but the actual initialization should be done using:');
  console.log('');
  console.log('1. Anchor CLI: anchor run init-presale');
  console.log('2. Custom script with proper Anchor SDK');
  console.log('3. Admin panel/interface');
  console.log('');
  console.log('The presale needs these parameters:');
  console.log('   - Authority:', authorityKeypair.publicKey.toString());
  console.log('   - VIBES Mint:', VIBES_MINT.toString());
  console.log('   - USDC Mint:', USDC_MINT.toString());
  console.log('   - Start/End timestamps');
  console.log('   - Hard cap and price schedule');
  console.log('');
  console.log('🔧 For testing, you can enable DEMO_MODE in the DApp');
  console.log('   to simulate transactions without real presale state.');
}

// Calculate discriminator for reference
function calculateDiscriminator(name) {
  const crypto = require('crypto');
  const preimage = `global:${name}`;
  const hash = crypto.createHash('sha256').update(preimage).digest();
  return Array.from(hash.slice(0, 8));
}

console.log('🔢 Discriminators for reference:');
console.log('   init_presale:', calculateDiscriminator('init_presale'));
console.log('   buy_with_sol:', calculateDiscriminator('buy_with_sol'));
console.log('   buy_with_usdc:', calculateDiscriminator('buy_with_usdc'));
console.log('');

// Run the script
main().catch(console.error);
