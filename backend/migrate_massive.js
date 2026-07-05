require('dotenv').config();
const db = require('./config/db');

async function migrateMassive() {
  try {
    console.log('Starting Massive Migrations (WM, expanded MM, EDI)...');

    // === WAREHOUSE MANAGEMENT (WM) ===
    await db.query(`
      CREATE TABLE IF NOT EXISTS sap_wm_master (
        bin_id SERIAL PRIMARY KEY,
        warehouse_no VARCHAR(10) NOT NULL,
        storage_type VARCHAR(50) NOT NULL,
        storage_bin VARCHAR(50) UNIQUE NOT NULL,
        max_capacity INT DEFAULT 100,
        current_capacity INT DEFAULT 0,
        status VARCHAR(20) DEFAULT 'Empty'
      )
    `);
    console.log('sap_wm_master table created');

    await db.query(`
      CREATE TABLE IF NOT EXISTS sap_wm_tr (
        tr_id SERIAL PRIMARY KEY,
        tr_number VARCHAR(50) UNIQUE NOT NULL,
        material VARCHAR(100) NOT NULL,
        req_quantity INT NOT NULL,
        status VARCHAR(20) DEFAULT 'Open'
      )
    `);
    console.log('sap_wm_tr table created');

    await db.query(`
      CREATE TABLE IF NOT EXISTS sap_wm_to (
        to_id SERIAL PRIMARY KEY,
        to_number VARCHAR(50) UNIQUE NOT NULL,
        tr_number VARCHAR(50),
        material VARCHAR(100) NOT NULL,
        source_bin VARCHAR(50),
        dest_bin VARCHAR(50),
        quantity INT NOT NULL,
        status VARCHAR(20) DEFAULT 'Open'
      )
    `);
    console.log('sap_wm_to table created');


    // === MATERIALS MANAGEMENT (MM) EXPANSION ===
    await db.query(`
      CREATE TABLE IF NOT EXISTS sap_purchase_requisitions (
        pr_id SERIAL PRIMARY KEY,
        pr_number VARCHAR(50) UNIQUE NOT NULL,
        material VARCHAR(100) NOT NULL,
        quantity INT NOT NULL,
        req_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'Open'
      )
    `);
    console.log('sap_purchase_requisitions table created');

    await db.query(`
      CREATE TABLE IF NOT EXISTS sap_rfqs (
        rfq_id SERIAL PRIMARY KEY,
        rfq_number VARCHAR(50) UNIQUE NOT NULL,
        material VARCHAR(100) NOT NULL,
        vendor_name VARCHAR(100) NOT NULL,
        deadline DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'Sent'
      )
    `);
    console.log('sap_rfqs table created');

    await db.query(`
      CREATE TABLE IF NOT EXISTS sap_info_records (
        info_id SERIAL PRIMARY KEY,
        info_number VARCHAR(50) UNIQUE NOT NULL,
        material VARCHAR(100) NOT NULL,
        vendor_name VARCHAR(100) NOT NULL,
        net_price DECIMAL(10,2) NOT NULL,
        valid_to DATE NOT NULL
      )
    `);
    console.log('sap_info_records table created');

    await db.query(`
      CREATE TABLE IF NOT EXISTS sap_contracts (
        contract_id SERIAL PRIMARY KEY,
        contract_number VARCHAR(50) UNIQUE NOT NULL,
        vendor_name VARCHAR(100) NOT NULL,
        valid_from DATE NOT NULL,
        valid_to DATE NOT NULL,
        target_value DECIMAL(15,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'Active'
      )
    `);
    console.log('sap_contracts table created');

    await db.query(`
      CREATE TABLE IF NOT EXISTS sap_miro_invoices (
        invoice_id SERIAL PRIMARY KEY,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        po_number VARCHAR(50) NOT NULL,
        vendor_name VARCHAR(100) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'Posted'
      )
    `);
    console.log('sap_miro_invoices table created');

    await db.query(`
      CREATE TABLE IF NOT EXISTS sap_material_documents (
        doc_id SERIAL PRIMARY KEY,
        doc_number VARCHAR(50) UNIQUE NOT NULL,
        movement_type VARCHAR(10) NOT NULL, -- e.g., 201 (Goods Issue), 311 (Transfer)
        material VARCHAR(100) NOT NULL,
        quantity INT NOT NULL,
        posting_date DATE DEFAULT CURRENT_DATE
      )
    `);
    console.log('sap_material_documents table created');


    // === EDI / IDOC MANAGEMENT ===
    await db.query(`
      CREATE TABLE IF NOT EXISTS sap_idocs (
        idoc_id SERIAL PRIMARY KEY,
        idoc_number VARCHAR(50) UNIQUE NOT NULL,
        message_type VARCHAR(50) NOT NULL, -- e.g., INVOIC, ORDERS
        sender_port VARCHAR(50) NOT NULL,
        receiver_port VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL, -- e.g., 53 (Success), 51 (Error)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('sap_idocs table created');

    console.log('Massive Migrations completed successfully.');
  } catch (error) {
    console.error('Error in Massive Migrations:', error);
  } finally {
    process.exit();
  }
}

migrateMassive();
