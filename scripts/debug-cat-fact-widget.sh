#!/bin/bash

echo "🐱 Debugging Cat Fact Widget Issue"
echo "=================================="

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
    echo -e "${RED}❌ Authentication failed: $LOGIN_RESPONSE${NC}"
    echo -e "${YELLOW}Trying alternative login...${NC}"
    # Try without explicit success check
    curl -s -c cookies.txt -X POST -H "Content-Type: application/json" -d '{"username":"yaser","password":"yaser"}' http://localhost:5000/api/login > /dev/null
fi

# Test 3: Check widgets
echo -e "${YELLOW}3. Checking dashboard widgets...${NC}"
WIDGETS_RESPONSE=$(curl -s -b cookies.txt http://localhost:5000/api/dashboard-widgets)
echo "Widgets response: $WIDGETS_RESPONSE"

WIDGET_COUNT=$(echo $WIDGETS_RESPONSE | grep -o '"id":' | wc -l)
echo -e "${BLUE}Found $WIDGET_COUNT widget(s)${NC}"

# Test 4: Check data sources
echo -e "${YELLOW}4. Checking data sources...${NC}"
DATASOURCES_RESPONSE=$(curl -s -b cookies.txt http://localhost:5000/api/data-sources)
echo "Data sources response: $DATASOURCES_RESPONSE"

DATASOURCE_COUNT=$(echo $DATASOURCES_RESPONSE | grep -o '"id":' | wc -l)
echo -e "${BLUE}Found $DATASOURCE_COUNT data source(s)${NC}"

if [ "$DATASOURCE_COUNT" -gt 0 ]; then
    # Get first data source ID
    DATASOURCE_ID=$(echo $DATASOURCES_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo -e "${BLUE}Using data source ID: $DATASOURCE_ID${NC}"
    
    # Test 5: Check field mappings
    echo -e "${YELLOW}5. Checking field mappings for data source $DATASOURCE_ID...${NC}"
    MAPPINGS_RESPONSE=$(curl -s -b cookies.txt http://localhost:5000/api/data-sources/$DATASOURCE_ID/mappings)
    echo "Mappings response: $MAPPINGS_RESPONSE"
    
    MAPPING_COUNT=$(echo $MAPPINGS_RESPONSE | grep -o '"id":' | wc -l)
    echo -e "${BLUE}Found $MAPPING_COUNT field mapping(s)${NC}"
    
    # Test 6: Check integrated data
    echo -e "${YELLOW}6. Checking integrated data for data source $DATASOURCE_ID...${NC}"
    DATA_RESPONSE=$(curl -s -b cookies.txt http://localhost:5000/api/data-sources/$DATASOURCE_ID/data)
    echo "Integrated data response: $DATA_RESPONSE"
    
    DATA_COUNT=$(echo $DATA_RESPONSE | grep -o '"id":' | wc -l)
    echo -e "${BLUE}Found $DATA_COUNT integrated data record(s)${NC}"
    
    # Test 7: Test the Cat Facts API directly
    echo -e "${YELLOW}7. Testing Cat Facts API directly...${NC}"
    CAT_FACT_RESPONSE=$(curl -s "https://catfact.ninja/fact")
    echo "Cat Facts API response: $CAT_FACT_RESPONSE"
    
    # Extract fact and length
    if command -v jq &> /dev/null; then
        FACT=$(echo $CAT_FACT_RESPONSE | jq -r '.fact')
        LENGTH=$(echo $CAT_FACT_RESPONSE | jq -r '.length')
        echo -e "${GREEN}✅ Cat Facts API working: Fact length = $LENGTH${NC}"
    else
        echo -e "${YELLOW}⚠️  jq not available, cannot parse JSON response${NC}"
    fi
fi

echo ""
echo -e "${BLUE}🔍 DIAGNOSIS:${NC}"
echo "============="

# Analyze the issue
if [ "$WIDGET_COUNT" -eq 0 ]; then
    echo -e "${RED}❌ ISSUE: No widgets found${NC}"
    echo -e "${YELLOW}SOLUTION: Create a Cat Fact widget${NC}"
elif [ "$DATASOURCE_COUNT" -eq 0 ]; then
    echo -e "${RED}❌ ISSUE: No data sources found${NC}"
    echo -e "${YELLOW}SOLUTION: Create a Cat Facts data source${NC}"
elif [ "$MAPPING_COUNT" -eq 0 ]; then
    echo -e "${RED}❌ ISSUE: No field mappings found${NC}"
    echo -e "${YELLOW}SOLUTION: Create field mappings for 'fact' and 'length' fields${NC}"
elif [ "$DATA_COUNT" -eq 0 ]; then
    echo -e "${RED}❌ ISSUE: No integrated data found${NC}"
    echo -e "${YELLOW}SOLUTION: Sync data from the Cat Facts API${NC}"
else
    echo -e "${GREEN}✅ All components exist, checking data structure...${NC}"
    
    # Check if data has mappedData
    if echo $DATA_RESPONSE | grep -q '"mappedData"'; then
        echo -e "${GREEN}✅ Mapped data exists${NC}"
        
        # Check if mappedData has content
        if echo $DATA_RESPONSE | grep -q '"mappedData":{}'; then
            echo -e "${RED}❌ ISSUE: Mapped data is empty${NC}"
            echo -e "${YELLOW}SOLUTION: Field mappings exist but data is not properly mapped${NC}"
        else
            echo -e "${GREEN}✅ Mapped data has content${NC}"
            echo -e "${YELLOW}⚠️  Widget might have configuration issue${NC}"
        fi
    else
        echo -e "${RED}❌ ISSUE: No mapped data structure${NC}"
        echo -e "${YELLOW}SOLUTION: Re-sync data after creating field mappings${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🚀 QUICK FIX STEPS:${NC}"
echo "=================="

echo "1. Go to http://localhost:5000/integration-engine"
echo "2. Check 'Data Sources' tab - ensure Cat Facts API exists"
echo "3. Go to 'Field Mapping' tab:"
echo "   - Click 'Configure' on Cat Facts data source"
echo "   - Create mapping: fact → description (string)"
echo "   - Create mapping: length → content_length (number)"
echo "4. Go to 'Data Sources' tab and click 'Sync' on Cat Facts"
echo "5. Go to 'Dashboard Widgets' tab:"
echo "   - Create or edit Cat Fact widget"
echo "   - For metric widget: set valueField to 'content_length'"
echo "   - For table widget: use Quick Setup 'Cat Facts Columns'"
echo "6. Go to main dashboard to see the widget"

echo ""
echo -e "${BLUE}🎯 Expected Widget Configuration:${NC}"
echo "Metric Widget:"
echo "  - Name: 'Cat Fact Length'"
echo "  - Type: 'metric'"
echo "  - Value Field: 'content_length' (or 'length' if mapped directly)"
echo "  - Label: 'Average Length'"

echo ""
echo "Table Widget:"
echo "  - Name: 'Cat Facts Table'"
echo "  - Type: 'table'"
echo "  - Columns: [{'field': 'description', 'label': 'Cat Fact', 'type': 'string'}, {'field': 'content_length', 'label': 'Length', 'type': 'number'}]"

# Cleanup
rm -f cookies.txt

echo ""
echo -e "${GREEN}✨ Debug complete! Follow the steps above to fix the widget.${NC}" 