#!/bin/bash
set -e

echo "🚀 Deploying Master Splitter..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/home/ubuntu/masterSplitter"
BRANCH="main"

# Navigate to project directory
cd $PROJECT_DIR

# 1. Pull latest code
echo -e "${BLUE}📥 Pulling latest code from git...${NC}"
git pull origin $BRANCH

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git pull failed${NC}"
    exit 1
fi

# 2. Backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd backend
npm ci --only=production

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend npm install failed${NC}"
    exit 1
fi

# 3. Frontend build
echo -e "${BLUE}🏗️ Building frontend...${NC}"
cd ../frontend
npm ci
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

# 4. Restart PM2
echo -e "${BLUE}🔄 Restarting PM2 app...${NC}"
cd ..
pm2 restart master-splitter-backend

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ PM2 restart failed${NC}"
    exit 1
fi

# 5. Wait and verify
echo -e "${BLUE}⏳ Waiting for application to start...${NC}"
sleep 3

# 6. Health check
echo -e "${BLUE}✅ Checking health endpoint...${NC}"
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}⚠️ Health check failed - check logs with: pm2 logs master-splitter-backend${NC}"
fi

# 7. Show status
echo -e "${GREEN}✅ Deploy completed!${NC}"
echo ""
pm2 list
echo ""
echo -e "${BLUE}View logs: pm2 logs master-splitter-backend${NC}"
echo -e "${BLUE}Monitor: pm2 monit${NC}"

