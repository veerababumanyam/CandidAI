#!/usr/bin/env node

/**
 * Icon Generation Script for CandidAI Chrome Extension
 * Converts logo.png to required icon sizes using Sharp
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const ICON_SIZES = [16, 32, 48, 128];
const SOURCE_LOGO = 'logo.png';
const OUTPUT_DIR = 'src/assets/icons';

async function createIcons() {
  try {
    console.log('🎨 Creating icons from logo.png...');
    
    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    
    // Check if source logo exists
    try {
      await fs.access(SOURCE_LOGO);
    } catch (error) {
      throw new Error(`Source logo file '${SOURCE_LOGO}' not found`);
    }
    
    // Create icons for each required size
    for (const size of ICON_SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `icon-${size}.png`);
      
      console.log(`📐 Creating ${size}x${size} icon...`);
      
      await sharp(SOURCE_LOGO)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
        })
        .png({
          quality: 100,
          compressionLevel: 9
        })
        .toFile(outputPath);
      
      console.log(`✅ Created: ${outputPath}`);
    }
    
    // Also create a larger version for options page (96px)
    const optionsIconPath = path.join(OUTPUT_DIR, 'icon-96.png');
    console.log(`📐 Creating 96x96 icon for options page...`);
    
    await sharp(SOURCE_LOGO)
      .resize(96, 96, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({
        quality: 100,
        compressionLevel: 9
      })
      .toFile(optionsIconPath);
    
    console.log(`✅ Created: ${optionsIconPath}`);
    
    console.log('🚀 All icons created successfully!');
    
    // Remove old SVG files if they exist
    for (const size of ICON_SIZES) {
      const svgPath = path.join(OUTPUT_DIR, `icon-${size}.svg`);
      try {
        await fs.unlink(svgPath);
        console.log(`🗑️  Removed old SVG: ${svgPath}`);
      } catch (error) {
        // File doesn't exist, ignore
      }
    }
    
  } catch (error) {
    console.error('❌ Error creating icons:', error.message);
    process.exit(1);
  }
}

// Run the script
createIcons(); 