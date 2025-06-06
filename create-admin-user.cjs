#!/usr/bin/env node

const { Client } = require('pg');
const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');

// Load environment variables
require('dotenv').config();

const scryptAsync = promisify(scrypt);

const client = new Client({
  connectionString: process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER || 'mssp_user'}:${process.env.DB_PASSWORD || '12345678'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'mssp_production'}`
});

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminUser() {
  try {
    await client.connect();
    console.log('🔐 Creating new admin user...\n');

    // Get user input or use defaults
    const email = process.argv[2] || 'admin@mssp.local';
    const password = process.argv[3] || 'admin123';
    const username = process.argv[4] || 'admin';
    const firstName = process.argv[5] || 'System';
    const lastName = process.argv[6] || 'Administrator';

    console.log(`📝 Creating admin user with:`);
    console.log(`   Email: ${email}`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`   Name: ${firstName} ${lastName}\n`);

    // Hash the password using scrypt (same as the system)
    const hashedPassword = await hashPassword(password);
    console.log(`🔐 Password hashed successfully (${hashedPassword.split('.')[0].length} chars hash + salt)`);

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id, email FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  User already exists. Updating to admin role...');
      
      const updateResult = await client.query(`
        UPDATE users 
        SET 
          role = 'admin',
          password = $1,
          is_active = true,
          first_name = $2,
          last_name = $3,
          auth_provider = 'local'
        WHERE email = $4 OR username = $5
        RETURNING id, email, username
      `, [hashedPassword, firstName, lastName, email, username]);

      const user = updateResult.rows[0];
      console.log(`✅ Updated existing user to admin:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Username: ${user.username}`);
    } else {
      // Create new admin user
      const insertResult = await client.query(`
        INSERT INTO users (
          username, 
          email, 
          password, 
          first_name, 
          last_name, 
          role, 
          is_active, 
          auth_provider,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, 'admin', true, 'local', NOW())
        RETURNING id, email, username
      `, [username, email, hashedPassword, firstName, lastName]);

      const user = insertResult.rows[0];
      console.log(`✅ Created new admin user:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Username: ${user.username}`);
    }

    console.log('\n🎉 Admin user ready!');
    console.log('═══════════════════════════════════');
    console.log(`Login URL: http://your-server:5001/login`);
    console.log(`Email/Username: ${email} or ${username}`);
    console.log(`Password: ${password}`);
    console.log('═══════════════════════════════════');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === '23505') {
      console.log('\n💡 Tip: User with this email/username already exists.');
      console.log('Try with different credentials or check existing users with:');
      console.log('node check-current-users.cjs');
    }
  } finally {
    await client.end();
  }
}

// Show usage if no arguments
if (process.argv.length < 3) {
  console.log('🔐 Create Admin User Script');
  console.log('═══════════════════════════════════');
  console.log('Usage:');
  console.log('  node create-admin-user.cjs [email] [password] [username] [firstName] [lastName]');
  console.log('');
  console.log('Examples:');
  console.log('  node create-admin-user.cjs admin@company.com SecurePass123 admin');
  console.log('  node create-admin-user.cjs john@company.com MyPassword john John Doe');
  console.log('');
  console.log('Default (if no arguments):');
  console.log('  Email: admin@mssp.local');
  console.log('  Password: admin123');
  console.log('  Username: admin');
  console.log('');
  console.log('Press Enter to create with defaults or Ctrl+C to cancel...');
  
  process.stdin.once('data', () => {
    createAdminUser();
  });
} else {
  createAdminUser();
} 