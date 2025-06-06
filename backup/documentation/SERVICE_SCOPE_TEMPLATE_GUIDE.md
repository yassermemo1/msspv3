# 🎯 Service Scope Definition Template - User Guide

## 🚀 Quick Start Guide

### **Step 1: Access the Application**
1. Open your browser and go to: **http://localhost:5173**
2. Login with admin credentials:
   - **Email:** `admin@mssp.local`
   - **Password:** `admin123`

### **Step 2: Navigate to Service Management**
1. Click on **"Admin"** in the top navigation
2. Select **"Services"** from the dropdown menu
3. You'll see the Service Catalog page with all existing services

### **Step 3: Access the Scope Template Builder**

#### **Option A: Edit Existing Service**
1. Find any service in the list (e.g., "Managed EDR Service")
2. Click the **"Edit"** button next to the service
3. In the service edit dialog, click on the **"Scope Template"** tab

#### **Option B: Create New Service First**
1. Click **"New Service"** button
2. Fill in basic service information:
   - **Name:** e.g., "Advanced Threat Detection"
   - **Category:** e.g., "Security"
   - **Description:** Brief description
   - **Delivery Model:** e.g., "Managed", "On-Premise", "Hybrid"
   - **Base Price:** e.g., 100.00
   - **Pricing Unit:** e.g., "per endpoint"
3. Save the service
4. Then edit it and go to "Scope Template" tab

## 🛠️ Using the Scope Template Builder

### **The Template Builder Interface**

When you're in the Scope Template tab, you'll see:

1. **Field List Table** - Shows all defined fields
2. **Add Field Button** - Creates new field definitions
3. **Preview Toggle** - Shows how the form will look to end users
4. **Save Template Button** - Saves your template

### **Adding Fields to Your Template**

Click **"Add Field"** to open the field configuration modal:

#### **Basic Field Properties:**
- **Field Name:** Internal identifier (e.g., `endpoint_count`)
- **Field Label:** User-friendly name (e.g., "Number of Endpoints")
- **Field Type:** Choose from 8 available types
- **Required:** Toggle if field is mandatory
- **Display Order:** Controls field sequence

#### **Field Types Available:**

1. **TEXT_SINGLE_LINE**
   - For: Names, emails, short descriptions
   - Options: Placeholder text, help text

2. **TEXT_MULTI_LINE**
   - For: Comments, detailed requirements
   - Options: Placeholder text, help text

3. **NUMBER_INTEGER**
   - For: Counts, quantities, IDs
   - Options: Min/max values, default value

4. **NUMBER_DECIMAL**
   - For: Prices, percentages, measurements
   - Options: Min/max values, default value

5. **BOOLEAN**
   - For: Yes/No questions, feature toggles
   - Options: Default value, custom labels

6. **DATE**
   - For: Deadlines, start dates, schedules
   - Options: Help text for date format

7. **SELECT_SINGLE_DROPDOWN**
   - For: Platform choice, vendor selection
   - Options: Dropdown options list

8. **SELECT_MULTI_CHECKBOX**
   - For: Multiple platform types, feature sets
   - Options: Checkbox options list

### **Example: Creating an EDR Service Template**

Here's a complete example for a Managed EDR service:

```
Field 1:
- Name: endpoint_count
- Label: "Number of Endpoints"
- Type: NUMBER_INTEGER
- Required: Yes
- Min: 1, Max: 10000
- Help: "Total endpoints to monitor"

Field 2:
- Name: platform_types
- Label: "Platform Types"
- Type: SELECT_MULTI_CHECKBOX
- Required: Yes
- Options: ["Windows", "macOS", "Linux", "Mobile"]
- Help: "Select all platform types"

Field 3:
- Name: edr_solution
- Label: "Preferred EDR Solution"
- Type: SELECT_SINGLE_DROPDOWN
- Required: Yes
- Options: ["CrowdStrike", "Defender", "SentinelOne"]

Field 4:
- Name: deployment_date
- Label: "Target Deployment Date"
- Type: DATE
- Required: Yes
- Help: "When should deployment begin?"
```

## 🎯 How Templates Work

### **The Workflow:**
1. **Admin defines template** → Creates field definitions for a service
2. **Template gets saved** → Stored as JSON in the database
3. **Used in contracts** → When adding service to client contracts
4. **Dynamic forms** → Template generates actual forms for scope definition

### **Where Templates Are Used:**
- **Contract Management:** When adding services to client contracts
- **Proposal Generation:** For creating service proposals
- **Scope Documentation:** For standardizing service definitions

## 🔧 Common Use Cases

### **1. Security Services:**
- Endpoint counts
- Platform types
- Security tools preferences
- Compliance requirements

### **2. Network Services:**
- Bandwidth requirements
- Location specifications
- Equipment preferences
- SLA levels

### **3. Monitoring Services:**
- Data retention periods
- Alert escalation preferences
- Dashboard requirements
- Integration needs

## 🚨 Troubleshooting

### **If you get 404 errors:**
1. Make sure you're at: http://localhost:5173
2. Check that both servers are running:
   - Backend: http://localhost:5001/api/health
   - Frontend: http://localhost:5173

### **If login fails:**
- Use: `admin@mssp.local` / `admin123`
- Clear browser cookies if needed

### **If scope template tab is missing:**
- Make sure you're editing a service (not viewing)
- Check that you have admin privileges

### **If template doesn't save:**
- Ensure all required fields are filled
- Check browser console for errors
- Verify backend is responding

## 🎉 Success Indicators

You know it's working when:
- ✅ You can see the "Scope Template" tab in service edit mode
- ✅ You can add fields and see them in the table
- ✅ Preview mode shows how forms will appear
- ✅ Template saves successfully with confirmation
- ✅ Saved templates appear in service listings

## 📞 Next Steps

After creating templates:
1. Test the template by adding the service to a contract
2. Verify dynamic forms are generated correctly
3. Collect feedback from team members using the forms
4. Refine templates based on real-world usage

---

**Need Help?** Check the browser console (F12) for any error messages and ensure both servers are running properly. 