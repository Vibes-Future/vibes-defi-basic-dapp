@echo off
echo 🚀 VIBES DeFi App - Docker Deployment Script
echo ================================================

echo.
echo 📋 Checking Docker status...
docker --version
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed or not in PATH
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo.
echo 🔍 Checking if Docker Desktop is running...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Desktop is not running
    echo Please start Docker Desktop and wait for it to fully load
    echo Then run this script again
    pause
    exit /b 1
)

echo ✅ Docker is running!

echo.
echo 🏗️  Building the application...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo.
echo 🐳 Building Docker image...
docker build -t vibes-defi-app .
if %errorlevel% neq 0 (
    echo ❌ Docker build failed
    pause
    exit /b 1
)

echo.
echo 🚀 Starting the application with Docker Compose...
docker-compose up --build -d

echo.
echo ✅ Deployment completed!
echo.
echo 🌐 Your VIBES DeFi app is now running at:
echo    http://localhost:3000
echo.
echo 📊 To view logs: docker-compose logs -f
echo 🛑 To stop: docker-compose down
echo.
pause
