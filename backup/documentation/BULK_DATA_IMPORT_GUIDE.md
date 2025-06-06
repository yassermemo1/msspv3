# MSSP Client Manager - Bulk Data Import Guide

This guide explains how to use the comprehensive bulk data import system for the MSSP Client Manager application.

## 📁 CSV File Structure

The sample data is organized into 11 CSV files, each representing a major entity in the system:

### 1. Users (`01-users.csv`)
**Team members and system users**
```csv
username,email,firstName,lastName,role,isActive,password
```
- **Required**: username, email, firstName, lastName, role, isActive, password
- **Roles**: admin, manager, engineer, analyst
- **Dependencies**: None (import first)

### 2. Clients (`02-clients.csv`)
**Client companies and their contact information**
```csv
name,industry,companySize,status,source,address,website,notes,contactName,contactEmail,contactPhone,contactTitle
```
- **Required**: name, contactEmail
- **Status**: active, prospect, inactive
- **Dependencies**: None

### 3. Services (`03-services.csv`)
**Service offerings and their pricing**
```csv
name,category,description,deliveryModel,basePrice,pricingUnit,isActive
```
- **Required**: name, basePrice, pricingUnit
- **Delivery Models**: Serverless, On-Prem Engineer, Hybrid
- **Dependencies**: None

### 4. Contracts (`04-contracts.csv`)
**Client contracts and agreements**
```csv
clientName,name,startDate,endDate,status,notes,autoRenewal,renewalTerms,totalValue,documentUrl
```
- **Required**: clientName, name, startDate, status, totalValue
- **Status**: active, pending, expired, cancelled
- **Dependencies**: Clients must exist first

### 5. License Pools (`05-license-pools.csv`)
**Shared license pools for resource allocation**
```csv
name,vendor,productName,licenseType,totalLicenses,availableLicenses,orderedLicenses,costPerLicense,renewalDate,purchaseRequestNumber,purchaseOrderNumber,notes,isActive
```
- **Required**: name, vendor, productName, totalLicenses, costPerLicense
- **Dependencies**: None

### 6. Hardware Assets (`06-hardware-assets.csv`)
**Physical hardware inventory**
```csv
name,category,manufacturer,model,serialNumber,purchaseDate,purchaseCost,warrantyExpiry,status,location,notes
```
- **Required**: name, serialNumber, status
- **Status**: active, maintenance, retired, disposed
- **Dependencies**: None

### 7. Individual Licenses (`07-individual-licenses.csv`)
**Client-specific license assignments**
```csv
clientName,name,vendor,productName,licenseKey,licenseType,quantity,costPerLicense,purchaseDate,expiryDate,renewalDate,purchaseRequestNumber,purchaseOrderNumber,documentUrl,status,notes
```
- **Required**: clientName, name, vendor, licenseKey
- **Dependencies**: Clients must exist first

### 8. Service Authorization Forms (`08-service-authorization-forms.csv`)
**Work authorization and project scope documents**
```csv
clientName,contractName,safNumber,title,description,startDate,endDate,status,documentUrl,approvedBy,approvedDate,value,notes
```
- **Required**: clientName, contractName, safNumber, title
- **Status**: approved, pending, completed, cancelled
- **Dependencies**: Clients and Contracts must exist first

### 9. Certificates of Compliance (`09-certificates-of-compliance.csv`)
**Compliance certifications and audit results**
```csv
clientName,contractName,safNumber,cocNumber,title,description,complianceType,issueDate,expiryDate,status,documentUrl,issuedBy,auditDate,nextAuditDate,notes
```
- **Required**: clientName, cocNumber, title, status
- **Status**: valid, pending, expired, revoked
- **Dependencies**: Clients, Contracts, and SAFs must exist first

### 10. Documents (`10-documents.csv`)
**Document repository with metadata**
```csv
name,description,fileName,documentType,clientName,contractName,uploadedBy,tags,expirationDate,complianceType
```
- **Required**: name, fileName, documentType, clientName
- **Document Types**: technical_documentation, policy_document, compliance_report, assessment_report, training_material
- **Dependencies**: Clients and Users must exist first

### 11. Financial Transactions (`11-financial-transactions.csv`)
**Financial records and billing information**
```csv
type,amount,description,status,clientName,contractName,transactionDate,category,reference,notes
```
- **Required**: type, amount, description, status, transactionDate
- **Types**: invoice, payment, expense, refund
- **Dependencies**: Clients and Contracts (optional)

## 🚀 Import Process

### Prerequisites
1. Ensure PostgreSQL database is running
2. Database schema is properly created
3. Node.js dependencies are installed:
   ```bash
   npm install pg bcryptjs uuid
   ```

### Quick Import
Run the comprehensive import script:
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/mssp_client_management node import-sample-data.cjs
```

### Manual Import Steps
If you prefer to import specific entities:

1. **Import Users First** (required for document uploads and COC issuance)
2. **Import Clients** (required for all client-related entities)
3. **Import Services** (optional, for service catalog)
4. **Import Contracts** (requires clients)
5. **Import License Pools** (optional, for license management)
6. **Import Hardware Assets** (optional, for asset tracking)
7. **Import Individual Licenses** (requires clients)
8. **Import Service Authorization Forms** (requires clients and contracts)
9. **Import Certificates of Compliance** (requires clients, contracts, SAFs, and users)
10. **Import Documents** (requires clients and users)
11. **Import Financial Transactions** (requires clients, optional contracts)

## 📊 Sample Data Overview

The provided sample data includes:

- **10 Users**: Mix of admins, managers, engineers, and analysts
- **15 Clients**: Diverse industries (Healthcare, Finance, Technology, etc.)
- **15 Services**: Common MSSP offerings with realistic pricing
- **10 Contracts**: Multi-year agreements with various terms
- **10 License Pools**: Popular security tools and platforms
- **15 Hardware Assets**: Security appliances and infrastructure
- **10 Individual Licenses**: Client-specific license assignments
- **10 SAFs**: Work authorizations across different projects
- **10 COCs**: Compliance certifications for various standards
- **15 Documents**: Technical docs, policies, and reports
- **20 Financial Transactions**: Mix of invoices, payments, and expenses

## 🔧 Customization

### Adding Your Own Data
1. Copy any CSV file from `sample-data/` directory
2. Modify the data to match your requirements
3. Ensure required fields are populated
4. Maintain proper relationships (e.g., clientName must match existing clients)
5. Run the import script

### Field Guidelines

#### Date Formats
Use ISO 8601 format: `YYYY-MM-DD`
```csv
startDate,endDate
2024-01-01,2024-12-31
```

#### Boolean Values
Use lowercase strings:
```csv
isActive,autoRenewal
true,false
```

#### Monetary Values
Use decimal format without currency symbols:
```csv
amount,totalValue
15000.00,120000.00
```

#### Relationships
Use exact names to establish relationships:
```csv
clientName,contractName
TechCorp Solutions,Annual Security Services Contract
```

## 🛠️ Troubleshooting

### Common Import Errors

1. **"Client not found"**
   - Ensure clients are imported before contracts, licenses, etc.
   - Check exact spelling of client names

2. **"User not found"**
   - Import users before documents or COCs
   - Verify email addresses match exactly

3. **"Duplicate key violation"**
   - Data already exists in database
   - Script uses UPSERT (INSERT...ON CONFLICT) to handle duplicates

4. **"null value in column violates not-null constraint"**
   - Required field is missing or empty
   - Check CSV file for missing values in required columns

### Data Validation
The import script includes validation for:
- Required fields
- Data type conversions
- Relationship integrity
- Duplicate handling

## 📈 Performance Tips

1. **Large Datasets**: Import in batches for very large files
2. **Relationships**: Import parent entities before children
3. **Monitoring**: Watch console output for errors and warnings
4. **Backup**: Always backup your database before importing

## 🔄 Re-running Imports

The import script is designed to be idempotent:
- Uses `ON CONFLICT` clauses to handle duplicates
- Updates existing records with new data
- Safe to run multiple times

## 🎯 Next Steps

After importing sample data:

1. **Verify Import**: Check the application dashboard for populated data
2. **Test Features**: Try searching, filtering, and reporting functions
3. **Customize**: Modify sample data to match your business needs
4. **Production**: Create your own CSV files for production deployment

## 📞 Support

For issues with the import process:
1. Check the console output for specific error messages
2. Verify database connectivity and permissions
3. Ensure all CSV files are properly formatted
4. Review the sample data for proper relationship structures

The bulk import system provides a fast way to populate your MSSP Client Manager with realistic, comprehensive data for testing and production use. 