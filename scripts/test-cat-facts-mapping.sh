#!/bin/bash

echo "🐱 Testing Cat Facts API Field Mapping"
echo "======================================"

echo ""
echo "1. 📡 Fetching sample data from Cat Facts API..."
RESPONSE=$(curl -s "https://catfact.ninja/fact")
echo "Raw Response:"
echo "$RESPONSE" | jq .

echo ""
echo "2. 🔍 Analyzing field structure..."
echo "Available fields:"
echo "$RESPONSE" | jq -r 'keys[]' | while read key; do
    value=$(echo "$RESPONSE" | jq -r ".$key")
    type=$(echo "$RESPONSE" | jq -r ".$key | type")
    echo "  - $key ($type): \"$value\""
done

echo ""
echo "3. 🗺️ Suggested Field Mappings:"
echo "   Source Field: 'fact' → Target Field: 'description' (string)"
echo "   Source Field: 'length' → Target Field: 'content_length' (number)"
echo "   Source Field: 'category' → Target Field: 'category' (string, default: 'animal_facts')"

echo ""
echo "4. 🧪 Testing field extraction..."
FACT=$(echo "$RESPONSE" | jq -r '.fact')
LENGTH=$(echo "$RESPONSE" | jq -r '.length')
echo "   Extracted fact: \"$FACT\""
echo "   Extracted length: $LENGTH"

echo ""
echo "5. ✅ Expected mapped data structure:"
cat << EOF | jq .
{
  "description": "$FACT",
  "content_length": $LENGTH,
  "category": "animal_facts",
  "source": "catfact.ninja"
}
EOF

echo ""
echo "🎯 Next Steps:"
echo "1. Go to Integration Engine → Field Mapping tab"
echo "2. Click 'Configure' on your Cat Facts data source"
echo "3. Test connection to see sample data"
echo "4. Click on 'fact' field to auto-populate mapping form"
echo "5. Set Target Field to 'description' and click 'Add Mapping'"
echo "6. Repeat for 'length' field → 'content_length'"
echo "7. Sync data and check Integrated Data tab" 