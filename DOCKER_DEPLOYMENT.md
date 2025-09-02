# 🐳 Docker Deployment Guide for VIBES DeFi

## 🚀 Quick Start

### Option 1: Simple Docker Build & Run
```bash
# Build the image
docker build -t vibes-defi-app .

# Run the container
docker run -p 3000:3000 vibes-defi-app
```

### Option 2: Docker Compose (Recommended)
```bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop
docker-compose down
```

### Option 3: Production with Nginx
```bash
# Run with nginx proxy
docker-compose --profile production up --build -d
```

## 🔧 Environment Variables

Update the environment variables in `docker-compose.yml` with your actual values:

```yaml
environment:
  # Solana Network
  - NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
  - NEXT_PUBLIC_RPC_ENDPOINT=https://your-helius-rpc-endpoint
  
  # VIBES Token (already configured)
  - NEXT_PUBLIC_VIBES_MINT=G5n3KqfKZB4qeJAQA3k5dKbj7X264oCjV1vXMnBpwL43
  - NEXT_PUBLIC_VIBES_DECIMALS=9
  
  # Program IDs (UPDATE THESE)
  - NEXT_PUBLIC_PRESALE_PROGRAM_ID=your-actual-mainnet-presale-id
  - NEXT_PUBLIC_STAKING_PROGRAM_ID=your-actual-mainnet-staking-id
  - NEXT_PUBLIC_VESTING_PROGRAM_ID=your-actual-mainnet-vesting-id
```

## 🌐 Deployment Options

### 1. **DigitalOcean App Platform**
```bash
# Push to GitHub and connect to DO App Platform
# Automatic Docker builds from repository
```

### 2. **AWS ECS/Fargate**
```bash
# Build and push to ECR
docker build -t vibes-defi .
docker tag vibes-defi:latest YOUR_ECR_URI:latest
docker push YOUR_ECR_URI:latest
```

### 3. **Google Cloud Run**
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT_ID/vibes-defi
gcloud run deploy --image gcr.io/PROJECT_ID/vibes-defi --platform managed
```

### 4. **VPS/Dedicated Server**
```bash
# On your server
git clone https://github.com/Vibes-Future/vibes-defi-basic-dapp.git
cd vibes-defi-basic-dapp
docker-compose --profile production up -d --build
```

## 🔒 Production Security

### SSL/HTTPS Setup
1. Get SSL certificates (Let's Encrypt recommended)
2. Update `nginx.conf` with your domain and certificates
3. Uncomment HTTPS server block

### Firewall Rules
```bash
# Only allow HTTP/HTTPS traffic
ufw allow 80
ufw allow 443
ufw deny 3000  # Block direct access to app
```

## 📊 Monitoring & Logs

### View Logs
```bash
# App logs
docker-compose logs -f vibes-defi-app

# Nginx logs
docker-compose logs -f nginx

# All services
docker-compose logs -f
```

### Health Checks
```bash
# Check app health
curl http://localhost:3000

# Check nginx health
curl http://localhost/health
```

## 🚀 CI/CD Pipeline

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.KEY }}
          script: |
            cd /path/to/vibes-defi-basic-dapp
            git pull origin main
            docker-compose --profile production up -d --build
```

## 🔧 Troubleshooting

### Build Issues
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Memory Issues
```bash
# Add memory limits to docker-compose.yml
deploy:
  resources:
    limits:
      memory: 512M
    reservations:
      memory: 256M
```

## 📈 Performance Optimization

### Multi-stage Build Benefits
- ✅ Smaller final image (~100MB vs ~1GB)
- ✅ No development dependencies in production
- ✅ Better security (minimal attack surface)
- ✅ Faster deployments

### Static File Serving
- ✅ Nginx serves static files efficiently
- ✅ Gzip compression enabled
- ✅ Browser caching optimized
- ✅ CDN-ready headers

## 🎯 Advantages of Docker vs Netlify

### ✅ **Docker Advantages**
1. **Full Control** - Complete environment control
2. **Node.js Version** - Can use Node 20+ without issues
3. **No Build Limits** - No 15-minute build time limits
4. **Better Performance** - Optimized static file serving
5. **Cost Effective** - $5-20/month vs potential Netlify overages
6. **Scalable** - Easy horizontal scaling
7. **Custom Logic** - Can add API endpoints if needed

### 📊 **Cost Comparison**
- **VPS (DigitalOcean):** $6/month
- **Google Cloud Run:** ~$2-10/month (pay per use)
- **AWS Fargate:** ~$5-15/month
- **Netlify Pro:** $19/month + bandwidth overages

## 🚀 Ready to Deploy!

Your VIBES DeFi app is now containerized and ready for production deployment with:
- ✅ Node.js 20 support
- ✅ Optimized build process
- ✅ Security headers
- ✅ Gzip compression
- ✅ Health monitoring
- ✅ Production-ready nginx config


