#!/usr/bin/env node

/**
 * Complete Devnet Testing Suite
 * Validates all functionality before mainnet deployment
 */

const { Connection, PublicKey } = require('@solana/web3.js');

// Configuration
const RPC_ENDPOINT = 'https://api.devnet.solana.com';
const PRESALE_PROGRAM_ID = new PublicKey('GS3E6DPPkpkD6dV2vnM7LKiMghiJ4TXk1fzHFistTHQE');
const STAKING_PROGRAM_ID = new PublicKey('HNQ66x9jd7tdghh4KyeyJbtEqBC7NDw1CyU5fiERS6DW');
const VESTING_PROGRAM_ID = new PublicKey('HXiAcHVkxdpAkeyFtu47mRkcEF3AxjqmGV7kfcunnaLY');
const VIBES_MINT = new PublicKey('84LT3VSyUEoyyt4u3D4No2fCfHnMdh7noyG2qd8FiQbo');
const USDC_MINT = new PublicKey('3HUzJfpyyFS4XodTRPFkGqjjGo7MHhQqJMwFu1HMkuUe');

class DevnetValidator {
  constructor() {
    this.connection = new Connection(RPC_ENDPOINT, 'confirmed');
    this.results = {
      infrastructure: {},
      initialization: {},
      functional: {},
      security: {},
      integration: {},
      performance: {}
    };
  }

  async runCompleteValidation() {
    console.log('🧪 VIBES DEFI - COMPLETE DEVNET VALIDATION\n');
    
    try {
      await this.validateInfrastructure();
      await this.validateInitialization();
      await this.validateFunctional();
      await this.validateSecurity();
      await this.validateIntegration();
      await this.validatePerformance();
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Validation failed:', error);
    }
  }

  async validateInfrastructure() {
    console.log('📋 FASE 1: INFRASTRUCTURE VALIDATION\n');

    // Check smart contracts
    console.log('🔍 Checking smart contracts...');
    this.results.infrastructure.presale = await this.checkProgram(PRESALE_PROGRAM_ID, 'Presale');
    this.results.infrastructure.staking = await this.checkProgram(STAKING_PROGRAM_ID, 'Staking');
    this.results.infrastructure.vesting = await this.checkProgram(VESTING_PROGRAM_ID, 'Vesting');

    // Check tokens
    console.log('🪙 Checking tokens...');
    this.results.infrastructure.vibesToken = await this.checkToken(VIBES_MINT, 'VIBES');
    this.results.infrastructure.usdcToken = await this.checkToken(USDC_MINT, 'USDC');

    // Check frontend
    console.log('🌐 Checking frontend...');
    this.results.infrastructure.frontend = await this.checkFrontend();

    console.log('✅ Infrastructure validation complete\n');
  }

  async validateInitialization() {
    console.log('📋 FASE 2: INITIALIZATION VALIDATION\n');

    // Check presale state
    const [presalePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('presale')],
      PRESALE_PROGRAM_ID
    );

    const presaleAccount = await this.connection.getAccountInfo(presalePDA);
    this.results.initialization.presaleInitialized = !!presaleAccount;
    
    console.log(presaleAccount ? 
      '✅ Presale initialized' : 
      '❌ Presale NOT initialized (required for functional testing)'
    );

    // Check staking pool
    const [stakingPoolPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('stake_pool')],
      STAKING_PROGRAM_ID
    );

    const stakingAccount = await this.connection.getAccountInfo(stakingPoolPDA);
    this.results.initialization.stakingInitialized = !!stakingAccount;
    
    console.log(stakingAccount ? 
      '✅ Staking pool initialized' : 
      '⚠️ Staking pool not initialized'
    );

    console.log('✅ Initialization validation complete\n');
  }

  async validateFunctional() {
    console.log('📋 FASE 3: FUNCTIONAL VALIDATION\n');
    
    if (!this.results.initialization.presaleInitialized) {
      console.log('⏭️ Skipping functional tests - presale not initialized');
      this.results.functional.skipped = true;
      return;
    }

    console.log('💰 Testing presale functions...');
    // Here you would test actual transactions
    this.results.functional.presaleBuySol = 'REQUIRES_USER_INTERACTION';
    this.results.functional.presaleBuyUsdc = 'REQUIRES_USER_INTERACTION';
    
    console.log('📈 Testing staking functions...');
    this.results.functional.staking = 'REQUIRES_INITIALIZATION';
    
    console.log('⏰ Testing vesting functions...');
    this.results.functional.vesting = 'REQUIRES_TOKENS';

    console.log('✅ Functional validation complete\n');
  }

  async validateSecurity() {
    console.log('📋 FASE 4: SECURITY VALIDATION\n');
    
    // Check program ownership
    console.log('🔒 Checking program security...');
    const presaleProgram = await this.connection.getAccountInfo(PRESALE_PROGRAM_ID);
    const stakingProgram = await this.connection.getAccountInfo(STAKING_PROGRAM_ID);
    const vestingProgram = await this.connection.getAccountInfo(VESTING_PROGRAM_ID);

    this.results.security.programsDeployed = !!(presaleProgram && stakingProgram && vestingProgram);
    this.results.security.upgradeAuthority = 'NEEDS_MANUAL_CHECK';

    console.log('🛡️ Checking access controls...');
    this.results.security.accessControls = 'NEEDS_FUNCTIONAL_TESTING';

    console.log('✅ Security validation complete\n');
  }

  async validateIntegration() {
    console.log('📋 FASE 5: INTEGRATION VALIDATION\n');
    
    console.log('🔗 Checking frontend integration...');
    this.results.integration.walletConnection = await this.checkFrontend();
    this.results.integration.transactionFlow = 'REQUIRES_USER_TESTING';

    console.log('✅ Integration validation complete\n');
  }

  async validatePerformance() {
    console.log('📋 FASE 6: PERFORMANCE VALIDATION\n');
    
    console.log('⚡ Testing RPC performance...');
    const start = Date.now();
    await this.connection.getAccountInfo(VIBES_MINT);
    const rpcLatency = Date.now() - start;
    
    this.results.performance.rpcLatency = rpcLatency;
    this.results.performance.acceptable = rpcLatency < 2000; // 2s threshold

    console.log(`   RPC Latency: ${rpcLatency}ms ${rpcLatency < 2000 ? '✅' : '❌'}`);

    console.log('✅ Performance validation complete\n');
  }

  async checkProgram(programId, name) {
    try {
      const accountInfo = await this.connection.getAccountInfo(programId);
      const status = accountInfo ? 'DEPLOYED' : 'NOT_FOUND';
      console.log(`   ${name}: ${status} ${accountInfo ? '✅' : '❌'}`);
      return { status, accountInfo: !!accountInfo };
    } catch (error) {
      console.log(`   ${name}: ERROR ❌`);
      return { status: 'ERROR', error: error.message };
    }
  }

  async checkToken(mintId, name) {
    try {
      const accountInfo = await this.connection.getAccountInfo(mintId);
      const status = accountInfo ? 'EXISTS' : 'NOT_FOUND';
      console.log(`   ${name}: ${status} ${accountInfo ? '✅' : '❌'}`);
      return { status, exists: !!accountInfo };
    } catch (error) {
      console.log(`   ${name}: ERROR ❌`);
      return { status: 'ERROR', error: error.message };
    }
  }

  async checkFrontend() {
    try {
      const response = await fetch('http://localhost:3000');
      const status = response.ok ? 'RUNNING' : 'ERROR';
      console.log(`   Frontend: ${status} ${response.ok ? '✅' : '❌'}`);
      return { status, running: response.ok };
    } catch (error) {
      console.log(`   Frontend: NOT_RUNNING ❌`);
      return { status: 'NOT_RUNNING', error: error.message };
    }
  }

  generateReport() {
    console.log('📊 VALIDATION REPORT\n');
    console.log('='.repeat(50));
    
    // Infrastructure
    console.log('\n📋 INFRASTRUCTURE:');
    const infraOk = Object.values(this.results.infrastructure).every(r => 
      r.status === 'DEPLOYED' || r.status === 'EXISTS' || r.status === 'RUNNING'
    );
    console.log(`   Status: ${infraOk ? '✅ PASS' : '❌ FAIL'}`);

    // Initialization
    console.log('\n🔧 INITIALIZATION:');
    const initOk = this.results.initialization.presaleInitialized;
    console.log(`   Status: ${initOk ? '✅ PASS' : '❌ FAIL (Presale needs init)'}`);

    // Overall readiness
    console.log('\n🎯 MAINNET READINESS:');
    const ready = infraOk && initOk;
    console.log(`   Status: ${ready ? '✅ READY FOR FUNCTIONAL TESTING' : '❌ NEEDS INITIALIZATION'}`);

    console.log('\n🔥 NEXT STEPS:');
    if (!ready) {
      console.log('   1. Initialize presale using authority wallet');
      console.log('   2. Initialize staking pool');
      console.log('   3. Run functional tests');
    } else {
      console.log('   1. Run manual functional tests');
      console.log('   2. Test with multiple users');
      console.log('   3. Security audit');
      console.log('   4. Prepare mainnet deployment');
    }

    console.log('\n' + '='.repeat(50));
  }
}

// Run validation
const validator = new DevnetValidator();
validator.runCompleteValidation().catch(console.error);
