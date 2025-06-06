# Production Data Migration Guide 📊

This guide provides the **safest and easiest methods** to migrate client data to production, including bulk assignments of license pools and hardware assets.

## 🚀 Available Migration Methods

### 1. **Web UI Bulk Import (Recommended for Production)** ⭐
**Safest and most user-friendly method**

#### Features:
- **Real-time validation** with instant error feedback
- **Preview functionality** to review data before import
- **Progress tracking** with detailed status updates
- **Rollback capability** if errors occur
- **Comprehensive import** of clients + related data in one file

#### Access:
```
http://your-domain.com/bulk-import
http://your-domain.com/comprehensive-bulk-import
```

#### Supported Data Types:
- ✅ **Clients** (with contact information)
- ✅ **Contracts** (linked to clients)
- ✅ **Services** (service catalog)
- ✅ **Hardware Assets** (with client assignments)
- ✅ **License Pools** and **Client Licenses**
- ✅ **Service Authorization Forms (SAFs)**
- ✅ **Certificates of Compliance (COCs)**

---

### 2. **Direct Database Scripts** 💾
**For advanced users with database access**

#### Existing Scripts:
```bash
# Simple client insertion (like previously used)
node bulk-insert-clients.cjs

# SIEM EPS license assignment (like previously used)  
node assign-siem-eps-licenses.cjs

# Comprehensive data import with relationships
node backup/setup-scripts/import-sample-data.cjs
```

---

### 3. **API Endpoints** 🔗
**For programmatic integration**

#### Bulk Import API:
```bash
POST /api/bulk-import
POST /api/bulk-import/comprehensive
POST /api/bulk-import/detect-columns
```

---

## 📋 Step-by-Step Production Migration

### Method 1: Web UI Comprehensive Import (RECOMMENDED)

#### Step 1: Prepare Your Data
Create a single CSV file with all your client data:

```csv
clientName,industry,companySize,contactEmail,contactPhone,contactName,contactTitle,address,website,notes,contractName,contractValue,contractStartDate,contractEndDate,contractStatus,serviceName,serviceCategory,assetName,assetCategory,licenseName,licenseVendor,licenseQuantity,safNumber,safTitle,cocNumber,cocTitle,source,shortName,domain
"Customer Apps","Technology","Large","contact@customerapps.com","+966-11-xxx-xxxx","John Smith","CTO","Riyadh, Saudi Arabia","https://customerapps.com","Technology client","Annual Support Contract","150000.00","2024-01-01","2024-12-31","active","24/7 Support","Support Services","Dell Server R740","Server Hardware","Microsoft Office 365","Microsoft","50","SAF-2024-001","Support Authorization","COC-2024-001","Security Compliance","nca","Customer Apps","C003"
"Saudi Information Technology Company","Technology","Large","contact@site.sa","+966-11-xxx-xxxx","Ahmed Ali","IT Manager","Riyadh, Saudi Arabia","https://site.sa","Government entity","IT Services Contract","200000.00","2024-01-01","2024-12-31","active","SOC Monitoring","Security Operations","Firewall Fortinet","Network Security","Windows Server 2022","Microsoft","10","SAF-2024-002","SOC Authorization","COC-2024-002","SOC2 Compliance","direct","SITE","C004"
```

#### Step 2: Access Bulk Import
1. Navigate to: `http://your-domain.com/comprehensive-bulk-import`
2. Login with admin credentials
3. Select "Comprehensive Clients" import type

#### Step 3: Upload and Preview
1. Upload your CSV file
2. Review **automatic column detection**
3. Verify **data preview** (first 3 rows)
4. Adjust field mappings if needed

#### Step 4: Execute Import
1. Click "Import" button
2. Monitor **real-time progress**
3. Review **detailed results**

#### Step 5: Verify Results
1. Check clients page: `/clients`
2. Verify license assignments: `/license-pools`
3. Check hardware assets: `/hardware-assets`

---

### Method 2: Database Script Migration

#### Step 1: Create Migration Script
```javascript
// production-migration.cjs
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://mssp_user:devpass123@localhost:5432/mssp_production'
});

const clientsData = [
  { domain: 'C003', shortName: 'Customer Apps', name: 'Customer Apps', source: 'nca' },
  { domain: 'C004', shortName: 'SITE', name: 'Saudi Information Technology Company', source: 'direct' },
  // ... your client data
];

async function migrateData() {
  await client.connect();
  
  try {
    await client.query('BEGIN');
    
    // Insert clients
    for (const clientData of clientsData) {
      const result = await client.query(`
        INSERT INTO clients (name, short_name, domain, status, source, created_at, updated_at) 
        VALUES ($1, $2, $3, 'active', $4, NOW(), NOW()) 
        ON CONFLICT (name) DO UPDATE SET 
          short_name = EXCLUDED.short_name,
          domain = EXCLUDED.domain,
          source = EXCLUDED.source,
          updated_at = NOW()
        RETURNING id
      `, [clientData.name, clientData.shortName, clientData.domain, clientData.source]);
      
      console.log(`✅ Client: ${clientData.name}`);
    }
    
    await client.query('COMMIT');
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
  } finally {
    await client.end();
  }
}

migrateData();
```

#### Step 2: Run Migration
```bash
DATABASE_URL="postgresql://mssp_user:devpass123@localhost:5432/mssp_production" node production-migration.cjs
```

---

## 🔧 Advanced Features

### License Pool Assignment
```csv
clientName,poolName,assignedLicenses
"Customer Apps","SIEM EPS Pool","5000"
"SITE","SIEM EPS Pool","10000"
"Red Sea Development","SIEM EPS Pool","7500"
```

### Hardware Asset Assignment
```csv
clientName,assetName,category,manufacturer,model,serialNumber,status
"Customer Apps","Firewall Primary","Network Security","Fortinet","FortiGate 600E","FG600E-001","active"
"SITE","SOC Server","Server Hardware","Dell","PowerEdge R740","DELL-R740-001","active"
```

### Bulk Operations
- **Bulk License Assignment**: Assign multiple licenses to multiple clients
- **Bulk Hardware Deployment**: Deploy assets to multiple clients
- **Bulk Status Updates**: Update client statuses in bulk
- **Bulk Contract Creation**: Create contracts for multiple clients

---

## 🛡️ Safety Features

### Data Validation
- ✅ **Schema validation** for all fields
- ✅ **Relationship integrity** checks
- ✅ **Duplicate detection** and handling
- ✅ **Data type verification**

### Error Handling
- ✅ **Row-level error reporting**
- ✅ **Partial import support** (good records saved, bad records reported)
- ✅ **Detailed error messages** with fix suggestions
- ✅ **Transaction rollback** on critical errors

### Backup & Recovery
- ✅ **Automatic audit logging** of all imports
- ✅ **Data backup recommendations** before import
- ✅ **Import history tracking**
- ✅ **Change audit trail**

---

## 📊 CSV Templates & Examples

### Download Ready-to-Use Templates
The system provides templates for:
1. **Comprehensive Clients** - All data in one file
2. **Standard Clients** - Basic client information
3. **Contracts** - Client agreements
4. **Hardware Assets** - Asset inventory
5. **License Assignments** - Software licenses
6. **Service Authorization Forms** - SAFs
7. **Compliance Certificates** - COCs

### Template Access:
```
GET /api/bulk-import/templates/{type}
```

Or download directly from the UI bulk import pages.

---

## 🚀 Production Deployment Checklist

### Pre-Migration
- [ ] **Database backup** created
- [ ] **Test environment** validated with sample data
- [ ] **CSV files** prepared and validated
- [ ] **User permissions** verified (admin access required)
- [ ] **Server resources** checked (disk space, memory)

### During Migration
- [ ] **Monitor progress** in real-time
- [ ] **Review error reports** immediately
- [ ] **Verify key relationships** (clients → contracts → licenses)
- [ ] **Check license pool availability** before assignment

### Post-Migration
- [ ] **Verify data integrity** in UI
- [ ] **Test client details pages**
- [ ] **Confirm license assignments**
- [ ] **Validate hardware asset assignments**
- [ ] **Review audit logs**

---

## 🔗 API Reference

### Bulk Import Endpoints
```bash
# Detect CSV columns
POST /api/bulk-import/detect-columns
Content-Type: multipart/form-data
Body: file (CSV)

# Standard bulk import
POST /api/bulk-import
Content-Type: multipart/form-data
Body: file (CSV), type (string)

# Comprehensive import (recommended)
POST /api/bulk-import/comprehensive
Content-Type: multipart/form-data
Body: file (CSV), fieldMappings (JSON, optional)
```

### Response Format
```json
{
  "success": true,
  "recordsProcessed": 100,
  "recordsSuccessful": 98,
  "recordsFailed": 2,
  "details": {
    "clients": { "created": 98, "updated": 0 },
    "contracts": { "created": 45, "updated": 0 },
    "licenses": { "created": 150, "updated": 0 },
    "assets": { "created": 75, "updated": 0 }
  },
  "errors": [
    { "row": 15, "error": "Invalid email format", "data": "..." },
    { "row": 23, "error": "Missing required field: contactEmail", "data": "..." }
  ]
}
```

---

## 🎯 Recommendations

### For Production Migration:
1. **Use Web UI Comprehensive Import** - Safest with best error handling
2. **Start with small batches** (10-20 records) to test
3. **Always backup database** before large imports
4. **Use staging environment** to test first
5. **Monitor server resources** during import

### For Large Datasets (1000+ records):
1. **Split into smaller files** (100-500 records each)
2. **Import in order**: Clients → Services → Contracts → Assets → Licenses
3. **Use comprehensive import** for related data
4. **Monitor progress** and pause if needed

### For License Pool Management:
1. **Create license pools first** via UI or API
2. **Verify available licenses** before assignment
3. **Use bulk assignment** for efficiency
4. **Track license usage** with reports

---

## 📞 Support & Troubleshooting

### Common Issues:
1. **CSV format errors** - Use provided templates
2. **Duplicate client names** - System handles with update strategy
3. **License pool exhaustion** - Check available licenses first
4. **Large file timeouts** - Split into smaller batches

### Getting Help:
- Check application logs in production
- Review audit logs for import history
- Use error reports for specific field issues
- Test in staging environment first

---

## ✅ Success Metrics

After successful migration, you should see:
- ✅ All clients visible in `/clients` page
- ✅ Proper license assignments in `/license-pools`
- ✅ Hardware assets assigned in `/hardware-assets`
- ✅ Audit trail in system logs
- ✅ No orphaned records or broken relationships

**The Web UI Comprehensive Import is recommended for production use due to its safety features, real-time validation, and comprehensive error handling.** 