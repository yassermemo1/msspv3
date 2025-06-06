#!/bin/bash

echo "🗑️ Testing Field Mapping Deletion Functionality"
echo "=============================================="

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
    echo -e "${YELLOW}Please start the application with 'npm run dev'${NC}"
    exit 1
fi

# Test 2: Login and get authentication
echo -e "${YELLOW}2. Authenticating...${NC}"
LOGIN_RESPONSE=$(curl -s -c cookies.txt -X POST -H "Content-Type: application/json" -d '{"username":"yaser","password":"yaser"}' http://localhost:5000/api/login)
if [[ "$LOGIN_RESPONSE" == *"success"* ]] || [[ "$LOGIN_RESPONSE" == *"user"* ]] || [[ "$LOGIN_RESPONSE" == *"yaser"* ]]; then
    echo -e "${GREEN}✅ Authentication successful${NC}"
else
    echo -e "${YELLOW}⚠️ Authentication response: $LOGIN_RESPONSE${NC}"
    # Continue anyway as login might still work
fi

# Test 3: Check data sources
echo -e "${YELLOW}3. Checking data sources...${NC}"
DATASOURCES_RESPONSE=$(curl -s -b cookies.txt http://localhost:5000/api/data-sources)
DATASOURCE_COUNT=$(echo $DATASOURCES_RESPONSE | grep -o '"id":' | wc -l)
echo -e "${BLUE}Found $DATASOURCE_COUNT data source(s)${NC}"

if [ "$DATASOURCE_COUNT" -gt 0 ]; then
    # Get first data source ID
    DATASOURCE_ID=$(echo $DATASOURCES_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo -e "${BLUE}Using data source ID: $DATASOURCE_ID${NC}"
    
    # Test 4: Check existing field mappings
    echo -e "${YELLOW}4. Checking existing field mappings...${NC}"
    MAPPINGS_RESPONSE=$(curl -s -b cookies.txt http://localhost:5000/api/data-sources/$DATASOURCE_ID/mappings)
    echo "Mappings response: $MAPPINGS_RESPONSE"
    
    MAPPING_COUNT=$(echo $MAPPINGS_RESPONSE | grep -o '"id":' | wc -l)
    echo -e "${BLUE}Found $MAPPING_COUNT existing mapping(s)${NC}"
    
    if [ "$MAPPING_COUNT" -eq 0 ]; then
        # Test 5: Create a test mapping first
        echo -e "${YELLOW}5. Creating a test field mapping...${NC}"
        CREATE_RESPONSE=$(curl -s -b cookies.txt -X POST -H "Content-Type: application/json" \
            -d '{"sourceField":"test_field","targetField":"test_target","fieldType":"string","isRequired":false}' \
            http://localhost:5000/api/data-sources/$DATASOURCE_ID/mappings)
        
        if [[ "$CREATE_RESPONSE" == *"success"* ]] || [[ "$CREATE_RESPONSE" == *"id"* ]]; then
            echo -e "${GREEN}✅ Test mapping created successfully${NC}"
            
            # Fetch mappings again to get the new mapping ID
            MAPPINGS_RESPONSE=$(curl -s -b cookies.txt http://localhost:5000/api/data-sources/$DATASOURCE_ID/mappings)
            MAPPING_COUNT=$(echo $MAPPINGS_RESPONSE | grep -o '"id":' | wc -l)
        else
            echo -e "${RED}❌ Failed to create test mapping: $CREATE_RESPONSE${NC}"
        fi
    fi
    
    if [ "$MAPPING_COUNT" -gt 0 ]; then
        # Get first mapping ID
        MAPPING_ID=$(echo $MAPPINGS_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
        echo -e "${BLUE}Testing deletion of mapping ID: $MAPPING_ID${NC}"
        
        # Test 6: Delete the mapping
        echo -e "${YELLOW}6. Testing field mapping deletion...${NC}"
        DELETE_RESPONSE=$(curl -s -w "%{http_code}" -b cookies.txt -X DELETE http://localhost:5000/api/data-source-mappings/$MAPPING_ID)
        DELETE_STATUS="${DELETE_RESPONSE: -3}"
        
        if [ "$DELETE_STATUS" = "204" ]; then
            echo -e "${GREEN}✅ Field mapping deleted successfully (HTTP $DELETE_STATUS)${NC}"
            
            # Test 7: Verify deletion
            echo -e "${YELLOW}7. Verifying mapping was deleted...${NC}"
            VERIFY_RESPONSE=$(curl -s -b cookies.txt http://localhost:5000/api/data-sources/$DATASOURCE_ID/mappings)
            NEW_MAPPING_COUNT=$(echo $VERIFY_RESPONSE | grep -o '"id":' | wc -l)
            
            if [ "$NEW_MAPPING_COUNT" -lt "$MAPPING_COUNT" ]; then
                echo -e "${GREEN}✅ Mapping successfully removed from database${NC}"
                echo -e "${GREEN}✅ Field mapping deletion is working correctly!${NC}"
            else
                echo -e "${RED}❌ Mapping still exists in database${NC}"
            fi
        else
            echo -e "${RED}❌ Failed to delete mapping (HTTP $DELETE_STATUS)${NC}"
            echo "Response: $DELETE_RESPONSE"
        fi
    else
        echo -e "${RED}❌ No mappings available to test deletion${NC}"
    fi
else
    echo -e "${RED}❌ No data sources found${NC}"
fi

# Cleanup
rm -f cookies.txt

echo ""
echo -e "${BLUE}🔍 SUMMARY:${NC}"
echo "==========="

if [ "$DELETE_STATUS" = "204" ] && [ "$NEW_MAPPING_COUNT" -lt "$MAPPING_COUNT" ]; then
    echo -e "${GREEN}✅ Field mapping deletion is working correctly!${NC}"
    echo ""
    echo -e "${GREEN}🎯 How to use:${NC}"
    echo "1. Go to http://localhost:5000/integration-engine"
    echo "2. Select a data source"
    echo "3. Go to 'Field Mapping' tab"
    echo "4. Click the trash icon (🗑️) next to any mapping"
    echo "5. Confirm the deletion in the popup"
    echo "6. The mapping will be removed immediately"
else
    echo -e "${RED}❌ Field mapping deletion needs attention${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Troubleshooting:${NC}"
    echo "1. Ensure the server is running: npm run dev"
    echo "2. Check browser console for JavaScript errors"
    echo "3. Verify you're logged in as 'yaser'"
    echo "4. Try refreshing the page"
fi

echo ""
echo -e "${BLUE}✨ Test complete!${NC}" 