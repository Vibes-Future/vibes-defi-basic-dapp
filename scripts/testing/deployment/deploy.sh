#!/bin/bash

echo "🚀 VIBES DeFi App - Docker Deployment Script"
echo "================================================"

echo ""
echo "📋 Checking Docker status..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

echo ""
echo "🔍 Checking if Docker is running..."
if ! docker ps &> /dev/null; then
    echo "❌ Docker is not running"
    echo "Please start Docker and run this script again"
    exit 1
fi

echo "✅ Docker is running!"

echo ""
echo "🏗️  Building the application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "🐳 Building Docker image..."
docker build -t vibes-defi-app .
if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi

echo ""
echo "🚀 Starting the application with Docker Compose..."
docker-compose up --build -d

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🌐 Your VIBES DeFi app is now running at:"
echo "   http://localhost:3000"
echo ""
echo "📊 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
echo ""
