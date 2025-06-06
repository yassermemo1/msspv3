import { db } from './server/db.js';
import { clients } from './shared/schema.js';

async function createSampleData() {
  try {
    const result = await db.insert(clients).values({
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      phone: '+1-555-0123',
      address: '123 Business St, New York, NY 10001',
      contactPersonName: 'John Smith',
      contactPersonEmail: 'john.smith@acme.com',
      contactPersonPhone: '+1-555-0124',
      notes: 'Primary enterprise client',
      status: 'active',
      billingContactName: 'Jane Doe',
      billingContactEmail: 'billing@acme.com',
      billingContactPhone: '+1-555-0125'
    }).returning();
    
    console.log('✅ Created sample client:', result[0].name);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
    process.exit(1);
  }
}

createSampleData(); 