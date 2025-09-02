# Netlify Environment Variables Configuration

## Required Environment Variables for Production Deployment

Configure these variables in your Netlify dashboard under **Site settings > Environment variables**:

### 🔗 Solana Network Configuration
```
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
```

### 🪙 VIBES Token Configuration
```
NEXT_PUBLIC_VIBES_MINT=G5n3KqfKZB4qeJAQA3k5dKbj7X264oCjV1vXMnBpwL43
NEXT_PUBLIC_VIBES_DECIMALS=9
```

### 📋 Program IDs (Update with your mainnet program IDs)
```
NEXT_PUBLIC_PRESALE_PROGRAM_ID=your-actual-presale-program-id
NEXT_PUBLIC_STAKING_PROGRAM_ID=your-actual-staking-program-id
NEXT_PUBLIC_VESTING_PROGRAM_ID=your-actual-vesting-program-id
```

### ⚙️ Application Configuration
```
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_APP_ENV=production
```

### 🔧 Optional: Performance & Analytics
```
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your-ga-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## 🚀 Deployment Steps

1. **Fork/Connect Repository**: Connect your GitHub repo to Netlify
2. **Set Environment Variables**: Add all variables above in Netlify dashboard
3. **Configure Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `18`
4. **Deploy**: Netlify will automatically build and deploy

## 🔒 Security Notes

- Never commit `.env` files to Git
- Use Netlify's environment variables for sensitive data
- All `NEXT_PUBLIC_` variables will be exposed to the client
- Keep program IDs and RPC endpoints secure but accessible

## 📱 Testing

After deployment, test:
- ✅ Wallet connections (Phantom, Solflare)
- ✅ Price calendar functionality
- ✅ Payment selector (SOL/USDC)
- ✅ Mobile responsiveness
- ✅ All navigation links


