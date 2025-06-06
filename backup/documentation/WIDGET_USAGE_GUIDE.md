# Widget Usage Guide - MSSP Client Manager

## Overview
You've successfully created a widget! This guide explains how to use and display your widgets on the dashboard, including how to edit and delete them.

## 🎯 What Are Widgets?
Widgets are reusable dashboard components that display data from your integrated external sources. They automatically appear on your main dashboard and can show data in different formats:

- **Metric**: Single value with trend indicators
- **Chart**: Bar chart visualization 
- **Table**: Tabular data display
- **List**: List of items with badges

## 🚀 How to Use Your Widgets

### Step 1: Access Your Dashboard
1. Open your browser and go to `http://localhost:5000`
2. Login with your credentials (username: `yaser`, password: `yaser`)
3. You'll see the main dashboard

### Step 2: View Your Widgets
Your created widgets will appear in two places:
1. **Main Dashboard**: In the "Integration Widgets" section
2. **Integration Engine**: In the "Dashboard Widgets" tab

### Step 3: Manage Your Widgets
In the Integration Engine page (`http://localhost:5000/integration-engine`):

#### ✅ **NEW: Edit Widgets**
- Click the **Edit** button (pencil icon) next to any widget
- Modify the widget name, description, type, or configuration
- Click "Update Widget" to save changes
- The widget will be updated across all dashboards

#### ✅ **NEW: Delete Widgets**
- Click the **Delete** button (trash icon) next to any widget
- Confirm the deletion when prompted
- The widget will be removed from all dashboards

#### Create New Widgets
- Click "Create Widget" button
- Choose widget type (Chart, Table, Metric, List)
- Select a data source
- Configure the widget settings
- Click "Create Widget"

## 🔧 Widget Configuration

### Table Widgets
**Fixed Issue**: "No columns configured" error
- Use the **Quick Setup** buttons for instant configuration:
  - "Use Cat Facts Columns" - For Cat Facts API data
  - "Use Generic Columns" - For general data
- Or manually configure columns in JSON format

### Example Table Configuration:
```json
[
  {"field": "fact", "label": "Cat Fact", "type": "string"},
  {"field": "length", "label": "Length", "type": "number"}
]
```

## 🐛 Troubleshooting

### "No columns configured" Error
**Solution**: 
1. Edit the widget using the Edit button
2. Click "Use Cat Facts Columns" for quick setup
3. Or manually add column configuration
4. Save the widget

### Widget Not Displaying Data
**Check**:
1. Data source has synced data
2. Field mappings are configured
3. Widget configuration matches your data structure

### Empty Widget Data
**Solution**:
1. Go to Integration Engine → Field Mapping tab
2. Create field mappings for your data source
3. Sync the data source
4. Refresh your dashboard

## 🎉 Success! 

Your widgets now have full **CRUD** functionality:
- ✅ **Create** - Add new widgets
- ✅ **Read** - View widgets on dashboard
- ✅ **Update** - Edit existing widgets  
- ✅ **Delete** - Remove unwanted widgets

## 📊 Widget Types Explained

### 1. **Metric Widget**
- Shows a single numerical value
- Configure: `valueField` and `label`
- Example: Total number of cat facts

### 2. **Table Widget** 
- Displays data in rows and columns
- Configure: `columns` array with field mappings
- Example: List of cat facts with lengths

### 3. **Chart Widget**
- Bar chart visualization
- Configure: `xField` and `yField`
- Example: Fact length distribution

### 4. **List Widget**
- Shows items as a list with badges
- Configure: `titleField`, `subtitleField`, `badgeField`
- Example: Cat facts with categories

## 🚀 Next Steps

1. **Create Multiple Widgets**: Try different widget types for the same data
2. **Configure Data Sources**: Add more external APIs
3. **Set Up Field Mappings**: Map API fields to your database
4. **Build Dashboards**: Combine widgets for comprehensive views

## 🔗 Related Files

- **Integration Engine**: `/integration-engine` - Main configuration page
- **Dashboard**: `/` - View your widgets in action
- **API Testing**: Use the scripts in `/scripts/` folder for testing

---

**🎯 Pro Tip**: Use the debug information (visible in development mode) to troubleshoot widget configuration issues! 