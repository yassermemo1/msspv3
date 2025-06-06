#!/bin/bash

echo "🔍 Checking React Routes and Components"
echo "======================================="

echo -e "\n📍 Routes defined in React Router:"
echo "--------------------------------"
grep -r "path.*:" client/src --include="*.tsx" --include="*.ts" | grep -E "dashboard|licenses|hardware|saf|coc|users|profile|audit-logs" | head -20

echo -e "\n📁 Page Components that exist:"
echo "-----------------------------"
find client/src/pages -name "*.tsx" -o -name "*.jsx" | sort

echo -e "\n🔴 Routes that appear empty in browser:"
echo "--------------------------------------"
echo "- /dashboard"
echo "- /licenses" 
echo "- /hardware"
echo "- /saf"
echo "- /coc"
echo "- /users"
echo "- /users/new"
echo "- /profile"
echo "- /audit-logs"
echo "- /admin"
echo "- /admin/services"
echo "- /admin/roles"
echo "- /settings/company"
echo "- /settings/security"
echo "- /settings/notifications"

echo -e "\n🟢 Routes that work properly:"
echo "----------------------------"
echo "- / (home)"
echo "- /clients"
echo "- /services"
echo "- /contracts"
echo "- /reports"
echo "- /external-systems"

echo -e "\n🔍 Checking for lazy loaded components:"
echo "-------------------------------------"
grep -r "lazy(" client/src --include="*.tsx" --include="*.ts" | head -10

echo -e "\n🔍 Checking main App routes file:"
echo "--------------------------------"
if [ -f "client/src/App.tsx" ]; then
  grep -A 5 -B 5 "Route" client/src/App.tsx | head -30
fi

echo -e "\n🔍 Checking for route definitions:"
echo "---------------------------------"
find client/src -name "*route*" -o -name "*Route*" | grep -E "\.(tsx?|jsx?)$" 