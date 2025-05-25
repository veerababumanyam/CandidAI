#!/bin/bash
# Build script for CandidAI Chrome Extension

echo "Building CandidAI Chrome Extension..."

# Clean previous build
echo "Cleaning dist directory..."
rm -rf dist

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run webpack build
echo "Running webpack build..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
  echo "Build successful! Extension ready in dist/ directory"
  echo "To install:"
  echo "1. Open Chrome and go to chrome://extensions"
  echo "2. Enable Developer mode"
  echo "3. Click 'Load unpacked' and select the dist/ folder"
else
  echo "Build failed! Check error messages above."
  exit 1
fi
