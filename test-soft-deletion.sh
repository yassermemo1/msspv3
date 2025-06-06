#!/bin/bash

# Test script for soft deletion functionality
# Sets correct environment for macOS development

echo "🧪 Testing Soft Deletion Functionality"
echo "======================================="

# Set environment variables for standardized configuration
export DATABASE_URL="postgresql://mssp_user:12345678@localhost:5432/mssp_production"
export NODE_ENV="development"
export PORT="5001"

echo "✅ Environment configured:"
echo "  DATABASE_URL: $DATABASE_URL"
echo "  NODE_ENV: $NODE_ENV"
echo "  PORT: $PORT"

echo ""
echo "🔍 Testing database connection..."

# Test database connection
psql "$DATABASE_URL" -c "SELECT current_database(), current_user;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
    
    # Check if soft deletion schema exists
    echo ""
    echo "🔍 Checking soft deletion schema..."
    
    psql "$DATABASE_URL" -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'deleted_at';" 2>/dev/null | grep -q "deleted_at"
    
    if [ $? -eq 0 ]; then
        echo "✅ Soft deletion schema found (deleted_at column exists)"
        
        # Check current clients
        echo ""
        echo "📊 Current clients in database:"
        psql "$DATABASE_URL" -c "SELECT id, name, status, deleted_at FROM clients ORDER BY id;" 2>/dev/null
        
        # Test soft deletion API endpoints (if server is running)
        echo ""
        echo "🚀 Testing API endpoints..."
        
        # Start server in background
        tsx server/index.ts &
        SERVER_PID=$!
        
        echo "Started server with PID: $SERVER_PID"
        echo "Waiting for server to start..."
        sleep 8
        
        # Test endpoints
        echo "Testing login..."
        LOGIN_RESPONSE=$(curl -s -c cookies.txt -X POST http://localhost:5001/api/login \
            -H "Content-Type: application/json" \
            -d '{"email":"admin@test.mssp.local","password":"testpassword123"}' \
            -w "HTTP_CODE:%{http_code}")
        
        if echo "$LOGIN_RESPONSE" | grep -q "HTTP_CODE:200"; then
            echo "✅ Login successful"
            
            # Test clients endpoint
            echo "Testing clients endpoint..."
            CLIENTS_RESPONSE=$(curl -s -b cookies.txt http://localhost:5001/api/clients)
            echo "Clients response: $CLIENTS_RESPONSE"
            
            # Test deletion impact endpoint (if client exists)
            if echo "$CLIENTS_RESPONSE" | grep -q '"id"'; then
                echo "Testing deletion impact endpoint..."
                CLIENT_ID=$(echo "$CLIENTS_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
                IMPACT_RESPONSE=$(curl -s -b cookies.txt "http://localhost:5001/api/clients/$CLIENT_ID/deletion-impact")
                echo "Deletion impact response: $IMPACT_RESPONSE"
            fi
            
        else
            echo "❌ Login failed: $LOGIN_RESPONSE"
        fi
        
        # Clean up
        echo ""
        echo "🧹 Cleaning up..."
        kill $SERVER_PID 2>/dev/null
        
    else
        echo "❌ Soft deletion schema not found - deleted_at column missing"
        echo "Run migration: npm run db:migrate"
    fi
    
else
    echo "❌ Database connection failed"
    echo "Make sure PostgreSQL is running and mssp_production database exists"
fi

echo ""
echo "✅ Soft deletion test completed" 