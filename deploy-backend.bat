@echo off
REM Script untuk deploy backend ke Cloudflare Workers (Windows)
REM Usage: deploy-backend.bat

echo.
echo 🚀 Deploying Backend to Cloudflare Workers...
echo.

REM Check if we're in the right directory
if not exist "backend\package.json" (
    echo ❌ Error: Jalankan script ini dari root project
    echo    Current directory: %CD%
    exit /b 1
)

REM Navigate to backend directory
cd backend

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

REM Verify routes setup
echo 🔍 Verifying routes setup...
node verify-routes.js
echo.

REM Deploy to Cloudflare Workers
echo 📤 Deploying to Cloudflare Workers...
call npm run deploy

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Deployment successful!
    echo.
    echo ⏳ Waiting 10 seconds for propagation...
    timeout /t 10 /nobreak >nul
    echo.
    echo 🧪 Next steps:
    echo    1. Test endpoint: curl https://your-backend-url/api/settings
    echo    2. Open frontend and navigate to 'Pengaturan' menu
    echo    3. Verify settings page loads without errors
    echo.
) else (
    echo.
    echo ❌ Deployment failed!
    echo.
    echo 💡 Troubleshooting:
    echo    1. Check if you're logged in: npx wrangler whoami
    echo    2. Login if needed: npx wrangler login
    echo    3. Try again: npm run deploy
    echo.
    exit /b 1
)

cd ..
