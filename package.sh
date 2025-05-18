#!/bin/bash

# CandidAI Packaging Script for Chrome Web Store Submission
# This script builds and packages the extension for submission to the Chrome Web Store

# Set variables
VERSION=$(grep '"version"' src/manifest.json | cut -d'"' -f4)
PACKAGE_NAME="candidai-v$VERSION"
BUILD_DIR="dist"
PACKAGE_DIR="packages"

# Print header
echo "====================================="
echo "CandidAI Packaging Script"
echo "Version: $VERSION"
echo "====================================="

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install Node.js and npm."
    exit 1
fi

# Create packages directory if it doesn't exist
if [ ! -d "$PACKAGE_DIR" ]; then
    echo "Creating packages directory..."
    mkdir -p "$PACKAGE_DIR"
fi

# Clean previous build
echo "Cleaning previous build..."
rm -rf "$BUILD_DIR"

# Run production build
echo "Building production version..."
npm run build

# Check if build was successful
if [ ! -d "$BUILD_DIR" ]; then
    echo "Error: Build failed. Check for errors in the build process."
    exit 1
fi

# Create zip package
echo "Creating zip package..."
cd "$BUILD_DIR"
zip -r "../$PACKAGE_DIR/$PACKAGE_NAME.zip" *
cd ..

# Check if packaging was successful
if [ ! -f "$PACKAGE_DIR/$PACKAGE_NAME.zip" ]; then
    echo "Error: Packaging failed."
    exit 1
fi

# Calculate package size
PACKAGE_SIZE=$(du -h "$PACKAGE_DIR/$PACKAGE_NAME.zip" | cut -f1)

# Print success message
echo "====================================="
echo "Packaging completed successfully!"
echo "Package: $PACKAGE_DIR/$PACKAGE_NAME.zip"
echo "Size: $PACKAGE_SIZE"
echo "====================================="

# Chrome Web Store submission checklist
echo "Chrome Web Store Submission Checklist:"
echo "✓ 1. Verify manifest.json is correct"
echo "✓ 2. Ensure all required permissions are justified"
echo "✓ 3. Check that promotional screenshots are in place"
echo "✓ 4. Verify privacy policy is accessible"
echo "✓ 5. Test the packaged extension by loading it unpacked"
echo "✓ 6. Submit to Chrome Web Store at https://chrome.google.com/webstore/devconsole"
echo "====================================="

exit 0
