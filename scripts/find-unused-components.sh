#!/bin/bash

echo "🧹 Finding potentially unused components..."
echo "=========================================="

# Find all component files
COMPONENT_FILES=$(find client/src/components -name "*.tsx" -type f)

echo ""
echo "📋 Checking each component for usage:"
echo "------------------------------------"

for file in $COMPONENT_FILES; do
    # Extract component name from filename and convert to PascalCase
    FILENAME=$(basename "$file" .tsx)
    
    # Convert kebab-case to PascalCase using a more robust approach
    # e.g., "app-layout" -> "AppLayout", "dashboard-widget" -> "DashboardWidget"
    COMPONENT_NAME=$(echo "$FILENAME" | awk -F'-' '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)} 1' OFS='')
    
    # Count usage occurrences (excluding the file itself)
    USAGE_COUNT=$(grep -r "$COMPONENT_NAME" client/src/ --include="*.tsx" --include="*.ts" | grep -v "$file" | wc -l | tr -d ' ')
    
    if [ "$USAGE_COUNT" -eq 0 ]; then
        echo "❌ UNUSED: $file (Component: $COMPONENT_NAME)"
    elif [ "$USAGE_COUNT" -lt 3 ]; then
        echo "⚠️  LOW USAGE: $file (Component: $COMPONENT_NAME) - Used $USAGE_COUNT times"
    else
        echo "✅ ACTIVE: $file (Component: $COMPONENT_NAME) - Used $USAGE_COUNT times"
    fi
done

echo ""
echo "💡 Note: Review 'UNUSED' and 'LOW USAGE' components manually before deletion" 