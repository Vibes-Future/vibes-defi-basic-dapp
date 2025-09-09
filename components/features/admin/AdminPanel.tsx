'use client';

import React, { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { connection } from '@/lib/solana';
import { PRESALE_PROGRAM_ID, VIBES_MINT, USDC_MINT } from '@/lib/config';

export const AdminPanel: React.FC = () => {
  const { connected, publicKeyObj, signTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  // Check if user is authority (for security)
  const isAuthority = connected && publicKeyObj?.toString() === 'Uvqj1b7jR1EKXyDAqoH1c3VPdjaRRGGHWPXGZe7LTH5';

  const initializePresale = async () => {
    if (!connected || !publicKeyObj || !signTransaction || !isAuthority) {
      setStatus('❌ Need to connect authority wallet');
      return;
    }

    setLoading(true);
    setStatus('🔧 Initializing presale...');

    try {
      // Get presale PDA
      const [presalePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('presale_state')],
        PRESALE_PROGRAM_ID
      );

      const [solVaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('sol_vault'), presalePDA.toBuffer()],
        PRESALE_PROGRAM_ID
      );

      const [usdcVaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('usdc_vault'), presalePDA.toBuffer()],
        PRESALE_PROGRAM_ID
      );

      // Presale parameters
      const startTs = Math.floor(Date.now() / 1000); // Now
      const endTs = startTs + (86400 * 365); // 1 year from now
      const hardCapTotal = 1000000 * 1000000000; // 1M VIBES tokens

      // Simple price schedule - one tier for now
      const priceScheduleData = [
        {
          startTs: startTs,
          priceUsd: 0.0598
        }
      ];

      // Create instruction data manually
      // Discriminator for init_presale: [172, 248, 47, 226, 223, 52, 94, 217]
      const discriminator = Buffer.from([172, 248, 47, 226, 223, 52, 94, 217]);
      
      // Parameters: start_ts (i64), end_ts (i64), hard_cap_total (u64), price_schedule (Vec<PriceTier>)
      const instructionData = Buffer.alloc(1024); // Large buffer for complex data
      let offset = 0;

      // Write discriminator
      discriminator.copy(instructionData, offset);
      offset += 8;

      // Write start_ts as 64-bit
      const startTsLow = startTs & 0xFFFFFFFF;
      const startTsHigh = Math.floor(startTs / 0x100000000);
      instructionData.writeUInt32LE(startTsLow, offset);
      instructionData.writeUInt32LE(startTsHigh, offset + 4);
      offset += 8;

      // Write end_ts as 64-bit
      const endTsLow = endTs & 0xFFFFFFFF;
      const endTsHigh = Math.floor(endTs / 0x100000000);
      instructionData.writeUInt32LE(endTsLow, offset);
      instructionData.writeUInt32LE(endTsHigh, offset + 4);
      offset += 8;

      // Write hard_cap_total as 64-bit
      const hardCapLow = hardCapTotal & 0xFFFFFFFF;
      const hardCapHigh = Math.floor(hardCapTotal / 0x100000000);
      instructionData.writeUInt32LE(hardCapLow, offset);
      instructionData.writeUInt32LE(hardCapHigh, offset + 4);
      offset += 8;

      // Write price schedule length (u32)
      instructionData.writeUInt32LE(priceScheduleData.length, offset);
      offset += 4;

      // Write each price tier (simplified)
      for (const tier of priceScheduleData) {
        // start_ts (i64)
        const tierStartLow = tier.startTs & 0xFFFFFFFF;
        const tierStartHigh = Math.floor(tier.startTs / 0x100000000);
        instructionData.writeUInt32LE(tierStartLow, offset);
        instructionData.writeUInt32LE(tierStartHigh, offset + 4);
        offset += 8;

        // price_usd (f64) - convert to bytes manually
        const priceBytes = new ArrayBuffer(8);
        const priceView = new DataView(priceBytes);
        priceView.setFloat64(0, tier.priceUsd, true); // little endian
        const priceUint8 = new Uint8Array(priceBytes);
        
        // Copy price bytes to instruction data
        for (let i = 0; i < 8; i++) {
          instructionData[offset + i] = priceUint8[i];
        }
        offset += 8;
      }

      // Trim the instruction data to actual size used
      const finalInstructionData = instructionData.slice(0, offset);

      const instruction = new Transaction().add({
        keys: [
          { pubkey: presalePDA, isSigner: false, isWritable: true },
          { pubkey: VIBES_MINT!, isSigner: false, isWritable: false },
          { pubkey: USDC_MINT!, isSigner: false, isWritable: false },
          { pubkey: publicKeyObj, isSigner: true, isWritable: true },
          { pubkey: solVaultPDA, isSigner: false, isWritable: false },
          { pubkey: usdcVaultPDA, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false }
        ],
        programId: PRESALE_PROGRAM_ID,
        data: finalInstructionData,
      });

      setStatus('📝 Requesting signature...');
      
      const { blockhash } = await connection.getLatestBlockhash();
      instruction.recentBlockhash = blockhash;
      instruction.feePayer = publicKeyObj;

      const signedTransaction = await signTransaction(instruction);
      
      setStatus('📡 Sending transaction...');
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      setStatus('⏳ Confirming transaction...');
      await connection.confirmTransaction(signature);
      
      setStatus(`✅ Presale initialized! TX: ${signature}`);

    } catch (error: unknown) {
      console.error('Error initializing presale:', error);
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div style={{ 
        padding: '20px', 
        border: '2px solid #ffa500', 
        borderRadius: '8px', 
        backgroundColor: '#fff5ee',
        margin: '20px 0'
      }}>
        <h3>🔧 Admin Panel</h3>
        <p>Connect wallet to access admin functions</p>
      </div>
    );
  }

  if (!isAuthority) {
    return (
      <div style={{ 
        padding: '20px', 
        border: '2px solid #ff6b6b', 
        borderRadius: '8px', 
        backgroundColor: '#ffe5e5',
        margin: '20px 0'
      }}>
        <h3>🚫 Access Denied</h3>
        <p>Only the authority wallet can access admin functions</p>
        <p><strong>Connected:</strong> {publicKeyObj?.toString()}</p>
        <p><strong>Required:</strong> Uvqj1b7jR1EKXyDAqoH1c3VPdjaRRGGHWPXGZe7LTH5</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #4caf50', 
      borderRadius: '8px', 
      backgroundColor: '#e8f5e8',
      margin: '20px 0'
    }}>
      <h3>🔧 Admin Panel - Authority Connected</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>📋 Presale Initialization</h4>
        <p><strong>Parameters:</strong></p>
        <ul style={{ fontSize: '14px' }}>
          <li>Start: Now</li>
          <li>End: 1 year from now</li>
          <li>Hard Cap: 1,000,000 VIBES</li>
          <li>Initial Price: $0.0598 per VIBES</li>
        </ul>
      </div>

      <button
        onClick={initializePresale}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          marginRight: '10px'
        }}
      >
        {loading ? '⏳ Initializing...' : '🚀 Initialize Presale'}
      </button>

      {status && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {status}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p><strong>⚠️ Warning:</strong> This will initialize the presale with real parameters on devnet.</p>
        <p>Only run this once. Multiple attempts may fail or overwrite existing data.</p>
      </div>
    </div>
  );
};
