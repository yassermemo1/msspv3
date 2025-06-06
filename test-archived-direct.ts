#!/usr/bin/env tsx

import { storage } from './server/storage';

async function testArchivedClients() {
  try {
    console.log('🧪 Testing getArchivedClients() directly...');
    
    const archivedClients = await storage.getArchivedClients();
    console.log('✅ Success! Found', archivedClients.length, 'archived clients');
    
    if (archivedClients.length > 0) {
      console.log('📋 Archived clients:');
      archivedClients.forEach(client => {
        console.log(`  - ID: ${client.id}, Name: ${client.name}, Status: ${client.status}, Deleted: ${client.deletedAt}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
  
  process.exit(0);
}

testArchivedClients(); 