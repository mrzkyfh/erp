#!/bin/bash

# Script untuk deploy backend ke Cloudflare Workers
# Usage: bash deploy-backend.sh

echo "🚀 Deploying Backend to Cloudflare Workers..."
echo ""

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo "❌ Error: Jalankan script ini dari root project"
    echo "   Current directory: $(pwd)"
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Verify routes setup
echo "🔍 Verifying routes setup..."
node verify-routes.js
echo ""

# Deploy to Cloudflare Workers
echo "📤 Deploying to Cloudflare Workers..."
npm run deploy

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "⏳ Waiting 10 seconds for propagation..."
    sleep 10
    echo ""
    echo "🧪 Next steps:"
    echo "   1. Test endpoint: curl https://your-backend-url/api/settings"
    echo "   2. Open frontend and navigate to 'Pengaturan' menu"
    echo "   3. Verify settings page loads without errors"
    echo ""
else
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "💡 Troubleshooting:"
    echo "   1. Check if you're logged in: npx wrangler whoami"
    echo "   2. Login if needed: npx wrangler login"
    echo "   3. Try again: npm run deploy"
    echo ""
    exit 1
fi
