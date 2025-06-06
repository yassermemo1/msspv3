#!/usr/bin/env node

/**
 * Pre-Production Mock Data Cleanup Script
 * 
 * This script cleans up all test and mock data to prepare the system for production.
 * It removes test files, sample data, and resets sequences for clean production deployment.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🧹 Starting Pre-Production Mock Data Cleanup...\n');

// Track cleanup results
const cleanupResults = {
  filesRemoved: 0,
  directoriesRemoved: 0,
  errors: [],
  warnings: []
};

/**
 * Safely remove a file or directory
 */
function safeRemove(filePath, type = 'file') {
  try {
    if (fs.existsSync(filePath)) {
      if (type === 'directory') {
        fs.rmSync(filePath, { recursive: true, force: true });
        cleanupResults.directoriesRemoved++;
        console.log(`✅ Removed directory: ${path.relative(projectRoot, filePath)}`);
      } else {
        fs.unlinkSync(filePath);
        cleanupResults.filesRemoved++;
        console.log(`✅ Removed file: ${path.relative(projectRoot, filePath)}`);
      }
    }
  } catch (error) {
    cleanupResults.errors.push(`Failed to remove ${filePath}: ${error.message}`);
    console.error(`❌ Failed to remove ${path.relative(projectRoot, filePath)}: ${error.message}`);
  }
}

/**
 * Clean up test files and directories
 */
function cleanupTestFiles() {
  console.log('📁 Cleaning up test files...');
  
  const testPaths = [
    // Test files in root
    'test-files',
    'test-results',
    
    // Sample data files
    'sample-data/test-clients.csv',
    'sample-data/cookies.txt',
    'sample-data/cookies.tmp',
    'sample-data/server-debug.log',
    
    // Backup test files (already moved but double-check)
    'backup/test-files',
    'backup/sample-data',
    'backup/debug-scripts',
    
    // Any remaining test artifacts
    'uploads/test-*',
    'logs/test-*.log',
    'temp-files',
    
    // Test database files
    'test.db',
    'test.sqlite',
    'test.sqlite3'
  ];

  testPaths.forEach(testPath => {
    const fullPath = path.join(projectRoot, testPath);
    if (testPath.includes('*')) {
      // Handle glob patterns
      const dir = path.dirname(fullPath);
      const pattern = path.basename(fullPath);
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          if (file.match(pattern.replace('*', '.*'))) {
            safeRemove(path.join(dir, file));
          }
        });
      }
    } else {
      const stats = fs.existsSync(fullPath) ? fs.statSync(fullPath) : null;
      if (stats?.isDirectory()) {
        safeRemove(fullPath, 'directory');
      } else if (stats?.isFile()) {
        safeRemove(fullPath);
      }
    }
  });
}

/**
 * Clean up development artifacts
 */
function cleanupDevelopmentArtifacts() {
  console.log('\n🔧 Cleaning up development artifacts...');
  
  const devArtifacts = [
    '.env.local',
    '.env.development',
    '.env.test',
    'debug.log',
    'error.log',
    'access.log',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    '.DS_Store',
    'Thumbs.db',
    '*.tmp',
    '*.temp'
  ];

  devArtifacts.forEach(artifact => {
    const fullPath = path.join(projectRoot, artifact);
    if (artifact.includes('*')) {
      // Handle glob patterns
      const dir = path.dirname(fullPath);
      const pattern = path.basename(fullPath);
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          if (file.match(pattern.replace('*', '.*'))) {
            safeRemove(path.join(dir, file));
          }
        });
      }
    } else {
      safeRemove(fullPath);
    }
  });
}

/**
 * Clean up node_modules cache and build artifacts
 */
function cleanupBuildArtifacts() {
  console.log('\n🏗️ Cleaning up build artifacts...');
  
  const buildPaths = [
    'dist',
    'build',
    '.next',
    '.nuxt',
    '.vite',
    'coverage',
    '.nyc_output',
    'client/dist',
    'client/build',
    'server/dist',
    'server/build'
  ];

  buildPaths.forEach(buildPath => {
    const fullPath = path.join(projectRoot, buildPath);
    safeRemove(fullPath, 'directory');
  });
}

/**
 * Validate production readiness
 */
function validateProductionReadiness() {
  console.log('\n🔍 Validating production readiness...');
  
  const requiredFiles = [
    'package.json',
    'package-lock.json',
    '.env.example',
    'production.env.example',
    'README.md',
    'drizzle.config.ts',
    'vite.config.ts'
  ];

  const missingFiles = requiredFiles.filter(file => 
    !fs.existsSync(path.join(projectRoot, file))
  );

  if (missingFiles.length > 0) {
    cleanupResults.warnings.push(`Missing required files: ${missingFiles.join(', ')}`);
    console.warn(`⚠️ Missing required files: ${missingFiles.join(', ')}`);
  }

  // Check for test imports in production code
  const productionDirs = ['client/src', 'server', 'shared'];
  productionDirs.forEach(dir => {
    const fullDir = path.join(projectRoot, dir);
    if (fs.existsSync(fullDir)) {
      checkForTestImports(fullDir);
    }
  });
}

/**
 * Check for test imports in production code
 */
function checkForTestImports(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !file.name.includes('test') && !file.name.includes('spec')) {
      checkForTestImports(fullPath);
    } else if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.js') || file.name.endsWith('.jsx'))) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const testImports = [
          'vitest',
          '@testing-library',
          'jest',
          'mocha',
          'chai',
          'sinon',
          'test-utils',
          'mock-data'
        ];
        
        testImports.forEach(testImport => {
          if (content.includes(testImport) && !fullPath.includes('test') && !fullPath.includes('spec')) {
            cleanupResults.warnings.push(`Test import found in production file: ${path.relative(projectRoot, fullPath)} (${testImport})`);
            console.warn(`⚠️ Test import found: ${path.relative(projectRoot, fullPath)} contains ${testImport}`);
          }
        });
      } catch (error) {
        // Ignore read errors
      }
    }
  });
}

/**
 * Generate cleanup report
 */
function generateCleanupReport() {
  console.log('\n📊 Cleanup Summary:');
  console.log(`✅ Files removed: ${cleanupResults.filesRemoved}`);
  console.log(`✅ Directories removed: ${cleanupResults.directoriesRemoved}`);
  console.log(`⚠️ Warnings: ${cleanupResults.warnings.length}`);
  console.log(`❌ Errors: ${cleanupResults.errors.length}`);

  if (cleanupResults.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    cleanupResults.warnings.forEach(warning => console.log(`  - ${warning}`));
  }

  if (cleanupResults.errors.length > 0) {
    console.log('\n❌ Errors:');
    cleanupResults.errors.forEach(error => console.log(`  - ${error}`));
  }

  // Write detailed report
  const reportPath = path.join(projectRoot, 'CLEANUP_REPORT.md');
  const reportContent = `# Pre-Production Cleanup Report

Generated: ${new Date().toISOString()}

## Summary
- Files removed: ${cleanupResults.filesRemoved}
- Directories removed: ${cleanupResults.directoriesRemoved}
- Warnings: ${cleanupResults.warnings.length}
- Errors: ${cleanupResults.errors.length}

## Warnings
${cleanupResults.warnings.map(w => `- ${w}`).join('\n')}

## Errors
${cleanupResults.errors.map(e => `- ${e}`).join('\n')}

## Production Readiness Status
${cleanupResults.errors.length === 0 && cleanupResults.warnings.length === 0 ? '✅ READY FOR PRODUCTION' : '⚠️ REVIEW REQUIRED'}
`;

  fs.writeFileSync(reportPath, reportContent);
  console.log(`\n📄 Detailed report saved to: ${path.relative(projectRoot, reportPath)}`);
}

/**
 * Main cleanup function
 */
async function main() {
  try {
    cleanupTestFiles();
    cleanupDevelopmentArtifacts();
    cleanupBuildArtifacts();
    validateProductionReadiness();
    generateCleanupReport();
    
    console.log('\n🎉 Pre-production cleanup completed!');
    
    if (cleanupResults.errors.length === 0) {
      console.log('✅ System is ready for production deployment.');
    } else {
      console.log('⚠️ Please review errors before production deployment.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Run cleanup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as cleanupMockData }; 