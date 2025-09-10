# 🚀 VIBES DeFi - Production Deployment Guide

This guide covers the complete production deployment process for the VIBES DeFi application.

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ available RAM
- 10GB+ available disk space

## 🔧 Environment Configuration

### Verified Production Environment Variables

The following environment variables have been verified and are configured for production:

```bash
# Network Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_HELIUS_API_KEY=10bdc822-0b46-4952-98fc-095c326565d7

# Smart Contract Addresses (Deployed & Verified)
NEXT_PUBLIC_PRESALE_PROGRAM_ID=GEHYySidFB8XWXkPFBrnfgqEhoA8sGeMZooUouqZuP7S
NEXT_PUBLIC_VESTING_PROGRAM_ID=37QayjEeVsvBJfoUwgpWCLyon5zbMyPqg4iLDLzjwYyk
NEXT_PUBLIC_STAKING_PROGRAM_ID=FPhhnGDDLECMQYzcZrxqq5GKCcECmhuLeEepy3mCE5TX

# Token Addresses (Deployed & Verified)
NEXT_PUBLIC_VIBES_MINT=3PpEoHtqRBTvWopXp37m3TUid3fPhTMhC8fid82xHPY6
NEXT_PUBLIC_USDC_MINT=ANzKJEL57EUNiqkeWExXoMEG78AN5kcxB4c1hUshNJmy
```

## 🚀 Quick Deployment

### Option 1: One-Command Deployment (Recommended)

```bash
./scripts/deploy-production.sh
```

This script will:
- ✅ Check prerequisites
- ✅ Stop existing containers
- ✅ Build production image
- ✅ Deploy with docker-compose
- ✅ Perform health checks
- ✅ Display deployment info

### Option 2: Manual Step-by-Step

```bash
# 1. Build production image
./scripts/build-production.sh

# 2. Deploy with docker-compose
docker-compose -f docker-compose.server.yml up -d

# 3. Check status
docker ps
```

## 🔍 Verification

### Health Checks

```bash
# Check container status
docker ps --filter "name=vibes-defi-production"

# Check application health
curl http://localhost:3002/api/sol-price

# Check logs
docker logs -f vibes-defi-production
```

### Application URLs

- **Main App**: http://localhost:3002
- **Health API**: http://localhost:3002/api/sol-price
- **Presale Data**: http://localhost:3002 (view in browser)

## 🛠️ Management Commands

### Container Management

```bash
# Start application
docker-compose -f docker-compose.server.yml up -d

# Stop application
docker-compose -f docker-compose.server.yml down

# Restart application
docker-compose -f docker-compose.server.yml restart

# View logs
docker logs -f vibes-defi-production

# Access container shell
docker exec -it vibes-defi-production sh
```

### Image Management

```bash
# List images
docker images vibes-defi-production

# Remove old images
docker image prune -f

# Build new image
./scripts/build-production.sh
```

## 📊 Monitoring

### Health Monitoring

The container includes built-in health checks:

```bash
# Check health status
docker inspect vibes-defi-production | grep Health -A 10

# Manual health check
curl -f http://localhost:3002 || echo "App is down"
```

### Resource Monitoring

```bash
# Check resource usage
docker stats vibes-defi-production

# Check disk usage
docker system df
```

## 🔒 Security Features

- ✅ **Non-root user**: Application runs as `nextjs` user
- ✅ **Read-only filesystem**: Container filesystem is immutable
- ✅ **Health checks**: Automatic container restart on failure
- ✅ **Signal handling**: Proper shutdown with dumb-init
- ✅ **Minimal attack surface**: Alpine Linux base image

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3002
lsof -i :3002

# Kill the process
kill -9 <PID>
```

#### Container Won't Start
```bash
# Check logs for errors
docker logs vibes-defi-production

# Check environment variables
docker exec vibes-defi-production env | grep NEXT_PUBLIC
```

#### API Errors
```bash
# Test RPC endpoint
curl "https://devnet.helius-rpc.com/?api-key=10bdc822-0b46-4952-98fc-095c326565d7" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

### Performance Issues

```bash
# Check resource limits
docker exec vibes-defi-production cat /proc/meminfo
docker exec vibes-defi-production cat /proc/cpuinfo

# Monitor in real-time
docker stats vibes-defi-production
```

## 🔄 Updates and Rollbacks

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and redeploy
./scripts/deploy-production.sh
```

### Rollback

```bash
# Stop current version
docker-compose -f docker-compose.server.yml down

# Use previous image (if available)
docker images vibes-defi-production
docker tag vibes-defi-production:previous vibes-defi-production:latest

# Redeploy
docker-compose -f docker-compose.server.yml up -d
```

## 📈 Production Optimization

### Build Optimization

The Dockerfile includes several optimizations:
- Multi-stage builds
- Layer caching
- Minimal base image
- Production dependencies only

### Runtime Optimization

- Standalone Next.js output
- Environment variable optimization
- Health check configuration
- Resource-efficient Alpine Linux

## 🎯 Next Steps

After successful deployment:

1. **Configure reverse proxy** (Nginx/Apache)
2. **Set up SSL certificates** (Let's Encrypt)
3. **Configure domain name**
4. **Set up monitoring** (Prometheus/Grafana)
5. **Configure backups**

## 📞 Support

If you encounter issues:
1. Check the logs: `docker logs vibes-defi-production`
2. Verify environment variables match `config/env/production.env`
3. Ensure all smart contracts are deployed and accessible
4. Test RPC endpoint connectivity
