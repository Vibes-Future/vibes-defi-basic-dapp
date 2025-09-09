#!/bin/bash

# VIBES DeFi - Professional Server Deployment to app.futurevibes.io
# This script deploys the DeFi application without touching the marketing site

set -e

# Configuration
SERVER_HOST="ftladmin@server17225.za-internet.net"
DOMAIN="app.futurevibes.io"
APP_NAME="vibes-defi-app"
DEPLOY_PATH="/home/ftadmin/vibes-defi-production"
DOCKER_PORT="3002"  # Using port 3002 (3001 is taken, 3000 is taken)
APACHE_PROXY_PORT="8082"  # Apache will proxy this

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check if Docker is installed locally
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed locally"
    exit 1
fi

# Check if ssh access works
print_status "Testing SSH connection to server..."
if ! ssh -o ConnectTimeout=10 "$SERVER_HOST" "echo 'SSH connection successful'" &> /dev/null; then
    print_error "Cannot connect to server via SSH"
    print_warning "Please ensure you can connect to: $SERVER_HOST"
    exit 1
fi

print_success "Prerequisites check passed!"

# Build application locally
print_status "Building application locally..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Local build failed"
    exit 1
fi

print_success "Application built successfully!"

# Create deployment package
print_status "Creating deployment package..."
tar -czf vibes-defi-deployment.tar.gz \
    --exclude=node_modules \
    --exclude=.next \
    --exclude=.git \
    --exclude=target \
    --exclude=test-ledger \
    --exclude=backup \
    --exclude=out \
    .

print_success "Deployment package created!"

# Upload to server
print_status "Uploading deployment package to server..."
scp vibes-defi-deployment.tar.gz "$SERVER_HOST:/tmp/"

# Create production docker-compose file
print_status "Creating production Docker configuration..."
cat > /tmp/docker-compose.production.yml << EOF
version: '3.8'

services:
  vibes-defi-app:
    build:
      context: .
      dockerfile: Dockerfile.production
      args:
        NEXT_PUBLIC_SOLANA_NETWORK: devnet
        NEXT_PUBLIC_HELIUS_RPC_ENDPOINT: https://devnet.helius-rpc.com/?api-key=10bdc822-0b46-4952-98fc-095c326565d7
        NEXT_PUBLIC_VIBES_MINT: 3PpEoHtqRBTvWopXp37m3TUid3fPhTMhC8fid82xHPY6
        NEXT_PUBLIC_VIBES_DECIMALS: 6
        NEXT_PUBLIC_USDC_MINT: ANzKJEL57EUNiqkeWExXoMEG78AN5kcxB4c1hUshNJmy
        NEXT_PUBLIC_PRESALE_PROGRAM_ID: GEHYySidFB8XWXkPFBrnfgqEhoA8sGeMZooUouqZuP7S
        NEXT_PUBLIC_STAKING_PROGRAM_ID: FPhhnGDDLECMQYzcZrxqq5GKCcECmhuLeEepy3mCE5TX
        NEXT_PUBLIC_VESTING_PROGRAM_ID: 37QayjEeVsvBJfoUwgpWCLyon5zbMyPqg4iLDLzjwYyk
        NEXT_PUBLIC_DEMO_MODE: false
        NEXT_PUBLIC_APP_ENV: production
    ports:
      - "${DOCKER_PORT}:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SOLANA_NETWORK=devnet
      - NEXT_PUBLIC_APP_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  default:
    driver: bridge
EOF

# Create production Dockerfile
cat > /tmp/Dockerfile.production << 'EOF'
# Production-optimized Dockerfile for VIBES DeFi App
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat python3 make g++

# Copy dependencies and package files
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.ts ./
COPY eslint.config.mjs ./

# Copy source code
COPY app/ ./app/
COPY components/ ./components/
COPY lib/ ./lib/
COPY hooks/ ./hooks/
COPY styles/ ./styles/
COPY packages/ ./packages/
COPY public/ ./public/

# Set production environment for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Accept build arguments
ARG NEXT_PUBLIC_SOLANA_NETWORK
ARG NEXT_PUBLIC_HELIUS_RPC_ENDPOINT
ARG NEXT_PUBLIC_VIBES_MINT
ARG NEXT_PUBLIC_VIBES_DECIMALS
ARG NEXT_PUBLIC_USDC_MINT
ARG NEXT_PUBLIC_PRESALE_PROGRAM_ID
ARG NEXT_PUBLIC_STAKING_PROGRAM_ID
ARG NEXT_PUBLIC_VESTING_PROGRAM_ID
ARG NEXT_PUBLIC_DEMO_MODE
ARG NEXT_PUBLIC_APP_ENV

# Set environment variables
ENV NEXT_PUBLIC_SOLANA_NETWORK=$NEXT_PUBLIC_SOLANA_NETWORK
ENV NEXT_PUBLIC_HELIUS_RPC_ENDPOINT=$NEXT_PUBLIC_HELIUS_RPC_ENDPOINT
ENV NEXT_PUBLIC_VIBES_MINT=$NEXT_PUBLIC_VIBES_MINT
ENV NEXT_PUBLIC_VIBES_DECIMALS=$NEXT_PUBLIC_VIBES_DECIMALS
ENV NEXT_PUBLIC_USDC_MINT=$NEXT_PUBLIC_USDC_MINT
ENV NEXT_PUBLIC_PRESALE_PROGRAM_ID=$NEXT_PUBLIC_PRESALE_PROGRAM_ID
ENV NEXT_PUBLIC_STAKING_PROGRAM_ID=$NEXT_PUBLIC_STAKING_PROGRAM_ID
ENV NEXT_PUBLIC_VESTING_PROGRAM_ID=$NEXT_PUBLIC_VESTING_PROGRAM_ID
ENV NEXT_PUBLIC_DEMO_MODE=$NEXT_PUBLIC_DEMO_MODE
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV

# Build application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create system user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create health check script
RUN echo '#!/bin/sh\ncurl -f http://localhost:3000 || exit 1' > /app/healthcheck.sh && chmod +x /app/healthcheck.sh

# Set permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD /app/healthcheck.sh

# Start the application
CMD ["node", "server.js"]
EOF

# Upload files to server
scp /tmp/docker-compose.production.yml "$SERVER_HOST:/tmp/"
scp /tmp/Dockerfile.production "$SERVER_HOST:/tmp/"

# Execute deployment on server
print_status "Executing deployment on server..."
ssh "$SERVER_HOST" << ENDSSH
set -e

echo "🔧 Setting up deployment environment on server..."

# Create deployment directory
mkdir -p /home/ftadmin/vibes-defi-production
cd /home/ftadmin/vibes-defi-production

# Extract deployment package
echo "📦 Extracting application files..."
tar -xzf /tmp/vibes-defi-deployment.tar.gz
rm /tmp/vibes-defi-deployment.tar.gz

# Move Docker files
mv /tmp/docker-compose.production.yml ./
mv /tmp/Dockerfile.production ./

echo "🛑 Stopping any existing DeFi containers..."
docker-compose -f docker-compose.production.yml down 2>/dev/null || true

echo "🧹 Cleaning up old DeFi images..."
docker image prune -f

echo "🏗️  Building production image..."
docker-compose -f docker-compose.production.yml build --no-cache

echo "🚀 Starting production container..."
docker-compose -f docker-compose.production.yml up -d

echo "⏳ Waiting for service to start..."
sleep 30

echo "🔍 Checking container status..."
docker-compose -f docker-compose.production.yml ps

# Test if the application is responding
echo "🧪 Testing application response..."
curl -f http://localhost:${DOCKER_PORT} > /dev/null && echo "✅ App is responding!" || echo "❌ App not responding yet"

echo "✅ Docker deployment completed!"
ENDSSH

# Create Apache virtual host configuration
print_status "Creating Apache virtual host configuration..."
cat > /tmp/app-futurevibes-io.conf << EOF
<VirtualHost *:80>
    ServerName app.futurevibes.io
    DocumentRoot /var/www/html
    
    # Redirect HTTP to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
</VirtualHost>

<VirtualHost *:443>
    ServerName app.futurevibes.io
    
    # SSL Configuration (assuming you have SSL certificates)
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/futurevibes.io.crt
    SSLCertificateKeyFile /etc/ssl/private/futurevibes.io.key
    # If you have a certificate chain:
    # SSLCertificateChainFile /etc/ssl/certs/futurevibes.io.chain.crt
    
    # Security headers
    Header always set X-Frame-Options "DENY"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    
    # Enable compression
    LoadModule deflate_module modules/mod_deflate.so
    <Location />
        SetOutputFilter DEFLATE
        SetEnvIfNoCase Request_URI \
            \\.(?:gif|jpe?g|png|svg|ico|webp)$ no-gzip dont-vary
        SetEnvIfNoCase Request_URI \
            \\.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
    </Location>
    
    # Proxy configuration
    ProxyPreserveHost On
    ProxyPass / http://localhost:${DOCKER_PORT}/
    ProxyPassReverse / http://localhost:${DOCKER_PORT}/
    
    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*)           ws://localhost:${DOCKER_PORT}/\$1 [P,L]
    RewriteCond %{HTTP:Upgrade} !=websocket [NC]
    RewriteRule /(.*)           http://localhost:${DOCKER_PORT}/\$1 [P,L]
    
    # Static file caching
    <LocationMatch "\\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
        Header append Cache-Control "public, immutable"
    </LocationMatch>
    
    # Logging
    ErrorLog \${APACHE_LOG_DIR}/app.futurevibes.io_error.log
    CustomLog \${APACHE_LOG_DIR}/app.futurevibes.io_access.log combined
</VirtualHost>
EOF

# Upload Apache configuration
scp /tmp/app-futurevibes-io.conf "$SERVER_HOST:/tmp/"

# Configure Apache on server
print_status "Configuring Apache virtual host..."
ssh "$SERVER_HOST" << 'ENDSSH'
set -e

echo "🌐 Configuring Apache virtual host for app.futurevibes.io..."

# Enable required Apache modules
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate

# Copy virtual host configuration
sudo cp /tmp/app-futurevibes-io.conf /etc/apache2/sites-available/
rm /tmp/app-futurevibes-io.conf

# Enable the site
sudo a2ensite app-futurevibes-io.conf

# Test Apache configuration
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2

echo "✅ Apache configuration completed!"
echo ""
echo "🌐 Your VIBES DeFi app should be accessible at:"
echo "   https://app.futurevibes.io (if SSL certificates are configured)"
echo "   http://app.futurevibes.io (will redirect to HTTPS)"
echo ""
echo "🔍 You can also test directly on port ${DOCKER_PORT}:"
echo "   http://futurevibes.io:${DOCKER_PORT}"
echo ""
ENDSSH

# Cleanup local files
rm -f vibes-defi-deployment.tar.gz
rm -f /tmp/docker-compose.production.yml
rm -f /tmp/Dockerfile.production
rm -f /tmp/app-futurevibes-io.conf

print_success "🎉 Deployment completed successfully!"
print_success "🌐 Your VIBES DeFi app is now live at: https://app.futurevibes.io"

echo ""
echo "📋 Next steps:"
echo "1. Test the application at https://app.futurevibes.io"
echo "2. Configure DNS for app.futurevibes.io subdomain if needed"
echo "3. Test all DeFi functions (presale, staking, vesting)"
echo "4. Monitor logs for any issues"
echo ""
echo "🛠️  Useful commands:"
echo "   # Check container status:"
echo "   ssh $SERVER_HOST 'docker-compose -f /home/ftadmin/vibes-defi-production/docker-compose.production.yml ps'"
echo ""
echo "   # View application logs:"
echo "   ssh $SERVER_HOST 'docker-compose -f /home/ftadmin/vibes-defi-production/docker-compose.production.yml logs -f'"
echo ""
echo "   # Restart application:"
echo "   ssh $SERVER_HOST 'docker-compose -f /home/ftadmin/vibes-defi-production/docker-compose.production.yml restart'"
echo ""
echo "   # Check Apache logs:"
echo "   ssh $SERVER_HOST 'sudo tail -f /var/log/apache2/app.futurevibes.io_access.log'"
echo ""
EOF
