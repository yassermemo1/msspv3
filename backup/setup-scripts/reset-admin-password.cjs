const { Pool } = require('pg');
const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function resetAdminPassword() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:password@localhost:5432/mssp_client_management'
  });

  try {
    console.log('🔐 Resetting admin password...');
    
    const hashedPassword = await hashPassword('admin123');
    
    // First try to update existing admin
    const updateResult = await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email, first_name, last_name',
      [hashedPassword, 'admin@mssp.com']
    );
    
    if (updateResult.rows.length > 0) {
      const user = updateResult.rows[0];
      console.log('✅ Admin password reset successfully!');
      console.log(`User: ${user.first_name} ${user.last_name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Password: admin123`);
    } else {
      // If admin doesn't exist, create it
      console.log('Admin user not found, creating...');
      const insertResult = await pool.query(
        `INSERT INTO users (email, username, password, first_name, last_name, role, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id, email, first_name, last_name`,
        ['admin@mssp.com', 'admin', hashedPassword, 'Admin', 'User', 'admin', true]
      );
      
      const user = insertResult.rows[0];
      console.log('✅ Admin user created successfully!');
      console.log(`User: ${user.first_name} ${user.last_name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Password: admin123`);
    }
    
  } catch (error) {
    console.error('❌ Failed to reset password:', error.message);
  } finally {
    await pool.end();
  }
}

resetAdminPassword(); 