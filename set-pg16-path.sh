#!/bin/bash

# Set PostgreSQL 16 Path for Production Systems
# This script helps configure PostgreSQL 16 paths for production use

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 PostgreSQL 16 Path Configuration${NC}"
echo ""

# Check if PostgreSQL 16 is installed
if [ -f "/usr/pgsql-16/bin/psql" ]; then
    echo -e "${GREEN}✅ PostgreSQL 16 found at: /usr/pgsql-16/bin${NC}"
    
    # Add to current session
    export PATH="/usr/pgsql-16/bin:$PATH"
    echo -e "${GREEN}✅ PostgreSQL 16 added to current session PATH${NC}"
    
    # Check if already in bashrc
    if ! grep -q "/usr/pgsql-16/bin" ~/.bashrc 2>/dev/null; then
        echo ""
        echo -e "${YELLOW}Would you like to add PostgreSQL 16 to your PATH permanently? (y/N)${NC}"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            echo 'export PATH="/usr/pgsql-16/bin:$PATH"' >> ~/.bashrc
            echo -e "${GREEN}✅ PostgreSQL 16 path added to ~/.bashrc${NC}"
            echo -e "${YELLOW}ℹ️  Run 'source ~/.bashrc' or restart your shell to apply${NC}"
        fi
    else
        echo -e "${GREEN}✅ PostgreSQL 16 already in ~/.bashrc${NC}"
    fi
    
    # Test the commands
    echo ""
    echo -e "${BLUE}Testing PostgreSQL 16 commands:${NC}"
    echo "Version: $(/usr/pgsql-16/bin/psql --version)"
    echo "Location: $(which /usr/pgsql-16/bin/psql)"
    
elif [ -f "/opt/postgresql/16/bin/psql" ]; then
    echo -e "${GREEN}✅ PostgreSQL 16 found at: /opt/postgresql/16/bin${NC}"
    export PATH="/opt/postgresql/16/bin:$PATH"
    echo -e "${GREEN}✅ PostgreSQL 16 added to current session PATH${NC}"
    
else
    echo -e "${YELLOW}⚠️  PostgreSQL 16 not found in standard locations${NC}"
    echo "Checking for other versions..."
    
    for version in 15 14 13 12; do
        if [ -f "/usr/pgsql-${version}/bin/psql" ]; then
            echo -e "${YELLOW}Found PostgreSQL ${version} at: /usr/pgsql-${version}/bin${NC}"
        fi
    done
    
    echo ""
    echo "To install PostgreSQL 16 on RedHat/CentOS:"
    echo "sudo dnf install postgresql16-server postgresql16"
fi

echo ""
echo -e "${GREEN}🎉 PostgreSQL 16 path configuration completed!${NC}" 