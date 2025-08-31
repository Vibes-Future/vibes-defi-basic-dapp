# Use Node.js 20 Alpine image for smaller size
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ENV NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
ENV NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
ENV NEXT_PUBLIC_VIBES_MINT=G5n3KqfKZB4qeJAQA3k5dKbj7X264oCjV1vXMnBpwL43
ENV NEXT_PUBLIC_VIBES_DECIMALS=9
ENV NEXT_PUBLIC_DEMO_MODE=false
ENV NEXT_PUBLIC_APP_ENV=production

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the built application
COPY --from=builder /app/out ./out
COPY --from=builder /app/public ./public

# Create a simple HTTP server for static files
RUN npm install -g serve

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Serve the static files
CMD ["serve", "-s", "out", "-l", "3000"]
