#!/bin/bash

# Usage: ./scripts/find-component-usage.sh ComponentName

if [ $# -eq 0 ]; then
    echo "Usage: $0 <ComponentName>"
    echo "Example: $0 Sidebar"
    exit 1
fi

COMPONENT_NAME=$1

echo "🔍 Searching for usage of component: $COMPONENT_NAME"
echo "================================================"

echo ""
echo "📁 Files containing '$COMPONENT_NAME':"
echo "--------------------------------------"
grep -r "$COMPONENT_NAME" client/src/ --include="*.tsx" --include="*.ts" -l

echo ""
echo "📝 Import statements:"
echo "--------------------"
grep -r "import.*$COMPONENT_NAME" client/src/ --include="*.tsx" --include="*.ts"

echo ""
echo "🏷️  Component usage in JSX:"
echo "---------------------------"
grep -r "<$COMPONENT_NAME" client/src/ --include="*.tsx" --include="*.ts"

echo ""
echo "📤 Export statements:"
echo "--------------------"
grep -r "export.*$COMPONENT_NAME" client/src/ --include="*.tsx" --include="*.ts"

echo ""
echo "🔧 Function/variable references:"
echo "--------------------------------"
grep -r "$COMPONENT_NAME" client/src/ --include="*.tsx" --include="*.ts" | grep -v "import" | grep -v "export" | head -10 