#!/bin/bash

# Script to copy environment configuration to server

SERVER_HOST="ftadmin@server17225.za-internet.net"
SERVER_PATH="/home/ftadmin/vibes-defi-basic-dapp"

echo "🔧 Copying environment configuration to server..."

# Create .env.local on server
ssh "$SERVER_HOST" << 'EOF'
cd ~/vibes-defi-basic-dapp

echo "📝 Creating .env.local file..."
cat > .env.local << 'ENVEOF'
# Solana Network Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Helius RPC Configuration (From smart contract project)
NEXT_PUBLIC_HELIUS_API_KEY=10bdc822-0b46-4952-98fc-095c326565d7
NEXT_PUBLIC_HELIUS_RPC_ENDPOINT=https://devnet.helius-rpc.com/?api-key=10bdc822-0b46-4952-98fc-095c326565d7
NEXT_PUBLIC_RPC_ENDPOINT=https://devnet.helius-rpc.com/?api-key=10bdc822-0b46-4952-98fc-095c326565d7

# Smart Contract Program IDs (From deployed smart contracts)
NEXT_PUBLIC_PRESALE_PROGRAM_ID=GEHYySidFB8XWXkPFBrnfgqEhoA8sGeMZooUouqZuP7S
NEXT_PUBLIC_VESTING_PROGRAM_ID=37QayjEeVsvBJfoUwgpWCLyon5zbMyPqg4iLDLzjwYyk
NEXT_PUBLIC_STAKING_PROGRAM_ID=FPhhnGDDLECMQYzcZrxqq5GKCcECmhuLeEepy3mCE5TX

# Token Addresses (From deployed tokens)
NEXT_PUBLIC_VIBES_MINT=3PpEoHtqRBTvWopXp37m3TUid3fPhTMhC8fid82xHPY6
NEXT_PUBLIC_VIBES_DECIMALS=6
NEXT_PUBLIC_USDC_MINT=ANzKJEL57EUNiqkeWExXoMEG78AN5kcxB4c1hUshNJmy

# Demo Mode (set to false for production functionality)
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_APP_ENV=production
ENVEOF

echo "✅ .env.local created successfully!"
echo "📋 Environment variables:"
cat .env.local
EOF

echo "✅ Environment configuration copied to server!"
echo ""
echo "🚀 Next steps:"
echo "1. SSH to server: ssh $SERVER_HOST"
echo "2. Go to project: cd ~/vibes-defi-basic-dapp"
echo "3. Rebuild Docker: docker-compose -f docker-compose.server.yml up -d --build"
