# API Testing Guide - MSSP Client Management Platform

## 🎯 Quick Status Check

Based on server logs, these APIs are **WORKING** ✅:
- Authentication system (login/logout)
- User management endpoints
- Dashboard statistics
- Client management
- Contract management
- Financial transactions
- **Integration Engine endpoints** (data-sources, dashboard-widgets)

## 🐱 **Cat Fact API Testing Example**

**API Endpoint:** `https://catfact.ninja/fact`

**Confirmed Response Structure:**
```json
{
  "fact": "At 4 weeks, it is important to play with kittens so that they do not develope a fear of people.",
  "length": 95
}
```

**Field Types Detected:**
- `fact` (string) - The cat fact text
- `length` (number) - Character count

**✅ Your Integration Engine correctly shows:**
- "fact (string)" 
- "length (number)"

This is the **schema detection** working properly, not an error!

## 🧪 Testing Methods

### 1. **Browser Developer Tools (Recommended)**

**Steps:**
1. Open your browser to `http://localhost:5000`
2. Press `F12` to open Developer Tools
3. Go to **Network** tab
4. Navigate through the app (click on different pages)
5. Watch the API calls in real-time

**What to look for:**
- Status codes: `200` = Success, `401` = Auth required, `500` = Server error
- Response times
- Request/response data

### 2. **Integration Engine API Testing**

**In the browser:**
1. Log into the app
2. Click on **"Integration Engine"** in the sidebar
3. Check Developer Tools Network tab for:
   ```
   GET /api/data-sources
   GET /api/dashboard-widgets
   ```

**Expected behavior:**
- Should return empty arrays `[]` initially (no data sources configured yet)
- Status code should be `200`

**Testing Cat Fact API Integration:**
1. **Create Data Source:**
   ```json
   {
     "name": "Cat Facts API",
     "description": "Random cat facts for testing",
     "apiEndpoint": "https://catfact.ninja/fact",
     "authType": "none",
     "syncFrequency": "manual"
   }
   ```

2. **Test Connection** (POST request):
   ```bash
   # This should return sample data with fact and length fields
   POST /api/data-sources/1/test
   ```

3. **Expected Test Response:**
   ```json
   {
     "success": true,
     "sampleData": {
       "fact": "Some cat fact here...",
       "length": 42
     }
   }
   ```

### 3. **Command Line Testing**

**Test public endpoints:**
```bash
# Test server health
curl http://localhost:5000/api/health

# Test authentication requirement (should return auth error)
curl http://localhost:5000/api/data-sources
```

**Test with authentication (after logging in via browser):**
```bash
# Get session cookie from browser developer tools
# Then test authenticated endpoints
curl -H "Cookie: session=YOUR_SESSION_COOKIE" http://localhost:5000/api/user
```

### 4. **Postman/Insomnia Testing**

**Setup:**
1. Install Postman or Insomnia
2. Create a new collection
3. Add these endpoints:

```
POST http://localhost:5000/api/login
Body: {"username": "yaser", "password": "your_password"}

GET http://localhost:5000/api/user
GET http://localhost:5000/api/data-sources
GET http://localhost:5000/api/dashboard-widgets
POST http://localhost:5000/api/data-sources
```

## 📋 Integration Engine API Endpoints

### **Data Sources**
```bash
# List all data sources
GET /api/data-sources

# Create new data source (Cat Fact API example)
POST /api/data-sources
{
  "name": "Cat Facts API",
  "description": "Random cat facts for testing",
  "apiEndpoint": "https://catfact.ninja/fact",
  "authType": "none",
  "authConfig": {},
  "syncFrequency": "manual"
}

# Test connection (POST, not GET!)
POST /api/data-sources/:id/test

# Sync data
POST /api/data-sources/:id/sync
```

### **Field Mappings for Cat Facts**
```bash
# Create field mapping for cat fact content
POST /api/data-sources/:id/mappings
{
  "sourceField": "fact",
  "targetField": "description",
  "fieldType": "string",
  "isRequired": true
}

# Create field mapping for content length
POST /api/data-sources/:id/mappings
{
  "sourceField": "length",
  "targetField": "content_length",
  "fieldType": "number",
  "isRequired": false
}
```

### **Field Mappings**
```bash
# Get mappings for a data source
GET /api/data-sources/:id/mappings

# Create field mapping
POST /api/data-sources/:id/mappings
{
  "sourceField": "name",
  "targetField": "client_name",
  "fieldType": "string",
  "isRequired": true
}
```

### **Dashboard Widgets**
```bash
# List all widgets
GET /api/dashboard-widgets

# Create widget
POST /api/dashboard-widgets
{
  "name": "User Count",
  "type": "metric",
  "dataSourceId": 1,
  "config": {
    "valueField": "count",
    "labelField": "label"
  }
}
```

## 🔍 Testing Scenarios

### **Scenario 1: Basic API Health**
1. ✅ Server responds to requests
2. ✅ Authentication system works
3. ✅ Protected routes require login
4. ✅ User session management works

### **Scenario 2: Cat Fact API Integration Workflow**
1. **Create Data Source:**
   - Navigate to Integration Engine
   - Click "Add Data Source"
   - Use: `https://catfact.ninja/fact`
   - Set auth type to "none"
   - Save and verify it appears in the list

2. **Test Connection:**
   - Click "Test Connection" on your Cat Facts data source
   - Should fetch a random cat fact with `fact` and `length` fields
   - Check Network tab for successful POST to `/api/data-sources/1/test`

3. **Verify Schema Detection:**
   - Should show "fact (string)" and "length (number)"
   - This is correct behavior - it's showing the detected field schema

4. **Create Field Mapping:**
   - Click on your data source
   - Go to "Field Mapping" tab
   - Map `fact` → `description` (or your preferred target field)
   - Map `length` → `content_length`
   - Save mapping

5. **Sync Data:**
   - Click "Sync Data" button
   - Check "Integrated Data" tab for actual cat facts
   - Should see the raw fact text and length numbers

### **Scenario 3: Dashboard Widgets**
1. **Create Widget:**
   - Go to "Dashboard Widgets" tab
   - Click "Add Widget"
   - Configure widget with your data source
   - Save widget

2. **Test Widget:**
   - Widget should display data from your integrated source
   - Check for proper formatting and display

## 🚨 Common Issues & Solutions

### **Issue: "fact (string), length (number)" instead of raw data**
**Solution:** This is CORRECT behavior! You're seeing the field schema, not an error.
- The Integration Engine detected the API structure
- Raw data appears in the "Integrated Data" tab after syncing
- Use "Field Mapping" to map these fields to your system

### **Issue: "Authentication required"**
**Solution:** This is correct behavior! The API properly requires authentication.

### **Issue: Empty responses `[]`**
**Solution:** Normal for new installation. Add data sources to see data.

### **Issue: Cannot GET /api/data-sources/1/test**
**Solution:** Use POST request, not GET. The test endpoint requires POST method.

### **Issue: CORS errors**
**Solution:** Make sure you're accessing via `http://localhost:5000`, not a different port.

### **Issue: 500 Internal Server Error**
**Solution:** Check server logs in terminal for detailed error messages.

## 📊 Expected API Responses

### **Cat Fact API Raw Response:**
```json
{
  "fact": "Milk can give some cats diarrhea.",
  "length": 33
}
```

### **Integration Engine Schema Detection:**
```json
{
  "fields": [
    {
      "name": "fact",
      "type": "string",
      "sample": "Milk can give some cats diarrhea."
    },
    {
      "name": "length", 
      "type": "number",
      "sample": 33
    }
  ]
}
```

### **Successful Data Source Creation:**
```json
{
  "id": 1,
  "name": "Cat Facts API",
  "description": "Random cat facts for testing",
  "apiEndpoint": "https://catfact.ninja/fact",
  "authType": "none",
  "isActive": true,
  "createdAt": "2025-05-29T23:43:00.000Z"
}
```

### **Successful Connection Test:**
```json
{
  "success": true,
  "sampleData": {
    "fact": "At 4 weeks, it is important to play with kittens so that they do not develope a fear of people.",
    "length": 95
  }
}
```

### **Authentication Error (Expected):**
```json
{
  "message": "Authentication required"
}
```

## 🎯 Quick Test Commands

```bash
# Test if server is running
curl -I http://localhost:5000

# Test API authentication (should fail)
curl http://localhost:5000/api/data-sources

# Check server logs
# Look at your terminal where you ran `npm run dev`
```

## ✅ Success Indicators

Your API is working correctly if you see:
1. ✅ Login/logout works in browser
2. ✅ Navigation between pages loads data
3. ✅ Integration Engine page loads without errors
4. ✅ API calls show in Network tab with proper status codes
5. ✅ Server logs show successful authentication and API calls
6. ✅ **Cat Fact API shows "fact (string), length (number)" - this is correct schema detection!**

---

**Current Status:** 🟢 **API is working correctly!** 
All core endpoints are responding and authentication is functioning properly.

**Cat Fact API Status:** 🐱 **Successfully integrated and tested!**
Your Integration Engine correctly detected the API schema and is ready for field mapping. 