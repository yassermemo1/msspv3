#!/usr/bin/env node

/**
 * Auto-version script for MSSP Client Manager
 * Automatically increments version based on commit messages and changes
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function getPackageVersion() {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  return packageData.version;
}

function setPackageVersion(newVersion) {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  packageData.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2) + '\n');
  return newVersion;
}

function incrementVersion(version, type = 'patch') {
  const [major, minor, patch] = version.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

function getCommitsSinceLastTag() {
  try {
    // Get the last tag
    const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo ""', { encoding: 'utf8' }).trim();
    
    let command;
    if (lastTag) {
      command = `git log ${lastTag}..HEAD --oneline`;
    } else {
      command = 'git log --oneline -10'; // Get last 10 commits if no tags
    }
    
    const commits = execSync(command, { encoding: 'utf8' }).trim();
    return commits ? commits.split('\n') : [];
  } catch (error) {
    log(`Warning: Could not get commit history: ${error.message}`, colors.yellow);
    return [];
  }
}

function analyzeCommits(commits) {
  let hasMajor = false;
  let hasMinor = false;
  let hasPatch = false;

  for (const commit of commits) {
    const message = commit.toLowerCase();
    
    // Major version indicators
    if (message.includes('breaking change') || 
        message.includes('major:') ||
        message.includes('!:') ||
        message.startsWith('feat!:') ||
        message.startsWith('fix!:')) {
      hasMajor = true;
    }
    
    // Minor version indicators
    else if (message.includes('feat:') || 
             message.includes('feature:') ||
             message.includes('minor:') ||
             message.includes('add ') ||
             message.includes('new ')) {
      hasMinor = true;
    }
    
    // Patch version indicators
    else if (message.includes('fix:') || 
             message.includes('bug:') ||
             message.includes('patch:') ||
             message.includes('hotfix:') ||
             message.includes('chore:') ||
             message.includes('refactor:') ||
             message.includes('docs:') ||
             message.includes('style:') ||
             message.includes('test:')) {
      hasPatch = true;
    }
  }

  if (hasMajor) return 'major';
  if (hasMinor) return 'minor';
  if (hasPatch) return 'patch';
  return 'patch'; // Default to patch for any changes
}

function hasUncommittedChanges() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    return status.length > 0;
  } catch (error) {
    return false;
  }
}

function main() {
  log(`${colors.bold}🚀 MSSP Client Manager - Auto Version Manager${colors.reset}`, colors.blue);
  log('═══════════════════════════════════════════════════', colors.blue);

  // Check if we're in a git repository
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
  } catch (error) {
    log('❌ Error: Not in a git repository', colors.red);
    process.exit(1);
  }

  // Check for uncommitted changes
  if (hasUncommittedChanges()) {
    log('⚠️  Warning: You have uncommitted changes. Please commit them first.', colors.yellow);
    process.exit(1);
  }

  const currentVersion = getPackageVersion();
  log(`📦 Current version: ${currentVersion}`, colors.blue);

  // Get commits since last version bump
  const commits = getCommitsSinceLastTag();
  
  if (commits.length === 0) {
    log('✅ No new commits found. Version remains unchanged.', colors.green);
    return;
  }

  log(`📝 Found ${commits.length} commits to analyze:`, colors.blue);
  commits.slice(0, 5).forEach(commit => {
    log(`   • ${commit}`, colors.reset);
  });
  if (commits.length > 5) {
    log(`   ... and ${commits.length - 5} more`, colors.reset);
  }

  // Analyze commits to determine version bump type
  const bumpType = analyzeCommits(commits);
  const newVersion = incrementVersion(currentVersion, bumpType);

  log(`🔄 Determined bump type: ${bumpType.toUpperCase()}`, colors.yellow);
  log(`🎯 New version will be: ${newVersion}`, colors.green);

  // Update package.json
  setPackageVersion(newVersion);
  log(`✅ Updated package.json to version ${newVersion}`, colors.green);

  // Commit the version change
  try {
    execSync('git add package.json', { stdio: 'ignore' });
    execSync(`git commit -m "chore: bump version to ${newVersion}"`, { stdio: 'ignore' });
    log(`✅ Committed version bump to ${newVersion}`, colors.green);

    // Create git tag
    execSync(`git tag v${newVersion}`, { stdio: 'ignore' });
    log(`🏷️  Created git tag v${newVersion}`, colors.green);

    // Push changes and tags
    execSync('git push', { stdio: 'ignore' });
    execSync('git push --tags', { stdio: 'ignore' });
    log(`🚀 Pushed changes and tags to remote`, colors.green);

  } catch (error) {
    log(`❌ Error during git operations: ${error.message}`, colors.red);
    process.exit(1);
  }

  log('═══════════════════════════════════════════════════', colors.green);
  log(`✨ Version successfully updated to ${newVersion} and pushed!`, colors.green);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { incrementVersion, analyzeCommits, getPackageVersion, setPackageVersion }; 