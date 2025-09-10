#!/bin/bash
# Production Build Script for VIBES DeFi
# This script builds the production Docker image with correct environment variables

set -e  # Exit on any error

echo "🚀 Building VIBES DeFi Production Container..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running${NC}"
    exit 1
fi

# Load environment variables from production config
if [ -f "config/env/production.env" ]; then
    echo -e "${BLUE}📋 Loading production environment variables...${NC}"
    export $(cat config/env/production.env | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}⚠️  Warning: production.env not found, using fallback values${NC}"
fi

# Set image name and tag
IMAGE_NAME="vibes-defi-production"
IMAGE_TAG="latest"
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"

echo -e "${BLUE}📦 Building Docker image: ${FULL_IMAGE_NAME}${NC}"

# Build the Docker image
docker build \
    --file Dockerfile.server \
    --tag $FULL_IMAGE_NAME \
    --build-arg NEXT_PUBLIC_SOLANA_NETWORK="${NEXT_PUBLIC_SOLANA_NETWORK}" \
    --build-arg NEXT_PUBLIC_HELIUS_API_KEY="${NEXT_PUBLIC_HELIUS_API_KEY}" \
    --build-arg NEXT_PUBLIC_HELIUS_RPC_ENDPOINT="${NEXT_PUBLIC_HELIUS_RPC_ENDPOINT}" \
    --build-arg NEXT_PUBLIC_RPC_ENDPOINT="${NEXT_PUBLIC_RPC_ENDPOINT}" \
    --build-arg NEXT_PUBLIC_VIBES_MINT="${NEXT_PUBLIC_VIBES_MINT}" \
    --build-arg NEXT_PUBLIC_VIBES_DECIMALS="${NEXT_PUBLIC_VIBES_DECIMALS}" \
    --build-arg NEXT_PUBLIC_USDC_MINT="${NEXT_PUBLIC_USDC_MINT}" \
    --build-arg NEXT_PUBLIC_PRESALE_PROGRAM_ID="${NEXT_PUBLIC_PRESALE_PROGRAM_ID}" \
    --build-arg NEXT_PUBLIC_STAKING_PROGRAM_ID="${NEXT_PUBLIC_STAKING_PROGRAM_ID}" \
    --build-arg NEXT_PUBLIC_VESTING_PROGRAM_ID="${NEXT_PUBLIC_VESTING_PROGRAM_ID}" \
    --build-arg NEXT_PUBLIC_DEMO_MODE="${NEXT_PUBLIC_DEMO_MODE}" \
    --build-arg NEXT_PUBLIC_APP_ENV="${NEXT_PUBLIC_APP_ENV}" \
    --build-arg NEXT_PUBLIC_PRESALE_START_TIME="${NEXT_PUBLIC_PRESALE_START_TIME}" \
    --build-arg NEXT_PUBLIC_PRESALE_END_TIME="${NEXT_PUBLIC_PRESALE_END_TIME}" \
    --build-arg NEXT_PUBLIC_PRESALE_HARD_CAP="${NEXT_PUBLIC_PRESALE_HARD_CAP}" \
    --build-arg NEXT_PUBLIC_MAX_PURCHASE_PER_WALLET="${NEXT_PUBLIC_MAX_PURCHASE_PER_WALLET}" \
    --build-arg NEXT_PUBLIC_MIN_SOL_PURCHASE="${NEXT_PUBLIC_MIN_SOL_PURCHASE}" \
    --build-arg NEXT_PUBLIC_FEE_RATE_BPS="${NEXT_PUBLIC_FEE_RATE_BPS}" \
    --build-arg NEXT_PUBLIC_PRESALE_STATE_PDA="${NEXT_PUBLIC_PRESALE_STATE_PDA}" \
    --build-arg NEXT_PUBLIC_TEST_WALLET_ADDRESS="${NEXT_PUBLIC_TEST_WALLET_ADDRESS}" \
    .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build completed successfully!${NC}"
    echo -e "${BLUE}📊 Image size:${NC}"
    docker images $FULL_IMAGE_NAME
    
    echo ""
    echo -e "${GREEN}🎉 Production image ready for deployment!${NC}"
    echo -e "${BLUE}🐳 Image name: ${FULL_IMAGE_NAME}${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Test the image: docker run --rm -p 3000:3000 $FULL_IMAGE_NAME"
    echo "  2. Deploy with docker-compose: docker-compose -f docker-compose.server.yml up -d"
    echo "  3. Push to registry: docker tag $FULL_IMAGE_NAME your-registry/$FULL_IMAGE_NAME"
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi
