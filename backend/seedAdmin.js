const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = require('./config/db');

async function seedAdmin() {
  try {
    const username = 'admin';
    const password = 'adminpassword';
    
    // Hash password properly
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upsert admin user
    await pool.query(`
      INSERT INTO users (username, password_hash, role) 
      VALUES ($1, $2, 'Admin') 
      ON CONFLICT (username) 
      DO UPDATE SET password_hash = $2
    `, [username, hashedPassword]);

    console.log('Successfully seeded admin user:');
    console.log('Username: admin');
    console.log('Password: adminpassword');
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(0);
  }
}

seedAdmin();
