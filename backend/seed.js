const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seedAdmin() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Delete the fake admin if it exists
    await pool.query("DELETE FROM users WHERE username = 'admin'");
    
    // Insert the real admin
    await pool.query(
      "INSERT INTO users (username, password_hash, role) VALUES ('admin', $1, 'Admin')",
      [hashedPassword]
    );
    
    console.log("SUCCESS! Admin account created. You can now login with:");
    console.log("Username: admin");
    console.log("Password: admin123");
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
}

seedAdmin();
