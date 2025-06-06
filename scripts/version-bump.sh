#!/bin/bash

# MSSP Client Manager - Quick Version Bump Script
# Usage: ./scripts/version-bump.sh [patch|minor|major]

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default to patch if no argument provided
BUMP_TYPE=${1:-patch}

# Validate bump type
if [[ ! "$BUMP_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo -e "${RED}❌ Error: Invalid bump type '$BUMP_TYPE'. Use: patch, minor, or major${NC}"
    exit 1
fi

echo -e "${BLUE}🚀 MSSP Client Manager - Version Bump${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    exit 1
fi

# Check for uncommitted changes
if [[ $(git status --porcelain) ]]; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes. Please commit them first.${NC}"
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}📦 Current version: ${CURRENT_VERSION}${NC}"

# Run npm version (this updates package.json)
echo -e "${YELLOW}🔄 Bumping ${BUMP_TYPE} version...${NC}"
npm version $BUMP_TYPE --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}✅ New version: ${NEW_VERSION}${NC}"

# Commit and push the version change
echo -e "${YELLOW}📝 Committing version bump...${NC}"
git add package.json
git commit -m "chore: bump version to ${NEW_VERSION}"

echo -e "${YELLOW}🏷️  Creating git tag...${NC}"
git tag "v${NEW_VERSION}"

echo -e "${YELLOW}🚀 Pushing to remote...${NC}"
git push
git push --tags

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✨ Version successfully updated to ${NEW_VERSION} and pushed!${NC}"
echo -e "${GREEN}🔗 Git tag: v${NEW_VERSION}${NC}" 