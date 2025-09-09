# Use Node.js 20 image with full build tools
FROM node:20-bullseye-slim AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libudev-dev \
    linux-libc-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package files from root
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libudev-dev \
    linux-libc-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
# Copy configuration files
COPY package.json package-lock.json* ./
COPY tsconfig.json ./
COPY next.config.ts ./
COPY eslint.config.mjs ./
# Copy source code in current structure
COPY app/ ./app/
COPY components/ ./components/
COPY lib/ ./lib/
COPY hooks/ ./hooks/
COPY styles/ ./styles/
COPY packages/ ./packages/
COPY public/ ./public/

# Accept build arguments for environment variables
ARG NEXT_PUBLIC_SOLANA_NETWORK
ARG NEXT_PUBLIC_RPC_ENDPOINT
ARG NEXT_PUBLIC_VIBES_MINT
ARG NEXT_PUBLIC_VIBES_DECIMALS
ARG NEXT_PUBLIC_USDC_MINT
ARG NEXT_PUBLIC_PRESALE_PROGRAM_ID
ARG NEXT_PUBLIC_STAKING_PROGRAM_ID
ARG NEXT_PUBLIC_VESTING_PROGRAM_ID
ARG NEXT_PUBLIC_DEMO_MODE
ARG NEXT_PUBLIC_APP_ENV

# Set environment variables from build arguments
ENV NEXT_PUBLIC_SOLANA_NETWORK=$NEXT_PUBLIC_SOLANA_NETWORK
ENV NEXT_PUBLIC_RPC_ENDPOINT=$NEXT_PUBLIC_RPC_ENDPOINT
ENV NEXT_PUBLIC_VIBES_MINT=$NEXT_PUBLIC_VIBES_MINT
ENV NEXT_PUBLIC_VIBES_DECIMALS=$NEXT_PUBLIC_VIBES_DECIMALS
ENV NEXT_PUBLIC_USDC_MINT=$NEXT_PUBLIC_USDC_MINT
ENV NEXT_PUBLIC_PRESALE_PROGRAM_ID=$NEXT_PUBLIC_PRESALE_PROGRAM_ID
ENV NEXT_PUBLIC_STAKING_PROGRAM_ID=$NEXT_PUBLIC_STAKING_PROGRAM_ID
ENV NEXT_PUBLIC_VESTING_PROGRAM_ID=$NEXT_PUBLIC_VESTING_PROGRAM_ID
ENV NEXT_PUBLIC_DEMO_MODE=$NEXT_PUBLIC_DEMO_MODE
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV

# Build the application
RUN npm run build

# Production image - run the application
FROM node:20-bullseye-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs

# Copy the built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]


