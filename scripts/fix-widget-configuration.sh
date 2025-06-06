#!/bin/bash

echo "🔧 Widget Configuration Fix Tool"
echo "================================"

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
echo -e "${BLUE}🎯 Widget Configuration Issues & Solutions:${NC}"
echo ""

echo -e "${YELLOW}Issue: 'No columns configured' message${NC}"
echo "This happens when table widgets don't have proper column configuration."
echo ""

echo -e "${GREEN}✅ Solutions:${NC}"
echo "1. Go to http://localhost:5000/integration-engine"
echo "2. Click on 'Dashboard Widgets' tab"
echo "3. Create a new widget or edit existing ones"
echo "4. For Table widgets, use the 'Quick Setup' buttons:"
echo "   - 'Use Cat Facts Columns' for Cat Facts API data"
echo "   - 'Use Generic Columns' for other data sources"
echo ""

echo -e "${YELLOW}📝 Proper Widget Configurations:${NC}"
echo ""

echo -e "${BLUE}Table Widget (Cat Facts):${NC}"
echo 'Columns: [{"field": "fact", "label": "Cat Fact", "type": "string"}, {"field": "length", "label": "Length", "type": "number"}]'
echo ""

echo -e "${BLUE}Metric Widget (Cat Facts):${NC}"
echo "Value Field: length"
echo "Label: Average Length"
echo ""

echo -e "${BLUE}List Widget (Cat Facts):${NC}"
echo "Title Field: fact"
echo "Subtitle Field: length"
echo "Badge Field: (leave empty)"
echo ""

echo -e "${BLUE}Chart Widget (Cat Facts):${NC}"
echo "X-Axis Field: fact"
echo "Y-Axis Field: length"
echo ""

echo -e "${GREEN}🚀 Quick Test Steps:${NC}"
echo "1. Open browser to http://localhost:5000/integration-engine"
echo "2. Go to Dashboard Widgets tab"
echo "3. Click 'Create Widget'"
echo "4. Fill in:"
echo "   - Name: 'Cat Facts Table'"
echo "   - Type: 'Table'"
echo "   - Data Source: Select your Cat Facts API"
echo "   - Click 'Use Cat Facts Columns' button"
echo "5. Click 'Create Widget'"
echo "6. Go back to main dashboard to see the widget"
echo ""

echo -e "${YELLOW}🔍 Debug Mode:${NC}"
echo "The app now includes debug information in development mode."
echo "Check browser console for detailed widget configuration info."
echo ""

echo -e "${GREEN}✨ Widget configuration help is now available!${NC}" 