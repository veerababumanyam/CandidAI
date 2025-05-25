@echo off
REM Build script for CandidAI Chrome Extension (Windows)

echo Building CandidAI Chrome Extension...

REM Clean previous build
echo Cleaning dist directory...
if exist dist rmdir /s /q dist

REM Install dependencies if needed
if not exist node_modules (
  echo Installing dependencies...
  call npm install
)

REM Run webpack build
echo Running webpack build...
call npm run build

REM Check if build was successful
if exist dist (
  echo.
  echo Build successful! Extension ready in dist\ directory
  echo To install:
  echo 1. Open Chrome and go to chrome://extensions
  echo 2. Enable Developer mode
  echo 3. Click 'Load unpacked' and select the dist\ folder
) else (
  echo Build failed! Check error messages above.
  exit /b 1
)
