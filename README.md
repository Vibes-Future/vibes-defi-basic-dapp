# VIBES DeFi - Complete DeFi Ecosystem

A comprehensive decentralized finance (DeFi) application built on Solana, featuring presale, staking, and vesting mechanisms for the VIBES token ecosystem.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🏗️ Architecture

### Core Features
- **Token Presale**: 12-month presale with tiered pricing (Sept 2025 - Aug 2026)
- **Staking System**: 40% APY with reward distribution and charity allocation
- **Vesting Protocol**: Cliff-based token release (40% at listing, 20% each 30 days)
- **Mobile-First Design**: Responsive UI with optimized touch interactions

### Tech Stack
- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Custom CSS modules
- **Blockchain**: Solana Web3.js, Wallet Adapter
- **Build**: Turbopack (Next.js 15)

## 📊 Token Information

- **Token**: VIBES
- **Contract**: `G5n3KqfKZB4qeJAQA3k5dKbj7X264oCjV1vXMnBpwL43`
- **Decimals**: 9 (Solana standard)
- **Network**: Solana

## 💰 Presale Schedule

| Month | Price (USD) | Start Date |
|-------|-------------|------------|
| September 2025 | $0.0598 | Sept 1, 2025 |
| October 2025 | $0.0658 | Oct 1, 2025 |
| November 2025 | $0.0718 | Nov 1, 2025 |
| ... | ... | ... |
| August 2026 | $0.1137 | Aug 1, 2026 |

## 🛠️ Development

### Environment Setup

1. Copy environment variables:
```bash
cp env.example .env.local
```

2. Configure your environment variables in `.env.local`

### Project Structure

```
src/
├── app/                 # Next.js App Router
├── features/           # Feature-based components
│   ├── presale/        # Presale functionality
│   ├── staking/        # Staking system
│   ├── vesting/        # Vesting protocol
│   └── wallet/         # Wallet integration
├── layout/             # Layout components
├── lib/                # Utilities and configuration
├── services/           # Blockchain services
└── styles/             # Organized CSS modules
```

## 🔧 Smart Contracts

### Devnet Program IDs
- **Presale**: `GS3E6DPPkpkD6dV2vnM7LKiMghiJ4TXk1fzHFistTHQE`
- **Vesting**: `HXiAcHVkxdpAkeyFtu47mRkcEF3AxjqmGV7kfcunnaLY`
- **Staking**: `HNQ66x9jd7tdghh4KyeyJbtEqBC7NDw1CyU5fiERS6DW`

## 📱 Features

### Presale
- SOL and USDC payment methods
- Real-time price calculation
- Monthly price tier progression
- Purchase history tracking

### Staking
- 40% APY rewards
- Global cap of 15M VIBES
- Automatic reward distribution
- 3% charity allocation

### Vesting
- Cliff-based vesting schedule
- 40% at token listing
- 20% released every 30 days (3 additional releases)
- Secure token distribution

## 🚀 Deployment

Ready for mainnet deployment with:
- Production-optimized build
- Professional UI/UX
- Real business logic implementation
- Mobile-responsive design

## 📄 License

Private project - All rights reserved

---

Built with ❤️ for the VIBES community