#!/bin/bash
# Create placeholder icons for CandidAI Chrome Extension

echo "Creating placeholder icons..."

# Create icon directories if they don't exist
mkdir -p src/assets/icons

# Create placeholder icon files (you should replace these with actual logo files)
for size in 16 32 48 128; do
  echo "Creating ${size}x${size} icon..."
  # Create a simple SVG placeholder
  cat > "src/assets/icons/icon-${size}.png" << EOF
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#e8a396" rx="8"/>
  <text x="50%" y="50%" font-family="Arial" font-size="${size}px" fill="white" text-anchor="middle" dy=".3em">C</text>
</svg>
EOF
done

# Create provider icons placeholders
echo "Creating provider icon placeholders..."
for provider in openai anthropic google; do
  cat > "src/assets/icons/${provider}.svg" << EOF
<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
  <rect width="20" height="20" fill="#e8a396" rx="4"/>
</svg>
EOF
done

echo "Placeholder icons created successfully!"
echo "Note: Replace these with actual logo/icon files before production use."
