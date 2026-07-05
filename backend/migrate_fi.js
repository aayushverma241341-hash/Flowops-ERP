require('dotenv').config();
const db = require('./config/db');

async function migrateFI() {
  try {
    console.log('Starting FI Migrations...');

    // 1. Chart of Accounts (COA)
    await db.query(`
      CREATE TABLE IF NOT EXISTS fi_chart_of_accounts (
        id SERIAL PRIMARY KEY,
        account_code VARCHAR(50) UNIQUE NOT NULL,
        account_name VARCHAR(255) NOT NULL,
        account_type VARCHAR(50) NOT NULL, -- Asset, Liability, Equity, Revenue, Expense
        balance DECIMAL(15, 2) DEFAULT 0.00,
        currency VARCHAR(10) DEFAULT 'INR',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('fi_chart_of_accounts table created');

    // 2. Accounts Receivable (AR)
    await db.query(`
      CREATE TABLE IF NOT EXISTS fi_accounts_receivable (
        id SERIAL PRIMARY KEY,
        invoice_number VARCHAR(100) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        due_date DATE NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Open', -- Open, Paid, Overdue
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('fi_accounts_receivable table created');

    // 3. Accounts Payable (AP)
    await db.query(`
      CREATE TABLE IF NOT EXISTS fi_accounts_payable (
        id SERIAL PRIMARY KEY,
        invoice_number VARCHAR(100) UNIQUE NOT NULL,
        vendor_name VARCHAR(255) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        due_date DATE NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Open', -- Open, Paid, Overdue
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('fi_accounts_payable table created');

    // 4. General Ledger (GL)
    await db.query(`
      CREATE TABLE IF NOT EXISTS fi_general_ledger (
        id SERIAL PRIMARY KEY,
        transaction_date DATE NOT NULL,
        document_number VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        account_code VARCHAR(50) REFERENCES fi_chart_of_accounts(account_code),
        debit DECIMAL(15, 2) DEFAULT 0.00,
        credit DECIMAL(15, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('fi_general_ledger table created');

    // 5. Fixed Assets
    await db.query(`
      CREATE TABLE IF NOT EXISTS fi_fixed_assets (
        id SERIAL PRIMARY KEY,
        asset_number VARCHAR(100) UNIQUE NOT NULL,
        asset_name VARCHAR(255) NOT NULL,
        asset_class VARCHAR(100),
        purchase_date DATE NOT NULL,
        purchase_value DECIMAL(15, 2) NOT NULL,
        current_book_value DECIMAL(15, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Active', -- Active, Retired, Sold
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('fi_fixed_assets table created');

    console.log('FI Migrations completed successfully.');
  } catch (error) {
    console.error('Error in FI Migrations:', error);
  } finally {
    process.exit();
  }
}

migrateFI();
