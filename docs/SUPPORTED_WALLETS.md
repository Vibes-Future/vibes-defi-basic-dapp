# 🔗 Supported Wallets - VIBES DeFi

This document lists all wallet providers supported by the VIBES DeFi application.

## 📱 Mobile & Desktop Wallets

### 1. **Phantom Wallet** 
- **Platform**: Mobile (iOS/Android) + Browser Extension
- **Priority**: Primary (most popular)
- **Features**: Full transaction signing, dApp browser
- **Download**: [phantom.app](https://phantom.app)

### 2. **Trust Wallet**
- **Platform**: Mobile (iOS/Android) + Browser Extension  
- **Priority**: High (widely used)
- **Features**: Multi-chain support, dApp browser, DeFi integration
- **Download**: [trustwallet.com](https://trustwallet.com)

### 3. **Solflare Wallet**
- **Platform**: Mobile + Browser Extension + Web
- **Priority**: High (Solana native)
- **Features**: Native Solana wallet, advanced features
- **Download**: [solflare.com](https://solflare.com)

### 4. **Torus Wallet**
- **Platform**: Web-based (Social Login)
- **Priority**: Medium (easy onboarding)
- **Features**: Social login (Google, Twitter, etc.), no download required
- **Access**: Built into the app

### 5. **Ledger Hardware Wallet**
- **Platform**: Hardware device
- **Priority**: High (security focused)
- **Features**: Cold storage, maximum security
- **Requirements**: Ledger device + Ledger Live

## 🔧 Technical Implementation

All wallets are configured with:
- ✅ **Auto-connect**: Seamless reconnection
- ✅ **Error handling**: Graceful fallbacks
- ✅ **Transaction signing**: Full dApp functionality
- ✅ **Mobile adapter**: Mobile wallet support

## 📋 Connection Order

Wallets appear in this priority order in the selection modal:
1. Phantom (most popular)
2. Trust Wallet (mobile friendly)
3. Solflare (Solana native)
4. Torus (web-based)
5. Ledger (hardware)

## 🛟 Troubleshooting

### Common Issues:
- **Wallet not detected**: Make sure the wallet extension/app is installed
- **Connection fails**: Try refreshing the page or reconnecting
- **Transaction issues**: Check if wallet is unlocked and on Solana network

### Mobile Users:
- Use the wallet's built-in dApp browser
- Or use WalletConnect compatible wallets

## 🔄 Adding New Wallets

To add support for additional wallets:
1. Install the wallet adapter: `npm install @solana/wallet-adapter-[wallet-name]`
2. Import in `WalletProvider.tsx`
3. Add to the wallets array
4. Update this documentation

## 🌐 Network Configuration

All wallets are configured to work with:
- **Mainnet**: Production deployment
- **Devnet**: Development and testing
- **Custom RPC**: Helius endpoint for reliability
