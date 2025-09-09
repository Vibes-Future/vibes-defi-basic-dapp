#!/bin/bash

# VIBES DeFi - Professional Server Deployment Script
# This script deploys the application to your production server

set -e

echo "🚀 VIBES DeFi - Production Server Deployment"
echo "============================================="

# Configuration
SERVER_HOST="ftadmin@server17225.za-internet.net"
DOMAIN="futurevibes.io"
APP_NAME="vibes-defi-app"
DEPLOY_PATH="/home/ftadmin/vibes-defi-production"
DOCKER_IMAGE_NAME="vibes-defi-production"

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
    .

print_success "Deployment package created!"

# Upload to server
print_status "Uploading deployment package to server..."
scp vibes-defi-deployment.tar.gz "$SERVER_HOST:/tmp/"

# Execute deployment on server
print_status "Executing deployment on server..."
ssh "$SERVER_HOST" << 'ENDSSH'
set -e

echo "🔧 Setting up deployment environment on server..."

# Create deployment directory
sudo mkdir -p /home/ftadmin/vibes-defi-production
cd /home/ftadmin/vibes-defi-production

# Extract deployment package
echo "📦 Extracting application files..."
tar -xzf /tmp/vibes-defi-deployment.tar.gz
rm /tmp/vibes-defi-deployment.tar.gz

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "📥 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ftadmin
    sudo systemctl start docker
    sudo systemctl enable docker
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "🔧 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

echo "✅ Server environment setup completed!"
ENDSSH

# Create production docker-compose file
print_status "Creating production Docker configuration..."
cat > /tmp/docker-compose.production.yml << 'EOF'
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/nginx/nginx.production.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - vibes-defi-app
    restart: unless-stopped
    networks:
      - vibes-network

  vibes-defi-app:
    build:
      context: .
      dockerfile: config/docker/Dockerfile.production
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
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SOLANA_NETWORK=devnet
      - NEXT_PUBLIC_APP_ENV=production
    restart: unless-stopped
    networks:
      - vibes-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  vibes-network:
    driver: bridge

volumes:
  app_data:
EOF

# Upload production config
scp /tmp/docker-compose.production.yml "$SERVER_HOST:/home/ftladmin/vibes-defi-production/"

# Create production Nginx config
print_status "Creating production Nginx configuration..."
cat > /tmp/nginx.production.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;
    
    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        application/javascript
        application/json
        application/xml
        text/css
        text/javascript
        text/plain
        text/xml;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https: wss: ws:;" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    upstream app {
        server vibes-defi-app:3000;
    }
    
    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name futurevibes.io www.futurevibes.io;
        return 301 https://$server_name$request_uri;
    }
    
    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name futurevibes.io www.futurevibes.io;
        
        # SSL configuration (you'll need to add certificates)
        # ssl_certificate /etc/nginx/ssl/cert.pem;
        # ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        # For now, we'll serve HTTP until SSL is configured
        # Remove the ssl directive above and use this for testing:
        listen 80;
        
        # Security headers for HTTPS
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
        
        # Static files caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://app;
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Access-Control-Allow-Origin "*";
        }
        
        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
        
        # Main application
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
        
        # Health check endpoint
        location /health {
            access_log off;
            proxy_pass http://app/health;
        }
        
        # Security.txt
        location /.well-known/security.txt {
            return 200 "Contact: admin@futurevibes.io\nExpires: 2026-01-01T00:00:00.000Z\nPreferred-Languages: en\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Upload Nginx config
ssh "$SERVER_HOST" "mkdir -p /home/ftadmin/vibes-defi-production/config/nginx"
scp /tmp/nginx.production.conf "$SERVER_HOST:/home/ftadmin/vibes-defi-production/config/nginx/"

# Create production Dockerfile
print_status "Creating production Dockerfile..."
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

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

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

# Set permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start the application
CMD ["node", "server.js"]
EOF

# Upload production Dockerfile
ssh "$SERVER_HOST" "mkdir -p /home/ftadmin/vibes-defi-production/config/docker"
scp /tmp/Dockerfile.production "$SERVER_HOST:/home/ftladmin/vibes-defi-production/config/docker/"

# Deploy on server
print_status "Starting deployment on server..."
ssh "$SERVER_HOST" << 'ENDSSH'
set -e

cd /home/ftladmin/vibes-defi-production

echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.production.yml down 2>/dev/null || true

echo "🧹 Cleaning up old images..."
docker system prune -f

echo "🏗️  Building production image..."
docker-compose -f docker-compose.production.yml build --no-cache

echo "🚀 Starting production containers..."
docker-compose -f docker-compose.production.yml up -d

echo "⏳ Waiting for services to start..."
sleep 30

echo "🔍 Checking container status..."
docker-compose -f docker-compose.production.yml ps

echo "✅ Deployment completed!"
echo ""
echo "🌐 Your VIBES DeFi app should be accessible at:"
echo "   http://futurevibes.io"
echo ""
echo "📊 To monitor logs:"
echo "   docker-compose -f docker-compose.production.yml logs -f"
echo ""
echo "🔄 To restart services:"
echo "   docker-compose -f docker-compose.production.yml restart"
echo ""
ENDSSH

# Cleanup local files
rm -f vibes-defi-deployment.tar.gz
rm -f /tmp/docker-compose.production.yml
rm -f /tmp/nginx.production.conf
rm -f /tmp/Dockerfile.production

print_success "🎉 Deployment completed successfully!"
print_success "🌐 Your VIBES DeFi app is now live at: http://futurevibes.io"
print_warning "🔒 Don't forget to set up SSL certificates for HTTPS"

echo ""
echo "📋 Next steps:"
echo "1. Test the application at http://futurevibes.io"
echo "2. Set up SSL certificates for HTTPS"
echo "3. Configure domain DNS if needed"
echo "4. Set up monitoring and logging"
echo ""
echo "🛠️  Useful commands:"
echo "   ssh $SERVER_HOST 'docker-compose -f /home/ftadmin/vibes-defi-production/docker-compose.production.yml logs -f'"
echo "   ssh $SERVER_HOST 'docker-compose -f /home/ftladmin/vibes-defi-production/docker-compose.production.yml ps'"
echo ""
