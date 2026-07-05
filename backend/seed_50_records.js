require('dotenv').config();
const db = require('./config/db');

// Helpers for random data
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const companies = ['Reliance Retail', 'Tata Consultancy Services', 'HDFC Bank', 'Larsen & Toubro', 'Infosys Limited', 'Mahindra & Mahindra', 'Wipro Technologies', 'State Bank of India', 'Adani Ports', 'ITC Limited', 'Bajaj Auto', 'Maruti Suzuki', 'Sun Pharma', 'Bharti Airtel', 'Kotak Mahindra', 'Asian Paints', 'HCL Technologies', 'Axis Bank', 'Titan Company', 'UltraTech Cement'];
const materialsDesc = ['Portland Cement 50kg', 'Steel TMT Bars 12mm', 'Red Bricks Standard', 'Safety Helmet', 'Copper Wire 2.5mm', 'Industrial Paint 20L', 'Ceramic Tiles', 'PVC Pipes 4inch', 'Gravel 1 Ton', 'Sand 1 Ton', 'Aluminum Sheets', 'Glass Panels', 'Wooden Doors', 'LED Bulbs 10W', 'Switchboards'];
const baseUnits = ['BAG', 'TON', 'PC', 'MTR', 'LTR', 'SQM'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur'];
const statuses = ['Created', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const accountTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];
const faClasses = ['Machinery', 'IT Equipment', 'Vehicles', 'Furniture', 'Building'];

async function seed50() {
  try {
    console.log("Starting massive 50-record seeding process...");

    // 1. CLEAR TABLES
    await db.query(`
      TRUNCATE TABLE 
        fi_chart_of_accounts, fi_accounts_receivable, fi_accounts_payable, fi_general_ledger, fi_fixed_assets,
        sd_sales_orders,
        sap_materials, sap_vendors, sap_purchase_orders, sap_po_items, sap_goods_receipts
      CASCADE;
    `);

    // ---------------------------------------------------------
    // FI MODULE (50 records each)
    // ---------------------------------------------------------
    console.log("Seeding FI Data...");
    
    // 1. Chart of Accounts first
    for (let i = 1; i <= 50; i++) {
      await db.query(`INSERT INTO fi_chart_of_accounts (account_code, account_name, account_type, balance) VALUES ($1, $2, $3, $4)`, 
        [(1000 + i).toString(), `Account Name ${i}`, randomItem(accountTypes), randomInt(10000, 10000000)]);
    }

    // 2. Other FI Tables
    for (let i = 1; i <= 50; i++) {
      // AR
      await db.query(`INSERT INTO fi_accounts_receivable (invoice_number, customer_name, amount, due_date, status) VALUES ($1, $2, $3, $4, $5)`,
        [`INV-R-${2000 + i}`, randomItem(companies), randomInt(10000, 500000), randomDate(new Date(2026, 0, 1), new Date(2026, 11, 31)).toISOString().split('T')[0], randomItem(['Open', 'Paid', 'Overdue'])]);
      
      // AP
      await db.query(`INSERT INTO fi_accounts_payable (invoice_number, vendor_name, amount, due_date, status) VALUES ($1, $2, $3, $4, $5)`,
        [`INV-P-${3000 + i}`, randomItem(companies), randomInt(5000, 300000), randomDate(new Date(2026, 0, 1), new Date(2026, 11, 31)).toISOString().split('T')[0], randomItem(['Open', 'Paid', 'Overdue'])]);
      
      // GL
      await db.query(`INSERT INTO fi_general_ledger (transaction_date, document_number, description, account_code, debit, credit) VALUES ($1, $2, $3, $4, $5, $6)`,
        [randomDate(new Date(2026, 0, 1), new Date(2026, 6, 1)).toISOString().split('T')[0], `DOC-${10000 + i}`, `General Ledger Entry ${i}`, (1000 + randomInt(1, 50)).toString(), randomInt(0, 1) === 0 ? randomInt(1000, 50000) : 0, randomInt(0, 1) === 1 ? randomInt(1000, 50000) : 0]);
      
      // Fixed Assets
      const pv = randomInt(50000, 5000000);
      await db.query(`INSERT INTO fi_fixed_assets (asset_number, asset_name, asset_class, purchase_date, purchase_value, current_book_value, status) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [`AST-${5000 + i}`, `Corporate Asset ${i}`, randomItem(faClasses), randomDate(new Date(2020, 0, 1), new Date(2025, 11, 31)).toISOString().split('T')[0], pv, pv * 0.8, randomItem(['Active', 'Active', 'Retired'])]);
    }

    // ---------------------------------------------------------
    // SD MODULE (50 records)
    // ---------------------------------------------------------
    console.log("Seeding SD Data...");
    for (let i = 1; i <= 50; i++) {
      await db.query(`INSERT INTO sd_sales_orders (order_number, customer_name, total_value, order_date, status) VALUES ($1, $2, $3, $4, $5)`,
        [`SO-${10000 + i}`, randomItem(companies), randomInt(50000, 5000000), randomDate(new Date(2026, 0, 1), new Date(2026, 6, 1)).toISOString().split('T')[0], randomItem(statuses)]);
    }

    // ---------------------------------------------------------
    // SAP MM MODULE (50 records each)
    // ---------------------------------------------------------
    console.log("Seeding SAP MM Data...");
    for (let i = 1; i <= 50; i++) {
      // Materials
      await db.query(`INSERT INTO sap_materials (material_number, description, base_unit, material_group, total_stock) VALUES ($1, $2, $3, $4, $5)`,
        [`MAT-${1000 + i}`, `${randomItem(materialsDesc)} Var-${i}`, randomItem(baseUnits), 'RAW_MAT', randomInt(10, 10000)]);
      
      // Vendors
      await db.query(`INSERT INTO sap_vendors (vendor_number, name, city, contact_no) VALUES ($1, $2, $3, $4)`,
        [`VEN-${2000 + i}`, `${randomItem(companies)} Supplier`, randomItem(cities), `9${randomInt(100000000, 999999999)}`]);
    }

    // We need material_id and vendor_id for POs, let's fetch them
    const matRes = await db.query('SELECT material_id FROM sap_materials');
    const venRes = await db.query('SELECT vendor_id FROM sap_vendors');
    const materials = matRes.rows;
    const vendors = venRes.rows;

    for (let i = 1; i <= 50; i++) {
      // Purchase Orders
      const poRes = await db.query(`INSERT INTO sap_purchase_orders (po_number, vendor_id, doc_date, status) VALUES ($1, $2, $3, $4) RETURNING po_id`,
        [`PO-${3000 + i}`, randomItem(vendors).vendor_id, randomDate(new Date(2026, 0, 1), new Date(2026, 6, 1)).toISOString().split('T')[0], randomItem(['Pending', 'Approved', 'Received'])]);
      
      const poId = poRes.rows[0].po_id;

      // PO Items (1 item per PO to get 50 items easily)
      await db.query(`INSERT INTO sap_po_items (po_id, item_no, material_id, po_quantity, net_price) VALUES ($1, $2, $3, $4, $5)`,
        [poId, 10, randomItem(materials).material_id, randomInt(10, 500), randomInt(100, 5000)]);
      
      // Goods Receipts (MIGO)
      await db.query(`INSERT INTO sap_goods_receipts (migo_document, po_id, posting_date, movement_type) VALUES ($1, $2, $3, $4)`,
        [`MIGO-${5000 + i}`, poId, randomDate(new Date(2026, 0, 1), new Date(2026, 6, 1)).toISOString().split('T')[0], '101']);
    }

    console.log("All 50 records generated successfully!");
  } catch (error) {
    console.error("Seeding Failed:", error);
  } finally {
    process.exit(0);
  }
}

seed50();
