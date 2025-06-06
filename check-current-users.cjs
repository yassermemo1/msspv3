#!/usr/bin/env node

const { Client } = require('pg');

// Load environment variables
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function checkCurrentUsers() {
  try {
    await client.connect();
    console.log('🔍 Checking current users in database...\n');

    const result = await client.query(`
      SELECT 
        id,
        username,
        email,
        first_name,
        last_name,
        role,
        auth_provider,
        is_active,
        created_at
      FROM users 
      ORDER BY role, email
    `);

    if (result.rows.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    console.log(`✅ Found ${result.rows.length} users:\n`);
    console.log('ID  | Email              | Username    | Role     | Provider | Active | Name');
    console.log('────┼────────────────────┼─────────────┼──────────┼──────────┼────────┼─────────────────');
    
    result.rows.forEach(user => {
      const id = String(user.id).padEnd(3);
      const email = user.email.padEnd(18);
      const username = user.username.padEnd(11);
      const role = user.role.padEnd(8);
      const provider = user.auth_provider.padEnd(8);
      const active = user.is_active ? 'Yes   ' : 'No    ';
      const fullName = `${user.first_name} ${user.last_name}`;
      
      console.log(`${id} | ${email} | ${username} | ${role} | ${provider} | ${active} | ${fullName}`);
    });

    console.log('\n📝 Login Instructions:');
    console.log('═══════════════════════════════════');
    console.log('Use any of the emails above as username');
    console.log('If you don\'t know the passwords, you can:');
    console.log('1. Reset password via admin panel');
    console.log('2. Create a new admin user');
    console.log('3. Use LDAP if configured');

  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  } finally {
    await client.end();
  }
}

checkCurrentUsers(); 