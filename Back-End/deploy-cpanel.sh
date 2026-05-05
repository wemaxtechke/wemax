#!/bin/bash

# 🚀 Wemax Backend cPanel Deployment Script
# Optimized for shared hosting with 50 process limit

set -e

echo "🚀 Starting Wemax Backend Deployment for cPanel..."
echo "=========================================="

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 not found. Installing PM2..."
    npm install -g pm2
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo "📦 Node.js Version: $NODE_VERSION"

# Check current directory
BACKEND_DIR=$(pwd)
echo "📁 Backend Directory: $BACKEND_DIR"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    if [ -f ".env.template" ]; then
        cp .env.template .env
        echo "✅ Created .env from template"
    else
        echo "❌ No .env.template found. Please create .env manually"
    fi
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --production
fi

# Check if optimized files exist
if [ ! -f "server-optimized.js" ]; then
    echo "❌ server-optimized.js not found!"
    exit 1
fi

if [ ! -f "lib/mysql.js" ]; then
    echo "❌ lib/mysql.js not found!"
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs

echo "🔧 Starting optimized server with PM2..."

# Start with PM2 using ecosystem config
pm2 start ecosystem.config.js --env production

# Wait a moment for startup
sleep 3

# Check if the process started successfully
if pm2 list | grep -q "wemax-api.*online"; then
    echo "✅ Wemax API started successfully!"
    echo ""
    echo "📊 Resource Status:"
    pm2 show wemax-api --monit
    
    echo ""
    echo "📋 Useful Commands:"
    echo "  View logs:     pm2 logs wemax-api --lines 50"
    echo "  Monitor:       pm2 monit"
    echo "  Restart:       pm2 restart wemax-api"
    echo "  Stop:          pm2 stop wemax-api"
    echo "  Delete:        pm2 delete wemax-api"
    echo ""
    echo "🌐 Application URL: Check your cPanel for the assigned port"
    
    # Show current resource usage
    echo ""
    echo "📈 Current Resource Usage:"
    pm2 show wemax-api --monit | grep -E "(memory|cpu)"
    
else
    echo "❌ Failed to start Wemax API!"
    echo "🔍 Checking logs..."
    pm2 logs wemax-api --lines 20
    
    echo ""
    echo "🛠️ Troubleshooting:"
    echo "1. Check .env file for correct database credentials"
    echo "2. Ensure MySQL database exists and is accessible"
    echo "3. Verify port is not in use"
    echo "4. Check cPanel resource limits"
    echo "5. Review logs with: pm2 logs wemax-api --err"
fi

echo ""
echo "=========================================="
echo "🎯 Deployment complete!"
echo ""
echo "📖 For detailed optimization guide, see: CPANEL-OPTIMIZATION-GUIDE.md"
echo "📊 For resource monitoring, run: node monitor-resources.js"
