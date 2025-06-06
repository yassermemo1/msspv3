# Field Mapping Guide - Integration Engine

## 🗺️ **What are Field Mappings?**

Field Mappings transform data from external APIs into your internal database structure. They define how source fields map to target columns.

## 🎯 **Cat Facts API Example**

### **Source Data (from API):**
```json
{
  "fact": "A cat has 230 bones in its body. A human has 206.",
  "length": 130
}
```

### **Target Data (in your database):**
```json
{
  "description": "A cat has 230 bones in its body. A human has 206.",
  "content_length": 130,
  "category": "animal_facts",
  "source": "catfact.ninja"
}
```

## 📋 **How to Add Field Mappings**

### **Method 1: Using the UI (Interactive)**

1. **Navigate to Integration Engine**
   - Click "Integration Engine" in sidebar
   - Go to "Field Mapping" tab

2. **Select Data Source**
   - Click "Configure" on your Cat Facts data source
   - This loads the mapping interface

3. **Test Connection First**
   - Click "Test" button to fetch sample data
   - You'll see the tree view with actual values

4. **Create Mappings Interactively**
   - **Click on "fact"** in the tree view
   - This auto-fills the "Source Field" as "fact"
   - Click "Add Mapping" button
   - Fill in the form:

### **Mapping Form Fields:**

| Field | Example Value | Description |
|-------|---------------|-------------|
| **Source Field** | `fact` | Field name from API response |
| **Target Field** | `description` | Your database column name |
| **Field Type** | `string` | Data type validation |
| **Required** | `true` | Whether field is mandatory |
| **Default Value** | `"No fact available"` | Fallback if source is missing |

### **Method 2: API Calls (Programmatic)**

```bash
# Create mapping for 'fact' field
curl -X POST http://localhost:5000/api/data-sources/1/mappings \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -d '{
    "sourceField": "fact",
    "targetField": "description", 
    "fieldType": "string",
    "isRequired": true,
    "defaultValue": "No fact available"
  }'

# Create mapping for 'length' field  
curl -X POST http://localhost:5000/api/data-sources/1/mappings \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -d '{
    "sourceField": "length",
    "targetField": "content_length",
    "fieldType": "number", 
    "isRequired": false,
    "defaultValue": "0"
  }'
```

## 🔧 **Advanced Mapping Examples**

### **1. Static Value Mapping**
Add fields that don't exist in source data:

```json
{
  "sourceField": "static_category",
  "targetField": "category",
  "fieldType": "string",
  "isRequired": true,
  "defaultValue": "animal_facts"
}
```

### **2. Nested Field Mapping**
For complex JSON structures:

```json
{
  "sourceField": "user.profile.email",
  "targetField": "email_address",
  "fieldType": "string",
  "isRequired": true
}
```

### **3. Type Conversion Mapping**
Convert string to number:

```json
{
  "sourceField": "price",
  "targetField": "cost",
  "fieldType": "number",
  "isRequired": false,
  "defaultValue": "0"
}
```

## 📊 **Field Types Available**

| Type | Description | Example |
|------|-------------|---------|
| `string` | Text data | `"Hello World"` |
| `number` | Numeric data | `42`, `3.14` |
| `boolean` | True/false | `true`, `false` |
| `date` | Date/time | `"2025-05-29T23:48:22.000Z"` |
| `json` | Complex objects | `{"key": "value"}` |

## 🎯 **Complete Cat Facts Mapping Setup**

### **Step-by-Step Process:**

1. **Create Data Source** (if not done):
   ```json
   {
     "name": "Cat Facts API",
     "description": "Random cat facts for testing",
     "apiEndpoint": "https://catfact.ninja/fact",
     "authType": "none",
     "syncFrequency": "manual"
   }
   ```

2. **Test Connection**:
   - Click "Test" button
   - Verify you see: `fact (string)` and `length (number)`

3. **Create Field Mappings**:

   **Mapping 1: Fact Content**
   - Source Field: `fact`
   - Target Field: `description`
   - Field Type: `string`
   - Required: `true`
   - Default Value: `"No fact available"`

   **Mapping 2: Content Length**
   - Source Field: `length`
   - Target Field: `content_length`
   - Field Type: `number`
   - Required: `false`
   - Default Value: `0`

   **Mapping 3: Static Category**
   - Source Field: `category` (doesn't exist in source)
   - Target Field: `category`
   - Field Type: `string`
   - Required: `true`
   - Default Value: `"animal_facts"`

4. **Sync Data**:
   - Click "Sync Data" button
   - Check "Integrated Data" tab to see results

## 🔍 **Viewing Mapped Data**

After syncing, go to **"Integrated Data"** tab to see:

```json
{
  "id": 1,
  "recordIdentifier": "fact_1",
  "syncedAt": "2025-05-29T23:48:44.000Z",
  "rawData": {
    "fact": "A cat has 230 bones in its body.",
    "length": 130
  },
  "mappedData": {
    "description": "A cat has 230 bones in its body.",
    "content_length": 130,
    "category": "animal_facts"
  }
}
```

## 🚨 **Common Issues & Solutions**

### **Issue: "Source field not found"**
**Solution:** Check the exact field name in Raw JSON view. Case-sensitive!

### **Issue: "Type conversion failed"**
**Solution:** Verify the source data type matches your field type setting.

### **Issue: "Required field missing"**
**Solution:** Either make field optional or provide a default value.

### **Issue: "Mapping not applied"**
**Solution:** Re-sync data after creating mappings. Old data won't be updated automatically.

## 🎯 **Best Practices**

1. **Always test connection first** to see actual data structure
2. **Use descriptive target field names** (`email_address` not `email`)
3. **Set appropriate default values** for optional fields
4. **Use correct field types** to prevent data corruption
5. **Make critical fields required** to ensure data quality

## 📈 **Advanced Features**

### **Transformation Functions** (Future Enhancement)
```json
{
  "sourceField": "created_at",
  "targetField": "creation_date",
  "fieldType": "date",
  "transformation": "parseISO"
}
```

### **Conditional Mappings** (Future Enhancement)
```json
{
  "sourceField": "status",
  "targetField": "is_active",
  "fieldType": "boolean",
  "transformation": "status === 'active'"
}
```

---

**Your Integration Engine is now ready to transform any API data into your desired format!** 🚀 