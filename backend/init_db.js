const db = require('./config/db');
const fs = require('fs');
const path = require('path');

async function init() {
  try {
    const schemaPath = path.join(__dirname, '../schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Running schema.sql...');
    await db.query(sql);
    console.log('Schema created successfully.');
  } catch (err) {
    console.error('Error creating schema:', err);
  } finally {
    process.exit();
  }
}

init();
