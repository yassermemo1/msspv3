#!/bin/bash

echo "🔧 Widget Data & Configuration Fix Tool"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Check if the app is running
echo -e "${YELLOW}1. Checking if the application is running...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000)
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Application is running (HTTP $HTTP_STATUS)${NC}"
else
    echo -e "${RED}❌ Application is not running properly (HTTP $HTTP_STATUS)${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔍 Diagnosing Widget Issues...${NC}"
echo ""

# Test 2: Login and get authentication
echo -e "${YELLOW}2. Authenticating...${NC}"
LOGIN_RESPONSE=$(curl -s -c cookies.txt -X POST -H "Content-Type: application/json" -d '{"username":"yaser","password":"yaser"}' http://localhost:5000/api/login)
if [[ "$LOGIN_RESPONSE" == *"success"* ]] || [[ "$LOGIN_RESPONSE" == *"user"* ]]; then
    echo -e "${GREEN}✅ Authentication successful${NC}"
else
    echo -e "${RED}❌ Authentication failed: $LOGIN_RESPONSE${NC}"
    exit 1
fi

# Test 3: Check data sources
echo -e "${YELLOW}3. Checking data sources...${NC}"
DATASOURCES_RESPONSE=$(curl -s -b cookies.txt http://localhost:5000/api/data-sources)
echo "Data sources: $DATASOURCES_RESPONSE"

# Test 4: Check widgets
echo -e "${YELLOW}4. Checking dashboard widgets...${NC}"
WIDGETS_RESPONSE=$(curl -s -b cookies.txt http://localhost:5000/api/dashboard-widgets)
echo "Widgets: $WIDGETS_RESPONSE"

# Test 5: Check integrated data
echo -e "${YELLOW}5. Checking integrated data for data source 1...${NC}"
DATA_RESPONSE=$(curl -s -b cookies.txt http://localhost:5000/api/data-sources/1/data)
echo "Integrated data: $DATA_RESPONSE"

echo ""
echo -e "${BLUE}🎯 Issue Analysis:${NC}"
echo ""

echo -e "${YELLOW}Issue 1: Empty Widget Configuration${NC}"
echo "Your widget config is {} instead of having proper column definitions."
echo ""

echo -e "${YELLOW}Issue 2: Data Structure Problem${NC}"
echo "The data shows only metadata (_id, _syncedAt, _recordIdentifier) but missing the actual API data (fact, length)."
echo ""

echo -e "${GREEN}✅ Solutions:${NC}"
echo ""

echo -e "${BLUE}Solution 1: Fix Widget Configuration${NC}"
echo "1. Go to http://localhost:5000/integration-engine"
echo "2. Click 'Dashboard Widgets' tab"
echo "3. Delete the broken widget (if any)"
echo "4. Create a new widget with proper configuration:"
echo "   - Name: 'Cat Facts Table'"
echo "   - Type: 'Table'"
echo "   - Data Source: Select your Cat Facts API"
echo "   - Click 'Use Cat Facts Columns' button (this sets proper config)"
echo ""

echo -e "${BLUE}Solution 2: Re-sync Data${NC}"
echo "1. Go to 'Data Sources' tab"
echo "2. Click 'Sync' button on your Cat Facts data source"
echo "3. This will fetch fresh data from the API"
echo ""

echo -e "${BLUE}Solution 3: Verify Field Mappings${NC}"
echo "1. Go to 'Field Mapping' tab"
echo "2. Ensure you have mappings for:"
echo "   - Source: 'fact' → Target: 'fact' (string)"
echo "   - Source: 'length' → Target: 'length' (number)"
echo ""

echo -e "${YELLOW}🚀 Quick Fix Commands:${NC}"
echo ""

echo "# Delete all integrated data and re-sync:"
echo "curl -s -b cookies.txt -X DELETE http://localhost:5000/api/data-sources/1/data"
echo ""

echo "# Create proper field mappings:"
echo 'curl -s -b cookies.txt -X POST -H "Content-Type: application/json" -d '"'"'{"sourceField":"fact","targetField":"fact","fieldType":"string","isRequired":true}'"'"' http://localhost:5000/api/data-sources/1/mappings'
echo 'curl -s -b cookies.txt -X POST -H "Content-Type: application/json" -d '"'"'{"sourceField":"length","targetField":"length","fieldType":"number","isRequired":false}'"'"' http://localhost:5000/api/data-sources/1/mappings'
echo ""

echo "# Sync fresh data:"
echo "curl -s -b cookies.txt -X POST http://localhost:5000/api/data-sources/1/sync"
echo ""

echo -e "${GREEN}🎯 Expected Result After Fix:${NC}"
echo "Data should look like:"
echo '{'
echo '  "_id": 5,'
echo '  "_syncedAt": "2025-05-30T02:53:49.869Z",'
echo '  "_recordIdentifier": "uuid",'
echo '  "fact": "A cat has 230 bones in its body.",'
echo '  "length": 130'
echo '}'
echo ""

echo -e "${GREEN}✨ Widget configuration fix tool ready!${NC}"
echo "Run the commands above or follow the manual steps to fix the issues." 