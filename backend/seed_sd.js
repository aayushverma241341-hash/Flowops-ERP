require('dotenv').config();
const db = require('./config/db');

async function seedSD() {
  try {
    console.log('Starting SD Seeding...');

    // Clear existing data
    await db.query('TRUNCATE TABLE sd_sales_orders CASCADE');

    // 1. Sales Orders Data
    const soData = [
      ['SO-10001', 'Reliance Retail', 1500000.00, '2026-06-01', 'Delivered'],
      ['SO-10002', 'Tata Consultancy Services', 2400000.00, '2026-06-05', 'Shipped'],
      ['SO-10003', 'HDFC Bank', 850000.00, '2026-06-10', 'Processing'],
      ['SO-10004', 'Larsen & Toubro', 3200000.00, '2026-06-12', 'Created'],
      ['SO-10005', 'Infosys Limited', 1250000.00, '2026-06-15', 'Delivered'],
      ['SO-10006', 'Mahindra & Mahindra', 4500000.00, '2026-06-18', 'Processing'],
      ['SO-10007', 'Wipro Technologies', 650000.00, '2026-06-20', 'Created'],
      ['SO-10008', 'State Bank of India', 1100000.00, '2026-06-21', 'Processing'],
      ['SO-10009', 'Adani Ports', 5400000.00, '2026-06-22', 'Created'],
      ['SO-10010', 'ITC Limited', 950000.00, '2026-06-23', 'Cancelled']
    ];
    
    for (const row of soData) {
      await db.query(
        'INSERT INTO sd_sales_orders (order_number, customer_name, total_value, order_date, status) VALUES ($1, $2, $3, $4, $5)',
        row
      );
    }

    console.log('SD Seeding completed successfully.');
  } catch (error) {
    console.error('Error in SD Seeding:', error);
  } finally {
    process.exit();
  }
}

seedSD();
