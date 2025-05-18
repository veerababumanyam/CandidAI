#!/bin/bash

# Script to clean up duplicate files in the dist directory

echo "Cleaning up duplicate files..."

# Remove duplicate options.html file
if [ -f "dist/options/options.html" ]; then
  echo "Removing duplicate options.html file"
  rm dist/options/options.html
fi

# Remove any other duplicate files
echo "Checking for other duplicate files..."

# Build the project to ensure all files are properly generated
echo "Building the project..."
npm run build

echo "Cleanup complete!"
