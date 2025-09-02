# VIBES DeFi - Development Guide

## 🏗️ Project Structure

This project follows a professional monorepo structure for better maintainability and scalability:

```
vibes-defi-basic-dapp/
├── 📁 apps/                           # Applications
│   └── 📁 web/                        # Next.js Frontend
│       ├── 📁 app/                    # App Router pages
│       ├── 📁 components/             # React components
│       │   ├── 📁 features/           # Feature-specific components
│       │   └── 📁 layout/             # Layout components
│       ├── 📁 hooks/                  # Custom React hooks
│       ├── 📁 lib/                    # Utilities and configurations
│       └── 📁 styles/                 # Component styles
│
├── 📁 config/                         # Configuration files
│   ├── 📁 docker/                     # Docker configurations
│   ├── 📁 nginx/                      # Nginx configurations
│   └── 📁 env/                        # Environment variables
│
├── 📁 docs/                           # Documentation
│   ├── 📁 deployment/                 # Deployment guides
│   ├── 📁 development/                # Development guides
│   └── 📁 troubleshooting/            # Troubleshooting guides
│
├── 📁 packages/                       # Shared packages
│   ├── 📁 contracts/                  # Smart contract IDLs
│   ├── 📁 services/                   # Blockchain services
│   └── 📁 ui/                         # Shared UI components
│
├── 📁 scripts/                        # Automation scripts
│   ├── 📁 deployment/                 # Deployment scripts
│   ├── 📁 development/                # Development scripts
│   └── 📁 testing/                    # Testing scripts
│
├── 📁 public/                         # Static assets
│   ├── 📁 images/                     # Images
│   └── 📁 icons/                      # Icons and SVGs
│
└── 📁 tools/                          # Development tools
    ├── 📁 build/                      # Build configurations
    └── 📁 lint/                       # Linting configurations
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Docker (optional)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd vibes-defi-basic-dapp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp config/env/env.example .env.local
   ```

### Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

## 🐳 Docker Development

### Build and run with Docker:

```bash
# Build the Docker image
npm run docker:build

# Start the application
npm run docker:up

# Stop the application
npm run docker:down
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run docker:build` - Build Docker image
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers
- `npm run deploy` - Deploy to production

## 🏛️ Architecture

### Components Organization

- **Features**: Business logic components organized by feature (presale, staking, vesting, wallet)
- **Layout**: Reusable layout components (header, hero, etc.)
- **UI**: Shared UI components that can be reused across features

### Services Organization

- **Services**: Blockchain interaction services located in `packages/services/`
- **Contracts**: Smart contract IDLs and types in `packages/contracts/`

### Configuration Management

- **Docker**: All Docker-related configurations in `config/docker/`
- **Environment**: Environment variables in `config/env/`
- **Build Tools**: Build and development tools in `tools/`

## 🔧 Import Aliases

The project uses TypeScript path mapping for clean imports:

```typescript
import { Component } from '@/components/features/presale'
import { service } from '@/services/presale'
import { config } from '@/lib/config'
import { useWallet } from '@/hooks/useWallet'
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Anchor Framework](https://anchor-lang.com/)

## 🤝 Contributing

1. Follow the established folder structure
2. Use TypeScript for all new files
3. Add proper JSDoc comments
4. Update tests when adding new features
5. Ensure Docker builds successfully

## 🔐 Environment Variables

See `config/env/env.example` for all required environment variables.

## 📋 Deployment

See `docs/deployment/` for detailed deployment guides.
