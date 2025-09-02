# 🚀 VIBES DeFi - Professional DeFi Ecosystem

A comprehensive, enterprise-grade DeFi application built on Solana featuring presale, vesting, and staking mechanisms with a professional monorepo architecture.

## ✨ Features

- **🎯 Presale System**: Advanced token sale with SOL/USDC support and dynamic pricing
- **⏰ Vesting System**: Time-locked token distribution with flexible unlock schedules  
- **📈 Staking System**: Stake tokens and earn rewards with compound functionality
- **💼 Wallet Integration**: Multi-wallet support with secure transaction handling
- **🏗️ Professional Architecture**: Clean, scalable monorepo structure
- **🐳 Docker Ready**: Production-ready containerization
- **📚 Comprehensive Docs**: Detailed guides and troubleshooting

## 🏗️ Project Structure

```
vibes-defi-basic-dapp/
├── 📁 apps/web/                       # Next.js Frontend Application
├── 📁 config/                         # Configuration Management
├── 📁 docs/                           # Comprehensive Documentation
├── 📁 packages/                       # Shared Libraries & Services
├── 📁 scripts/                        # Automation & Deployment Scripts
├── 📁 public/                         # Static Assets
└── 📁 tools/                          # Development Tools
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+**
- **npm/yarn**
- **Docker** (optional)
- **Solana CLI** (for development)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd vibes-defi-basic-dapp

# 2. Install dependencies
npm install

# 3. Configure environment
cp config/env/env.example .env.local

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |
| `npm run docker:build` | Build Docker image |
| `npm run docker:up` | Start Docker containers |
| `npm run docker:down` | Stop Docker containers |
| `npm run deploy` | Deploy to production |

## 🐳 Docker Development

```bash
# Quick Docker setup
npm run docker:build
npm run docker:up

# Access application at http://localhost:3000
```

## ⚙️ Configuration

### Environment Variables

Copy `config/env/env.example` to `.env.local` and configure:

```env
# Solana Network Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com

# Program Addresses
NEXT_PUBLIC_VIBES_MINT=your_vibes_mint_address
NEXT_PUBLIC_PRESALE_PROGRAM_ID=your_presale_program_id
NEXT_PUBLIC_STAKING_PROGRAM_ID=your_staking_program_id
NEXT_PUBLIC_VESTING_PROGRAM_ID=your_vesting_program_id

# Application Settings
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_APP_ENV=development
```

## 💡 Key Technologies

- **Frontend**: Next.js 15, React 19, TypeScript
- **Blockchain**: Solana Web3.js, Anchor Framework  
- **Styling**: TailwindCSS 4, Custom Design System
- **Wallet**: Solana Wallet Adapter
- **Infrastructure**: Docker, Nginx
- **Development**: ESLint, TypeScript, Professional Tooling

## 📚 Documentation

| Guide | Location |
|-------|----------|
| **Development** | `docs/development/README.md` |
| **Deployment** | `docs/deployment/` |
| **Troubleshooting** | `docs/troubleshooting/` |

## 🏛️ Architecture

### Professional Monorepo Structure

- **apps/web**: Main Next.js application
- **packages/services**: Blockchain interaction services
- **packages/contracts**: Smart contract IDLs and types
- **packages/ui**: Shared UI components
- **config/**: Centralized configuration management
- **tools/**: Development and build tools

### Import System

Clean imports using TypeScript path mapping:

```typescript
import { Component } from '@/components/features/presale'
import { service } from '@/services/presale'
import { config } from '@/lib/config'
```

## 🚀 Features Deep Dive

### 💰 Advanced Presale System
- Multi-token support (SOL/USDC)
- Dynamic pricing phases
- Real-time analytics
- Transaction confirmation system

### ⏰ Flexible Vesting
- Cliff and linear vesting
- Multiple unlock schedules
- Progress visualization
- Batch claiming

### 📈 Professional Staking
- Compound rewards
- Flexible periods
- Real-time APY calculation
- Emergency unstaking

## 🌐 Deployment

### Production Deployment

```bash
# Using Docker Compose
cd config/docker
docker-compose up -d

# Manual deployment
npm run build
npm run start
```

### Platform Guides

- **AWS**: `docs/deployment/aws-guide.md`
- **Vercel**: `docs/deployment/vercel-guide.md` 
- **Digital Ocean**: `docs/deployment/do-guide.md`

## 🛠️ Development

### Adding Features

1. Create in `apps/web/components/features/`
2. Add services in `packages/services/`
3. Update type definitions
4. Add comprehensive tests
5. Update documentation

### Code Standards

- **TypeScript**: Mandatory for all files
- **ESLint**: Strict linting rules
- **Documentation**: JSDoc for all functions
- **Testing**: Unit and integration tests
- **Responsive**: Mobile-first design

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** Pull Request

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check `docs/` directory
- **Issues**: Open GitHub issues for bugs
- **Discussions**: Use GitHub Discussions for questions
- **Troubleshooting**: See `docs/troubleshooting/`

## 🌟 Acknowledgments

- Solana Foundation for blockchain infrastructure
- Next.js team for the fantastic framework
- Open source community for amazing tools

---

**Built with ❤️ by the VIBES team**