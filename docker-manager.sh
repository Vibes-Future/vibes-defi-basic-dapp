#!/bin/bash

# VIBES DeFi Docker Container Manager
# This script provides easy management of the Docker container for the VIBES DeFi application

set -e

COMPOSE_FILE="config/docker/docker-compose.yml"
APP_URL="http://localhost:3000"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  VIBES DeFi Container Manager${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to build the container
build() {
    print_header
    print_status "Building VIBES DeFi container..."
    check_docker
    
    if docker compose -f $COMPOSE_FILE build; then
        print_status "Container built successfully!"
    else
        print_error "Failed to build container"
        exit 1
    fi
}

# Function to start the container
start() {
    print_header
    print_status "Starting VIBES DeFi container..."
    check_docker
    
    if docker compose -f $COMPOSE_FILE up -d; then
        print_status "Container started successfully!"
        print_status "Application is available at: $APP_URL"
        sleep 5
        print_status "Checking application health..."
        if curl -f $APP_URL > /dev/null 2>&1; then
            print_status "✅ Application is healthy and responding!"
        else
            print_warning "⚠️  Application may still be starting up. Please wait a moment and check $APP_URL"
        fi
    else
        print_error "Failed to start container"
        exit 1
    fi
}

# Function to stop the container
stop() {
    print_header
    print_status "Stopping VIBES DeFi container..."
    check_docker
    
    if docker compose -f $COMPOSE_FILE down; then
        print_status "Container stopped successfully!"
    else
        print_error "Failed to stop container"
        exit 1
    fi
}

# Function to show container status
status() {
    print_header
    print_status "Container Status:"
    check_docker
    docker compose -f $COMPOSE_FILE ps
}

# Function to show logs
logs() {
    print_header
    print_status "Showing container logs (Press Ctrl+C to exit)..."
    check_docker
    docker compose -f $COMPOSE_FILE logs -f
}

# Function to restart the container
restart() {
    print_header
    print_status "Restarting VIBES DeFi container..."
    stop
    start
}

# Function to rebuild and restart
rebuild() {
    print_header
    print_status "Rebuilding and restarting VIBES DeFi container..."
    stop
    build
    start
}

# Function to show help
show_help() {
    print_header
    echo "Usage: $0 {build|start|stop|restart|rebuild|status|logs|help}"
    echo ""
    echo "Commands:"
    echo "  build     - Build the Docker container"
    echo "  start     - Start the container in detached mode"
    echo "  stop      - Stop and remove the container"
    echo "  restart   - Stop and start the container"
    echo "  rebuild   - Stop, rebuild, and start the container"
    echo "  status    - Show container status"
    echo "  logs      - Show container logs (follow mode)"
    echo "  help      - Show this help message"
    echo ""
    echo "Environment Setup:"
    echo "  Make sure to copy config/env/env.example to .env and configure your settings"
    echo "  before running the container."
}

# Main script logic
case "$1" in
    build)
        build
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    rebuild)
        rebuild
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Invalid command: $1"
        show_help
        exit 1
        ;;
esac
