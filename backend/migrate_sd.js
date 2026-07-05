require('dotenv').config();
const db = require('./config/db');

async function migrateSD() {
  try {
    console.log('Starting SD Migrations...');

    // 1. Sales Orders
    await db.query(`
      CREATE TABLE IF NOT EXISTS sd_sales_orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(100) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        total_value DECIMAL(15, 2) NOT NULL,
        order_date DATE NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Created', -- Created, Processing, Shipped, Delivered, Cancelled
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('sd_sales_orders table created');

    console.log('SD Migrations completed successfully.');
  } catch (error) {
    console.error('Error in SD Migrations:', error);
  } finally {
    process.exit();
  }
}

migrateSD();
