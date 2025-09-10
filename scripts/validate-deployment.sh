#!/bin/bash
# Deployment Validation Script for VIBES DeFi
# This script validates that all components are correctly configured

set -e

echo "🔍 VIBES DeFi Deployment Validation"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

VALIDATION_PASSED=true

# Function to report test results
report_test() {
    local test_name="$1"
    local result="$2"
    local details="$3"
    
    if [ "$result" = "PASS" ]; then
        echo -e "${GREEN}✅ $test_name${NC}"
        [ -n "$details" ] && echo -e "   ${BLUE}$details${NC}"
    else
        echo -e "${RED}❌ $test_name${NC}"
        [ -n "$details" ] && echo -e "   ${RED}$details${NC}"
        VALIDATION_PASSED=false
    fi
}

# Test 1: Environment Variables
echo -e "${YELLOW}📋 Validating Environment Variables...${NC}"

ENV_FILE="config/env/production.env"
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
    
    # Check critical variables
    [ -n "$NEXT_PUBLIC_HELIUS_API_KEY" ] && report_test "Helius API Key" "PASS" "$NEXT_PUBLIC_HELIUS_API_KEY" || report_test "Helius API Key" "FAIL" "Missing"
    [ -n "$NEXT_PUBLIC_PRESALE_PROGRAM_ID" ] && report_test "Presale Program ID" "PASS" "$NEXT_PUBLIC_PRESALE_PROGRAM_ID" || report_test "Presale Program ID" "FAIL" "Missing"
    [ -n "$NEXT_PUBLIC_VIBES_MINT" ] && report_test "VIBES Mint Address" "PASS" "$NEXT_PUBLIC_VIBES_MINT" || report_test "VIBES Mint Address" "FAIL" "Missing"
    [ -n "$NEXT_PUBLIC_USDC_MINT" ] && report_test "USDC Mint Address" "PASS" "$NEXT_PUBLIC_USDC_MINT" || report_test "USDC Mint Address" "FAIL" "Missing"
else
    report_test "Production Environment File" "FAIL" "File not found: $ENV_FILE"
fi

# Test 2: Docker Configuration
echo -e "\n${YELLOW}🐳 Validating Docker Configuration...${NC}"

if [ -f "Dockerfile.server" ]; then
    report_test "Production Dockerfile" "PASS"
else
    report_test "Production Dockerfile" "FAIL" "File not found"
fi

if [ -f "docker-compose.server.yml" ]; then
    report_test "Docker Compose Config" "PASS"
else
    report_test "Docker Compose Config" "FAIL" "File not found"
fi

# Test 3: Build Scripts
echo -e "\n${YELLOW}🔨 Validating Build Scripts...${NC}"

if [ -f "scripts/build-production.sh" ] && [ -x "scripts/build-production.sh" ]; then
    report_test "Build Script" "PASS"
else
    report_test "Build Script" "FAIL" "File not found or not executable"
fi

if [ -f "scripts/deploy-production.sh" ] && [ -x "scripts/deploy-production.sh" ]; then
    report_test "Deploy Script" "PASS"
else
    report_test "Deploy Script" "FAIL" "File not found or not executable"
fi

# Test 4: Network Connectivity
echo -e "\n${YELLOW}🌐 Validating Network Connectivity...${NC}"

# Test Helius RPC
if [ -n "$NEXT_PUBLIC_HELIUS_RPC_ENDPOINT" ]; then
    if curl -s --max-time 10 "$NEXT_PUBLIC_HELIUS_RPC_ENDPOINT" \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' | grep -q "ok"; then
        report_test "Helius RPC Connectivity" "PASS" "$NEXT_PUBLIC_HELIUS_RPC_ENDPOINT"
    else
        report_test "Helius RPC Connectivity" "FAIL" "Cannot connect to $NEXT_PUBLIC_HELIUS_RPC_ENDPOINT"
    fi
else
    report_test "Helius RPC Connectivity" "FAIL" "RPC endpoint not configured"
fi

# Test 5: Dependencies
echo -e "\n${YELLOW}📦 Validating Dependencies...${NC}"

command -v docker >/dev/null 2>&1 && report_test "Docker Installation" "PASS" "$(docker --version)" || report_test "Docker Installation" "FAIL" "Docker not found"
if command -v docker-compose >/dev/null 2>&1; then
    report_test "Docker Compose Installation" "PASS" "$(docker-compose --version)"
elif docker compose version >/dev/null 2>&1; then
    report_test "Docker Compose Installation" "PASS" "$(docker compose version)"
else
    report_test "Docker Compose Installation" "FAIL" "Docker Compose not found"
fi
command -v node >/dev/null 2>&1 && report_test "Node.js Installation" "PASS" "$(node --version)" || report_test "Node.js Installation" "FAIL" "Node.js not found"
command -v npm >/dev/null 2>&1 && report_test "NPM Installation" "PASS" "$(npm --version)" || report_test "NPM Installation" "FAIL" "NPM not found"

# Test 6: Docker Service
echo -e "\n${YELLOW}🔧 Validating Docker Service...${NC}"

if docker info >/dev/null 2>&1; then
    report_test "Docker Service" "PASS" "Docker daemon is running"
else
    report_test "Docker Service" "FAIL" "Docker daemon is not running"
fi

# Test 7: Port Availability
echo -e "\n${YELLOW}🚪 Validating Port Availability...${NC}"

if lsof -i :3002 >/dev/null 2>&1; then
    report_test "Port 3002 Availability" "FAIL" "Port 3002 is already in use"
else
    report_test "Port 3002 Availability" "PASS" "Port 3002 is available"
fi

# Test 8: File Permissions
echo -e "\n${YELLOW}🔐 Validating File Permissions...${NC}"

if [ -r "package.json" ]; then
    report_test "Package.json Readable" "PASS"
else
    report_test "Package.json Readable" "FAIL"
fi

if [ -r "next.config.ts" ]; then
    report_test "Next Config Readable" "PASS"
else
    report_test "Next Config Readable" "FAIL"
fi

# Test 9: Configuration Consistency
echo -e "\n${YELLOW}⚙️ Validating Configuration Consistency...${NC}"

# Check if docker-compose and environment file have matching values
if [ -f "docker-compose.server.yml" ] && [ -f "$ENV_FILE" ]; then
    COMPOSE_PRESALE_ID=$(grep "NEXT_PUBLIC_PRESALE_PROGRAM_ID:" docker-compose.server.yml | cut -d: -f3 | xargs | tr -d ' ')
    ENV_PRESALE_ID=$(grep "NEXT_PUBLIC_PRESALE_PROGRAM_ID=" "$ENV_FILE" | cut -d= -f2 | tr -d ' ')
    
    if [ -n "$COMPOSE_PRESALE_ID" ] && [ -n "$ENV_PRESALE_ID" ] && [ "$COMPOSE_PRESALE_ID" = "$ENV_PRESALE_ID" ]; then
        report_test "Configuration Consistency" "PASS" "Program IDs match between files"
    else
        report_test "Configuration Consistency" "FAIL" "Program ID mismatch: Compose='$COMPOSE_PRESALE_ID', Env='$ENV_PRESALE_ID'"
    fi
else
    report_test "Configuration Consistency" "FAIL" "Required configuration files not found"
fi

# Final Report
echo ""
echo "=================================="
if [ "$VALIDATION_PASSED" = true ]; then
    echo -e "${GREEN}✅ ALL VALIDATIONS PASSED${NC}"
    echo -e "${GREEN}🚀 Ready for deployment!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "  1. Run: ./scripts/deploy-production.sh"
    echo "  2. Access: http://localhost:3002"
    echo "  3. Monitor: docker logs -f vibes-defi-production"
    exit 0
else
    echo -e "${RED}❌ VALIDATION FAILED${NC}"
    echo -e "${RED}⚠️  Please fix the issues above before deploying${NC}"
    exit 1
fi
