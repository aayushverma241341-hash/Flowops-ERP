const db = require('./config/db');

async function seedSAP() {
  try {
    console.log("Seeding SAP MM Data...");
    await db.query(`TRUNCATE TABLE sap_materials, sap_vendors, sap_purchase_orders CASCADE;`);
    
    // Seed Materials
    await db.query(`INSERT INTO sap_materials (material_number, description, base_unit, material_group, total_stock) VALUES 
      ('MAT-1001', 'Portland Cement 50kg', 'BAG', 'RAW_MAT', 500),
      ('MAT-1002', 'Steel TMT Bars 12mm', 'TON', 'RAW_MAT', 50),
      ('MAT-1003', 'Red Bricks Standard', 'PC', 'RAW_MAT', 10000),
      ('MAT-1004', 'Safety Helmet', 'PC', 'PPE', 200)
    `);

    // Seed Vendors
    await db.query(`INSERT INTO sap_vendors (vendor_number, name, city, contact_no) VALUES 
      ('VEN-2001', 'UltraTech Supplies', 'Mumbai', '9876543210'),
      ('VEN-2002', 'Tata Steel Distributors', 'Jamshedpur', '9988776655'),
      ('VEN-2003', 'Safety First Corp', 'Delhi', '9123456789')
    `);

    console.log("SAP Seeding Completed!");
  } catch (error) {
    console.error("SAP Seeding Failed:", error);
  } finally {
    process.exit(0);
  }
}

seedSAP();
