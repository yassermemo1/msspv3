#!/bin/bash

echo "🧪 Testing Widget Display and Functionality"
echo "==========================================="

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

# Test 2: Check authentication
echo -e "${YELLOW}2. Checking authentication...${NC}"
if [ -f "cookies_new.txt" ]; then
    cp cookies_new.txt cookies.txt
    echo -e "${GREEN}✅ Using existing authentication cookies${NC}"
else
    echo -e "${YELLOW}⚠️  No authentication cookies found. Please login first.${NC}"
fi

# Test 3: Check widgets API
echo -e "${YELLOW}3. Testing widgets API...${NC}"
WIDGETS_RESPONSE=$(curl -s -b cookies.txt http://localhost:5000/api/dashboard-widgets)
echo "Widgets API response: $WIDGETS_RESPONSE"

# Count widgets
WIDGET_COUNT=$(echo $WIDGETS_RESPONSE | grep -o '"id":' | wc -l)
echo -e "${BLUE}Found $WIDGET_COUNT widget(s)${NC}"

if [ "$WIDGET_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Widgets found in database${NC}"
    
    # Extract widget details
    echo -e "${YELLOW}4. Widget Details:${NC}"
    echo $WIDGETS_RESPONSE | python3 -m json.tool 2>/dev/null || echo "Raw response: $WIDGETS_RESPONSE"
else
    echo -e "${YELLOW}⚠️  No widgets found. Create a widget first.${NC}"
fi

# Test 4: Check data sources
echo -e "${YELLOW}5. Testing data sources API...${NC}"
DATASOURCES_RESPONSE=$(curl -s -b cookies.txt http://localhost:5000/api/data-sources)
DATASOURCE_COUNT=$(echo $DATASOURCES_RESPONSE | grep -o '"id":' | wc -l)
echo -e "${BLUE}Found $DATASOURCE_COUNT data source(s)${NC}"

if [ "$DATASOURCE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Data sources available${NC}"
    
    # Get first data source ID
    DATASOURCE_ID=$(echo $DATASOURCES_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo -e "${BLUE}Testing with data source ID: $DATASOURCE_ID${NC}"
    
    # Test integrated data
    echo -e "${YELLOW}6. Testing integrated data...${NC}"
    DATA_RESPONSE=$(curl -s -b cookies.txt http://localhost:5000/api/data-sources/$DATASOURCE_ID/data)
    DATA_COUNT=$(echo $DATA_RESPONSE | grep -o '"id":' | wc -l)
    echo -e "${BLUE}Found $DATA_COUNT integrated data record(s)${NC}"
    
    if [ "$DATA_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Integrated data available for widgets${NC}"
    else
        echo -e "${YELLOW}⚠️  No integrated data found. Sync data source first.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No data sources found. Create a data source first.${NC}"
fi

# Test 5: Check home page for widget display
echo -e "${YELLOW}7. Testing home page widget display...${NC}"
HOME_PAGE=$(curl -s -b cookies.txt http://localhost:5000/)
if echo "$HOME_PAGE" | grep -q "Integration Widgets"; then
    echo -e "${GREEN}✅ Home page includes widget display section${NC}"
else
    echo -e "${YELLOW}⚠️  Home page may not be showing widgets (check if widgets exist)${NC}"
fi

# Test 6: Check Integration Engine page
echo -e "${YELLOW}8. Testing Integration Engine page...${NC}"
IE_PAGE=$(curl -s -b cookies.txt http://localhost:5000/integration-engine)
if echo "$IE_PAGE" | grep -q "Create Widget"; then
    echo -e "${GREEN}✅ Integration Engine page includes widget creation${NC}"
else
    echo -e "${RED}❌ Integration Engine page missing widget creation${NC}"
fi

echo ""
echo -e "${YELLOW}🏁 Widget Display Test Complete${NC}"
echo "================================"

# Summary
echo -e "${GREEN}✅ SUMMARY:${NC}"
echo "   - Application: Running"
echo "   - Widgets: $WIDGET_COUNT found"
echo "   - Data Sources: $DATASOURCE_COUNT found"
echo "   - Integrated Data: $DATA_COUNT records"
echo ""
echo -e "${YELLOW}📝 How to use your widgets:${NC}"
echo "   1. Go to http://localhost:5000/integration-engine"
echo "   2. Create a data source (e.g., Cat Facts API)"
echo "   3. Test the connection to get sample data"
echo "   4. Create field mappings"
echo "   5. Sync data from the source"
echo "   6. Create a widget with proper configuration"
echo "   7. View the widget on the main dashboard at http://localhost:5000/"
echo ""
echo -e "${BLUE}🎯 Widget Types Available:${NC}"
echo "   - Metric: Shows a single value with trend"
echo "   - Chart: Bar chart visualization"
echo "   - Table: Tabular data display"
echo "   - List: List of items with badges"
echo ""
echo -e "${GREEN}🚀 Your widgets will appear on the main dashboard automatically!${NC}" 