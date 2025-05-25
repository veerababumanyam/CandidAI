#!/usr/bin/env node

/**
 * TypeScript Migration Status Checker
 * Analyzes the codebase and provides migration recommendations
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function scanDirectory(dir, extensions = ['.js', '.ts']) {
  const files = [];
  
  function scan(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
        files.push({
          path: fullPath,
          relativePath: path.relative(srcDir, fullPath),
          name: entry.name,
          extension: path.extname(entry.name),
          size: fs.statSync(fullPath).size
        });
      }
    }
  }
  
  scan(dir);
  return files;
}

function analyzeMigrationStatus() {
  console.log('🔍 Analyzing TypeScript Migration Status...\n');
  
  const files = scanDirectory(srcDir);
  const jsFiles = files.filter(f => f.extension === '.js');
  const tsFiles = files.filter(f => f.extension === '.ts');
  
  console.log('📊 File Statistics:');
  console.log(`  JavaScript files: ${jsFiles.length}`);
  console.log(`  TypeScript files: ${tsFiles.length}`);
  console.log(`  Migration progress: ${Math.round((tsFiles.length / (jsFiles.length + tsFiles.length)) * 100)}%\n`);
  
  console.log('📁 Directory Breakdown:');
  const byDirectory = {};
  
  files.forEach(file => {
    const dir = path.dirname(file.relativePath);
    if (!byDirectory[dir]) {
      byDirectory[dir] = { js: 0, ts: 0 };
    }
    byDirectory[dir][file.extension.slice(1)]++;
  });
  
  Object.entries(byDirectory).forEach(([dir, counts]) => {
    const total = counts.js + counts.ts;
    const tsPercentage = Math.round((counts.ts / total) * 100);
    console.log(`  ${dir}: ${counts.ts}/${total} TS (${tsPercentage}%)`);
  });
  
  console.log('\n🎯 Recommendations:');
  
  // Priority files to migrate
  const priorityDirs = ['background', 'services', 'api', 'utils'];
  const priorityFiles = jsFiles.filter(file => 
    priorityDirs.some(dir => file.relativePath.includes(dir))
  );
  
  if (priorityFiles.length > 0) {
    console.log('  High Priority for Migration:');
    priorityFiles.forEach(file => {
      console.log(`    - ${file.relativePath} (${Math.round(file.size / 1024)}KB)`);
    });
  }
  
  // Large files that might benefit from TypeScript
  const largeJSFiles = jsFiles.filter(file => file.size > 10000); // > 10KB
  if (largeJSFiles.length > 0) {
    console.log('\n  Large JavaScript files that would benefit from TypeScript:');
    largeJSFiles.forEach(file => {
      console.log(`    - ${file.relativePath} (${Math.round(file.size / 1024)}KB)`);
    });
  }
  
  console.log('\n✅ Successfully Migrated:');
  tsFiles.forEach(file => {
    console.log(`  - ${file.relativePath}`);
  });
  
  console.log('\n🚀 Next Steps:');
  console.log('  1. Fix current TypeScript compilation errors');
  console.log('  2. Update build configuration for hybrid JS/TS');
  console.log('  3. Gradually migrate priority files');
  console.log('  4. Keep existing JavaScript files working');
  
  return {
    total: files.length,
    migrated: tsFiles.length,
    remaining: jsFiles.length,
    progress: tsFiles.length / (jsFiles.length + tsFiles.length)
  };
}

function generateMigrationPlan() {
  console.log('\n📋 Suggested Migration Plan:');
  console.log('  Phase 1: Core Infrastructure (DONE)');
  console.log('    ✅ Types and interfaces');
  console.log('    ✅ Constants and utilities');
  console.log('    ✅ Core services');
  
  console.log('\n  Phase 2: API Layer (IN PROGRESS)');
  console.log('    ⚠️  Fix API provider implementations');
  console.log('    ⚠️  Resolve interface conflicts');
  
  console.log('\n  Phase 3: UI Components (FUTURE)');
  console.log('    ⏳ Sidepanel components');
  console.log('    ⏳ Options page');
  console.log('    ⏳ Content scripts');
  
  console.log('\n  Phase 4: Gradual Enhancement (ONGOING)');
  console.log('    ⏳ Migrate files as needed');
  console.log('    ⏳ Keep JS/TS hybrid working');
}

if (require.main === module) {
  try {
    const status = analyzeMigrationStatus();
    generateMigrationPlan();
    
    console.log(`\n🏁 Migration Status: ${Math.round(status.progress * 100)}% Complete`);
    
  } catch (error) {
    console.error('❌ Error analyzing migration status:', error.message);
    process.exit(1);
  }
} 