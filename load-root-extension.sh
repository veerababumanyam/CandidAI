#!/bin/bash

# Script to open Chrome with the CandidAI extension loaded from the root directory
# This script assumes Chrome is installed in the default location

# Set the path to the extension
EXTENSION_PATH="/Users/v13478/Desktop/CandidAI"

# Check if the extension path exists
if [ ! -d "$EXTENSION_PATH" ]; then
  echo "Error: Extension directory not found at $EXTENSION_PATH"
  exit 1
fi

# Check if manifest.json exists in the extension directory
if [ ! -f "$EXTENSION_PATH/manifest.json" ]; then
  echo "Error: manifest.json not found in $EXTENSION_PATH"
  exit 1
fi

# Open Chrome with the extension loaded
echo "Opening Chrome with CandidAI extension from root directory..."
open -a "Google Chrome" --args --load-extension="$EXTENSION_PATH" --no-first-run

echo "Chrome should now be open with the CandidAI extension loaded."
echo "If you don't see the extension, check chrome://extensions/ to ensure it's enabled."
