#!/bin/bash
# Complete Production Deployment Script for VIBES DeFi
# This script handles the full deployment process

set -e  # Exit on any error

echo "🚀 VIBES DeFi Production Deployment"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="vibes-defi-production"
IMAGE_NAME="vibes-defi-production:latest"
EXTERNAL_PORT="3002"
INTERNAL_PORT="3000"

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        exit 1
    fi
    
    # Check Docker Compose (v2 or v1)
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed${NC}"
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Stop existing containers
stop_existing() {
    echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
    
    if docker ps -q --filter "name=${CONTAINER_NAME}" | grep -q .; then
        echo -e "${BLUE}📦 Stopping container: ${CONTAINER_NAME}${NC}"
        docker stop $CONTAINER_NAME
        docker rm $CONTAINER_NAME
    else
        echo -e "${BLUE}📦 No existing container found${NC}"
    fi
}

# Build production image
build_image() {
    echo -e "${PURPLE}🔨 Building production image...${NC}"
    
    # Run the build script
    if [ -f "scripts/build-production.sh" ]; then
        bash scripts/build-production.sh
    else
        echo -e "${RED}❌ Build script not found${NC}"
        exit 1
    fi
}

# Deploy with docker-compose
deploy() {
    echo -e "${BLUE}🚀 Deploying with Docker Compose...${NC}"
    
    # Use docker compose to deploy (v2 syntax)
    if command -v docker-compose &> /dev/null; then
        docker-compose -f docker-compose.server.yml up -d
    else
        docker compose -f docker-compose.server.yml up -d
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Deployment successful!${NC}"
    else
        echo -e "${RED}❌ Deployment failed${NC}"
        exit 1
    fi
}

# Health check
health_check() {
    echo -e "${BLUE}🏥 Performing health check...${NC}"
    
    echo -e "${YELLOW}⏳ Waiting for application to start...${NC}"
    sleep 10
    
    # Check if container is running
    if docker ps --filter "name=${CONTAINER_NAME}" --filter "status=running" | grep -q .; then
        echo -e "${GREEN}✅ Container is running${NC}"
        
        # Check if application responds
        for i in {1..6}; do
            if curl -f http://localhost:${EXTERNAL_PORT} > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Application is responding${NC}"
                return 0
            else
                echo -e "${YELLOW}⏳ Attempt $i/6: Waiting for application...${NC}"
                sleep 10
            fi
        done
        
        echo -e "${RED}❌ Application not responding after 60 seconds${NC}"
        return 1
    else
        echo -e "${RED}❌ Container is not running${NC}"
        return 1
    fi
}

# Display deployment info
show_info() {
    echo ""
    echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
    echo "=========================="
    echo -e "${BLUE}📊 Container Status:${NC}"
    docker ps --filter "name=${CONTAINER_NAME}"
    echo ""
    echo -e "${BLUE}🌐 Application URLs:${NC}"
    echo "  Local: http://localhost:${EXTERNAL_PORT}"
    echo "  Health: http://localhost:${EXTERNAL_PORT}/api/sol-price"
    echo ""
    echo -e "${BLUE}🔧 Management Commands:${NC}"
    echo "  View logs: docker logs -f ${CONTAINER_NAME}"
    echo "  Stop app: docker compose -f docker-compose.server.yml down"
    echo "  Restart: docker compose -f docker-compose.server.yml restart"
    echo ""
    echo -e "${YELLOW}📋 Environment:${NC}"
    echo "  Network: Devnet"
    echo "  RPC: Helius"
    echo "  Mode: Production"
}

# Show logs in case of failure
show_failure_logs() {
    echo -e "${RED}❌ Deployment failed. Here are the container logs:${NC}"
    echo "=================================================="
    docker logs $CONTAINER_NAME --tail 50
}

# Main deployment process
main() {
    echo -e "${PURPLE}Starting deployment process...${NC}"
    
    check_prerequisites
    stop_existing
    build_image
    deploy
    
    if health_check; then
        show_info
    else
        show_failure_logs
        exit 1
    fi
}

# Handle script interruption
trap 'echo -e "${RED}❌ Deployment interrupted${NC}"; exit 1' INT

# Run main function
main

echo -e "${GREEN}✨ Deployment script completed successfully!${NC}"
