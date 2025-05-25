#!/usr/bin/env node

/**
 * Extension Verification Script
 * Checks if the CandidAI extension is ready to load in Chrome
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = [
  'dist/manifest.json',
  'dist/service-worker.js',
  'dist/sidepanel/sidepanel.html',
  'dist/sidepanel.js',
  'dist/options/options.html',
  'dist/options.js',
  'dist/content.js',
  'dist/offscreen.js',
  'dist/icon-16.png',
  'dist/icon-32.png',
  'dist/icon-48.png',
  'dist/icon-128.png'
];

const REQUIRED_ICONS = [
  'dist/icon-16.png',
  'dist/icon-32.png', 
  'dist/icon-48.png',
  'dist/icon-128.png'
];

console.log('🔍 Verifying CandidAI Extension...\n');

let allGood = true;

// Check if dist folder exists
if (!fs.existsSync('dist')) {
  console.log('❌ ERROR: dist folder not found!');
  console.log('   Run: npm run build:simple');
  allGood = false;
} else {
  console.log('✅ dist folder exists');
}

// Check required files
console.log('\n📁 Checking required files...');
for (const file of REQUIRED_FILES) {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    console.log(`✅ ${file} (${(stats.size / 1024).toFixed(1)}KB)`);
  } else {
    console.log(`❌ ${file} - MISSING!`);
    allGood = false;
  }
}

// Check manifest.json content
if (fs.existsSync('dist/manifest.json')) {
  console.log('\n📋 Checking manifest.json...');
  try {
    const manifest = JSON.parse(fs.readFileSync('dist/manifest.json', 'utf8'));
    
    if (manifest.manifest_version === 3) {
      console.log('✅ Manifest version 3 (Chrome compatible)');
    } else {
      console.log('❌ Invalid manifest version');
      allGood = false;
    }
    
    if (manifest.icons && Object.keys(manifest.icons).length > 0) {
      console.log('✅ Icons configured in manifest');
      
      // Verify icon files exist
      for (const [size, iconPath] of Object.entries(manifest.icons)) {
        const fullPath = path.join('dist', iconPath);
        if (fs.existsSync(fullPath)) {
          console.log(`   ✅ ${size}px icon: ${iconPath}`);
        } else {
          console.log(`   ❌ ${size}px icon missing: ${iconPath}`);
          allGood = false;
        }
      }
    } else {
      console.log('❌ No icons configured in manifest');
      allGood = false;
    }
    
  } catch (error) {
    console.log('❌ Invalid manifest.json format:', error.message);
    allGood = false;
  }
}

// Final result
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 SUCCESS! Extension is ready to load in Chrome');
  console.log('\n📖 Instructions:');
  console.log('1. Open Chrome and go to chrome://extensions');
  console.log('2. Enable "Developer mode"');
  console.log('3. Click "Load unpacked"');
  console.log('4. Select the "dist" folder from this project');
  console.log('\n✨ Your CandidAI extension will be ready to use!');
} else {
  console.log('❌ ISSUES FOUND! Extension is not ready.');
  console.log('\n🔧 Try running:');
  console.log('   npm install');
  console.log('   npm run build:simple');
  console.log('\n   Then run this script again: node scripts/verify-extension.js');
}

console.log('\n' + '='.repeat(50));
process.exit(allGood ? 0 : 1); 