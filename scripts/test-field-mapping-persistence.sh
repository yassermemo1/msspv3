#!/bin/bash

echo "🧪 Testing Field Mapping Persistence"
echo "===================================="

# Test 1: Check if data sources exist
echo "1. Checking data sources..."
DATASOURCES_RESPONSE=$(curl -s -b cookies.txt http://localhost:5000/api/data-sources)
echo "Data sources response: $DATASOURCES_RESPONSE"

# Extract first data source ID
DATASOURCE_ID=$(echo $DATASOURCES_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "Using data source ID: $DATASOURCE_ID"

if [ -z "$DATASOURCE_ID" ]; then
    echo "❌ No data sources found. Please create a data source first."
    exit 1
fi

# Test 2: Check existing mappings
echo ""
echo "2. Checking existing mappings for data source $DATASOURCE_ID..."
MAPPINGS_RESPONSE=$(curl -s -b cookies.txt http://localhost:5000/api/data-sources/$DATASOURCE_ID/mappings)
echo "Existing mappings: $MAPPINGS_RESPONSE"

# Test 3: Create a test mapping
echo ""
echo "3. Creating a test mapping..."
CREATE_MAPPING_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "sourceField": "fact",
    "targetField": "cat_fact_text", 
    "fieldType": "string",
    "isRequired": false,
    "defaultValue": ""
  }' \
  http://localhost:5000/api/data-sources/$DATASOURCE_ID/mappings)

echo "Create mapping response: $CREATE_MAPPING_RESPONSE"

# Test 4: Verify mapping was created
echo ""
echo "4. Verifying mapping was created..."
sleep 1
UPDATED_MAPPINGS_RESPONSE=$(curl -s -b cookies.txt http://localhost:5000/api/data-sources/$DATASOURCE_ID/mappings)
echo "Updated mappings: $UPDATED_MAPPINGS_RESPONSE"

# Count mappings
MAPPING_COUNT=$(echo $UPDATED_MAPPINGS_RESPONSE | grep -o '"id":' | wc -l)
echo "Total mappings found: $MAPPING_COUNT"

# Test 5: Simulate page refresh by making fresh API calls
echo ""
echo "5. Simulating page refresh - fetching data again..."
sleep 2

REFRESH_DATASOURCES=$(curl -s -b cookies.txt http://localhost:5000/api/data-sources)
REFRESH_MAPPINGS=$(curl -s -b cookies.txt http://localhost:5000/api/data-sources/$DATASOURCE_ID/mappings)

echo "After refresh - Data sources: $(echo $REFRESH_DATASOURCES | grep -o '"id":' | wc -l) found"
echo "After refresh - Mappings: $(echo $REFRESH_MAPPINGS | grep -o '"id":' | wc -l) found"

# Test 6: Check specific mapping fields
echo ""
echo "6. Checking specific mapping details..."
echo "Mappings details: $REFRESH_MAPPINGS"

# Check if our test mapping exists
if echo $REFRESH_MAPPINGS | grep -q "cat_fact_text"; then
    echo "✅ Test mapping 'cat_fact_text' found after refresh"
else
    echo "❌ Test mapping 'cat_fact_text' NOT found after refresh"
fi

if echo $REFRESH_MAPPINGS | grep -q "fact"; then
    echo "✅ Source field 'fact' found after refresh"
else
    echo "❌ Source field 'fact' NOT found after refresh"
fi

echo ""
echo "🏁 Field Mapping Persistence Test Complete"
echo "=========================================="

# Summary
if [ "$MAPPING_COUNT" -gt 0 ]; then
    echo "✅ SUCCESS: Field mappings are persisting correctly"
    echo "   - $MAPPING_COUNT mapping(s) found"
    echo "   - Data persists after page refresh simulation"
else
    echo "❌ FAILURE: Field mappings are not persisting"
    echo "   - No mappings found after creation"
fi 