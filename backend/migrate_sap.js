const db = require('./config/db');

async function runSAPMigration() {
  try {
    console.log("Starting SAP MM Database Migration...");

    await db.query(`
      CREATE TABLE IF NOT EXISTS sap_materials (
        material_id SERIAL PRIMARY KEY,
        material_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. MAT-1001
        description VARCHAR(255) NOT NULL,
        base_unit VARCHAR(10) NOT NULL, -- KG, PC, LTR
        material_group VARCHAR(50),
        total_stock DECIMAL(15,2) DEFAULT 0.00
      );
    `);
    console.log("Created sap_materials table.");

    await db.query(`
      CREATE TABLE IF NOT EXISTS sap_vendors (
        vendor_id SERIAL PRIMARY KEY,
        vendor_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. VEN-2001
        name VARCHAR(255) NOT NULL,
        city VARCHAR(100),
        contact_no VARCHAR(50)
      );
    `);
    console.log("Created sap_vendors table.");

    await db.query(`
      CREATE TABLE IF NOT EXISTS sap_purchase_orders (
        po_id SERIAL PRIMARY KEY,
        po_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. PO-3001
        vendor_id INTEGER REFERENCES sap_vendors(vendor_id),
        doc_date DATE DEFAULT CURRENT_DATE,
        status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Received'))
      );
    `);
    console.log("Created sap_purchase_orders table.");

    await db.query(`
      CREATE TABLE IF NOT EXISTS sap_po_items (
        po_item_id SERIAL PRIMARY KEY,
        po_id INTEGER REFERENCES sap_purchase_orders(po_id) ON DELETE CASCADE,
        item_no INTEGER NOT NULL, -- 10, 20, 30
        material_id INTEGER REFERENCES sap_materials(material_id),
        po_quantity DECIMAL(15,2) NOT NULL,
        net_price DECIMAL(15,2) NOT NULL
      );
    `);
    console.log("Created sap_po_items table.");

    await db.query(`
      CREATE TABLE IF NOT EXISTS sap_goods_receipts (
        gr_id SERIAL PRIMARY KEY,
        migo_document VARCHAR(50) UNIQUE NOT NULL,
        po_id INTEGER REFERENCES sap_purchase_orders(po_id),
        posting_date DATE DEFAULT CURRENT_DATE,
        movement_type VARCHAR(10) DEFAULT '101' -- 101 is SAP standard for GR against PO
      );
    `);
    console.log("Created sap_goods_receipts table.");

    console.log("SAP Migration Completed Successfully!");
  } catch (error) {
    console.error("Migration Failed:", error);
  } finally {
    process.exit(0);
  }
}

runSAPMigration();
