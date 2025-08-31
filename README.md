# VIBES DeFi - Basic DApp

A basic Web3 decentralized application (DApp) for VIBES DeFi ecosystem built on Solana blockchain.

## Features

### 🚀 Token Presale
- **Dual Payment Methods**: Buy VIBES tokens with SOL or USDC
- **Dynamic Pricing**: Tiered pricing structure based on raised amounts
- **Real-time Calculations**: Live token amount calculations
- **Devnet Testing**: Built-in SOL airdrop for testing

### 📈 Staking Pool
- **High APY**: Earn 40% annual percentage yield
- **Social Impact**: 3% of rewards automatically donated to charity
- **Flexible Staking**: Stake and unstake at any time
- **Real-time Rewards**: Live reward calculation and claiming

### ⏰ Vesting Schedule
- **Cliff & Linear Vesting**: 1-year cliff + 3-month linear release
- **Smart Timing**: 40% after cliff, then 20% monthly
- **Self-Managed**: Users control their own vesting claims
- **Progress Tracking**: Visual progress indicators

## Smart Contracts (Devnet)

- **Presale Program**: `GS3E6DPPkpkD6dV2vnM7LKiMghiJ4TXk1fzHFistTHQE`
- **Staking Program**: `HNQ66x9jd7tdghh4KyeyJbtEqBC7NDw1CyU5fiERS6DW`
- **Vesting Program**: `HXiAcHVkxdpAkeyFtu47mRkcEF3AxjqmGV7kfcunnaLY`

## Token Addresses (Devnet)

- **VIBES Mint**: `84LT3VSyUEoyyt4u3D4No2fCfHnMdh7noyG2qd8FiQbo`
- **USDC Mint**: `3HUzJfpyyFS4XodTRPFkGqjjGo7MHhQqJMwFu1HMkuUe`

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Solana wallet (Phantom, Solflare, etc.)
- Some Devnet SOL (available via airdrop in the app)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo>
   cd vibes-defi-basic-dapp
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp env.example .env
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open application:**
   Navigate to `http://localhost:3000`

### Usage

1. **Connect Wallet**: Click the wallet button to connect your Solana wallet
2. **Get Test SOL**: Use the airdrop button to get 2 SOL for testing
3. **Buy VIBES**: Purchase tokens using SOL or USDC in the presale
4. **Stake Tokens**: Earn rewards by staking your VIBES tokens
5. **Create Vesting**: Set up time-locked token releases

## Architecture

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS (basic HTML in this version)
- **Wallet Integration**: Solana Wallet Adapter
- **State Management**: React Hooks + Custom Store

### Blockchain Integration
- **Network**: Solana Devnet
- **RPC**: Helius RPC (better performance and reliability)
- **Smart Contract Interaction**: Custom service classes
- **Transaction Handling**: Web3.js with Anchor framework

### Key Components

```
src/
├── components/          # UI components
│   ├── WalletProvider.tsx    # Wallet connection provider
│   ├── WalletButton.tsx      # Wallet connection button
│   ├── PresaleCard.tsx       # Presale interface
│   ├── StakingCard.tsx       # Staking interface
│   └── VestingCard.tsx       # Vesting interface
├── services/           # Blockchain interaction services
│   ├── presale.ts           # Presale contract service
│   ├── staking.ts           # Staking contract service
│   └── vesting.ts           # Vesting contract service
├── hooks/              # Custom React hooks
│   └── useWallet.ts         # Wallet state management
└── lib/                # Utility libraries
    ├── config.ts            # Configuration constants
    └── solana.ts            # Solana connection utilities
```

## Important Notes

⚠️ **This is a basic testing version with the following limitations:**

1. **Simplified Contract Integration**: Uses manual instruction building instead of proper IDL
2. **Mock Data**: Some contract state is mocked for demonstration
3. **Devnet Only**: Built for testing on Solana Devnet
4. **Basic UI**: Focuses on functionality over aesthetics
5. **No Error Handling**: Minimal error recovery mechanisms

## Next Steps

For production deployment, consider:

1. **Proper IDL Integration**: Use generated IDL files for type safety
2. **Account Deserialization**: Implement proper Borsh deserialization
3. **Enhanced UI/UX**: Implement modern, responsive design
4. **Error Handling**: Add comprehensive error handling and recovery
5. **Security Audits**: Conduct thorough security reviews
6. **Performance Optimization**: Implement caching and optimization
7. **Mobile Support**: Add responsive mobile interface
8. **Analytics Integration**: Add usage tracking and monitoring

## Contributing

This is a demonstration project. For production use, please:

1. Review and test all smart contract interactions
2. Implement proper error handling
3. Add comprehensive testing suite
4. Follow security best practices
5. Conduct professional security audits

## License

MIT License - see LICENSE file for details

## Disclaimer

This software is provided for educational and testing purposes only. Use at your own risk. Always conduct proper due diligence before deploying to mainnet or handling real funds.