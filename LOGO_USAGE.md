# CandidAI Logo Usage Guide

## Overview
This document describes how the CandidAI logo is integrated into the Chrome extension and how to update it when needed.

## Logo Files

### Source Logo
- **File**: `logo.png` (root directory)
- **Format**: PNG with transparent background
- **Usage**: Source file for generating all extension icons

### Generated Icons
The following icon sizes are automatically generated from the source logo:

| Size | File | Usage |
|------|------|-------|
| 16x16 | `src/assets/icons/icon-16.png` | Browser toolbar (small) |
| 32x32 | `src/assets/icons/icon-32.png` | Sidepanel header, browser toolbar |
| 48x48 | `src/assets/icons/icon-48.png` | Extension management page |
| 96x96 | `src/assets/icons/icon-96.png` | Options page header |
| 128x128 | `src/assets/icons/icon-128.png` | Chrome Web Store, extension details |

## Icon Generation Process

### Automatic Generation
Icons are automatically generated during the build process:

```bash
npm run build  # Generates icons and builds extension
```

### Manual Generation
To regenerate icons only:

```bash
npm run icons  # Generates icons from logo.png
```

### Custom Generation Script
The icon generation is handled by `create-icons.js` which:
- Uses Sharp library for high-quality image resizing
- Maintains transparent backgrounds
- Optimizes PNG compression
- Removes old SVG files automatically

## Updating the Logo

### Steps to Update
1. Replace `logo.png` in the root directory with your new logo
2. Ensure the new logo has a transparent background
3. Run the icon generation:
   ```bash
   npm run icons
   ```
4. Build the extension:
   ```bash
   npm run build
   ```

### Logo Requirements
- **Format**: PNG with transparent background
- **Recommended Size**: At least 512x512 pixels for best quality
- **Aspect Ratio**: Square (1:1) for optimal results
- **Background**: Transparent to ensure proper display

## File References

### Manifest Configuration
The `manifest.json` file references the generated PNG icons:
```json
{
  "icons": {
    "16": "assets/icons/icon-16.png",
    "32": "assets/icons/icon-32.png", 
    "48": "assets/icons/icon-48.png",
    "128": "assets/icons/icon-128.png"
  },
  "action": {
    "default_icon": {
      "16": "assets/icons/icon-16.png",
      "32": "assets/icons/icon-32.png",
      "48": "assets/icons/icon-48.png", 
      "128": "assets/icons/icon-128.png"
    }
  }
}
```

### HTML References
- **Options Page**: Uses `icon-96.png` in the header
- **Sidepanel**: Uses `icon-32.png` in the header

## Build Integration

### Package.json Scripts
```json
{
  "scripts": {
    "icons": "node create-icons.js",
    "build": "npm run icons && webpack --mode production"
  }
}
```

### Webpack Configuration
The webpack config is set up to copy PNG files to the correct output directory:
```javascript
{
  test: /\.(png|jpg|gif)$/,
  type: 'asset/resource',
  generator: {
    filename: 'assets/icons/[name][ext]'
  }
}
```

## Troubleshooting

### Common Issues
1. **Icons not updating**: Clear browser cache and reload extension
2. **Build errors**: Ensure Sharp dependency is installed (`npm install`)
3. **Quality issues**: Use a higher resolution source logo (512x512+)

### Dependencies
- **Sharp**: Image processing library for resizing
- **Node.js**: Required for running the generation script

## Best Practices
- Always use the automated generation process
- Keep the source logo at high resolution
- Test icon visibility at all sizes
- Ensure transparent backgrounds for proper integration
- Commit both source logo and generated icons to version control 