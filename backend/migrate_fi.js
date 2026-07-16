const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const migrationQuery = `
CREATE TABLE IF NOT EXISTS fi_chart_of_accounts (
    account_code VARCHAR(10) PRIMARY KEY,
    account_name VARCHAR(255) NOT NULL,
    account_group VARCHAR(50) NOT NULL,
    statement_type VARCHAR(50) NOT NULL CHECK (statement_type IN ('Balance Sheet', 'P&L'))
);

CREATE TABLE IF NOT EXISTS fi_general_ledger (
    id SERIAL PRIMARY KEY,
    transaction_date DATE NOT NULL,
    account_code VARCHAR(10) REFERENCES fi_chart_of_accounts(account_code),
    document_type VARCHAR(10) NOT NULL,
    reference VARCHAR(50),
    debit_amount DECIMAL(15, 2) DEFAULT 0.00,
    credit_amount DECIMAL(15, 2) DEFAULT 0.00,
    text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fi_accounts_receivable (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    doc_date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    cleared_status VARCHAR(20) CHECK (cleared_status IN ('Open', 'Cleared')) DEFAULT 'Open'
);

CREATE TABLE IF NOT EXISTS fi_accounts_payable (
    id SERIAL PRIMARY KEY,
    vendor_id VARCHAR(50) NOT NULL,
    vendor_name VARCHAR(255) NOT NULL,
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    doc_date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    cleared_status VARCHAR(20) CHECK (cleared_status IN ('Open', 'Cleared')) DEFAULT 'Open'
);

CREATE TABLE IF NOT EXISTS fi_fixed_assets (
    asset_id VARCHAR(20) PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    asset_class VARCHAR(50) NOT NULL,
    purchase_date DATE NOT NULL,
    acquisition_val DECIMAL(15, 2) NOT NULL,
    accum_depreciation DECIMAL(15, 2) DEFAULT 0.00,
    net_book_val DECIMAL(15, 2) NOT NULL
);
`;

async function migrateFI() {
    try {
        console.log("Creating FI tables...");
        await pool.query(migrationQuery);
        console.log("✅ FI tables created successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Error migrating FI tables:", err);
        process.exit(1);
    }
}

migrateFI();
