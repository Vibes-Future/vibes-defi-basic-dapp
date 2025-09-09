# 🚀 VIBES DeFi - Server Deployment Guide

## 📋 Quick Deployment Instructions

### Step 1: Clone Repository on Server
```bash
cd /home/ftadmin/
git clone https://github.com/Vibes-Future/vibes-defi-basic-dapp.git
cd vibes-defi-basic-dapp
```

### Step 2: Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Build the application
npm run build
```

### Step 3: Deploy with Docker
```bash
# Build and start the Docker container on port 3002
docker-compose -f docker-compose.server.yml up -d --build
```

### Step 4: Access the Application
- **Direct access**: `http://futurevibes.io:3002`
- **Local server test**: `http://localhost:3002`

## 🔧 Configuration Details

- **Port Used**: 3002 (free port, won't conflict with existing services)
- **Container Name**: vibes-defi-production
- **Network**: Solana Devnet
- **Environment**: Production

## 📊 Monitoring Commands

```bash
# Check container status
docker ps | grep vibes-defi

# View logs
docker logs vibes-defi-production -f

# Restart if needed
docker-compose -f docker-compose.server.yml restart

# Stop container
docker-compose -f docker-compose.server.yml down
```

## 🔍 Troubleshooting

### If port 3002 is occupied:
```bash
# Check what's using port 3002
sudo netstat -tlnp | grep :3002

# Use different port (edit docker-compose.server.yml)
```

### If build fails:
```bash
# Clear Docker cache
docker system prune -f

# Rebuild from scratch
docker-compose -f docker-compose.server.yml build --no-cache
```

## 🎯 Production URLs

Once deployed, access your DeFi application at:
- `http://futurevibes.io:3002`

The marketing site at `https://futurevibes.io` remains untouched.

## 🔄 Updates

To update the application:
```bash
cd /home/ftadmin/vibes-defi-basic-dapp
git pull origin master
npm run build
docker-compose -f docker-compose.server.yml up -d --build
```
