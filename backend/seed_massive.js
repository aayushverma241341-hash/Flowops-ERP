require('dotenv').config();
const db = require('./config/db');
const { faker } = require('@faker-js/faker');

async function seedMassive() {
  try {
    console.log('Starting Massive Seeding (50 records per new table)...');
    
    // --- 1. WAREHOUSE MANAGEMENT (WM) ---
    for (let i = 0; i < 50; i++) {
      // Bins (LS01)
      await db.query(
        'INSERT INTO sap_wm_master (warehouse_no, storage_type, storage_bin, max_capacity, current_capacity, status) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
        [
          `WH${faker.number.int({min:1, max:9}).toString().padStart(2, '0')}`,
          faker.helpers.arrayElement(['High Rack', 'Bulk', 'Cold Storage']),
          `BIN-${faker.string.alphanumeric(6).toUpperCase()}`,
          100,
          faker.number.int({min: 0, max: 100}),
          faker.helpers.arrayElement(['Empty', 'Partial', 'Full'])
        ]
      );
      
      // Transfer Requirements (LB10)
      await db.query(
        'INSERT INTO sap_wm_tr (tr_number, material, req_quantity, status) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
        [
          `TR-${faker.number.int({min:10000, max:99999})}`,
          `MAT-${faker.number.int({min:1000, max:9999})}`,
          faker.number.int({min: 10, max: 500}),
          faker.helpers.arrayElement(['Open', 'Processed'])
        ]
      );
      
      // Transfer Orders (LT01)
      await db.query(
        'INSERT INTO sap_wm_to (to_number, tr_number, material, source_bin, dest_bin, quantity, status) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING',
        [
          `TO-${faker.number.int({min:10000, max:99999})}`,
          `TR-${faker.number.int({min:10000, max:99999})}`,
          `MAT-${faker.number.int({min:1000, max:9999})}`,
          `SRC-${faker.string.alphanumeric(4).toUpperCase()}`,
          `DST-${faker.string.alphanumeric(4).toUpperCase()}`,
          faker.number.int({min: 10, max: 500}),
          faker.helpers.arrayElement(['Open', 'Confirmed'])
        ]
      );
    }
    console.log('Seeded WM tables (50 rows each)');

    // --- 2. MATERIALS MANAGEMENT (MM) ---
    for (let i = 0; i < 50; i++) {
      // Purchase Requisition (ME51N)
      await db.query(
        'INSERT INTO sap_purchase_requisitions (pr_number, material, quantity, req_date, status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
        [
          `PR-${faker.number.int({min:100000, max:999999})}`,
          `MAT-${faker.number.int({min:1000, max:9999})}`,
          faker.number.int({min: 10, max: 500}),
          faker.date.recent(),
          faker.helpers.arrayElement(['Open', 'Approved', 'Rejected'])
        ]
      );

      // RFQ (ME41)
      await db.query(
        'INSERT INTO sap_rfqs (rfq_number, material, vendor_name, deadline, status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
        [
          `RFQ-${faker.number.int({min:100000, max:999999})}`,
          `MAT-${faker.number.int({min:1000, max:9999})}`,
          faker.company.name(),
          faker.date.future(),
          faker.helpers.arrayElement(['Sent', 'Quoted', 'Rejected'])
        ]
      );

      // Info Records (ME11)
      await db.query(
        'INSERT INTO sap_info_records (info_number, material, vendor_name, net_price, valid_to) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
        [
          `PIR-${faker.number.int({min:100000, max:999999})}`,
          `MAT-${faker.number.int({min:1000, max:9999})}`,
          faker.company.name(),
          faker.finance.amount(10, 1000, 2),
          faker.date.future()
        ]
      );

      // Contracts (ME31K)
      await db.query(
        'INSERT INTO sap_contracts (contract_number, vendor_name, valid_from, valid_to, target_value, status) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
        [
          `CON-${faker.number.int({min:100000, max:999999})}`,
          faker.company.name(),
          faker.date.past(),
          faker.date.future(),
          faker.finance.amount(50000, 500000, 2),
          faker.helpers.arrayElement(['Active', 'Expired'])
        ]
      );

      // MIRO Invoices (MIRO)
      await db.query(
        'INSERT INTO sap_miro_invoices (invoice_number, po_number, vendor_name, amount, status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
        [
          `INV-${faker.number.int({min:100000, max:999999})}`,
          `PO-${faker.number.int({min:10000, max:99999})}`,
          faker.company.name(),
          faker.finance.amount(500, 50000, 2),
          faker.helpers.arrayElement(['Posted', 'Blocked', 'Cleared'])
        ]
      );

      // Material Documents (MB1A / MB1B)
      await db.query(
        'INSERT INTO sap_material_documents (doc_number, movement_type, material, quantity, posting_date) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
        [
          `MDoc-${faker.number.int({min:100000, max:999999})}`,
          faker.helpers.arrayElement(['201', '311', '501']),
          `MAT-${faker.number.int({min:1000, max:9999})}`,
          faker.number.int({min: 10, max: 200}),
          faker.date.recent()
        ]
      );
    }
    console.log('Seeded MM tables (50 rows each)');

    // --- 3. EDI / IDOC MANAGEMENT ---
    for (let i = 0; i < 50; i++) {
      await db.query(
        'INSERT INTO sap_idocs (idoc_number, message_type, sender_port, receiver_port, status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
        [
          faker.number.int({min:1000000000, max:9999999999}).toString(),
          faker.helpers.arrayElement(['INVOIC', 'ORDERS', 'MATMAS', 'CREMAS', 'DEBMAS']),
          faker.helpers.arrayElement(['SAP_PORT', 'EXT_PORT']),
          faker.helpers.arrayElement(['SAP_PORT', 'EXT_PORT']),
          faker.helpers.arrayElement(['53', '51', '68', '64'])
        ]
      );
    }
    console.log('Seeded EDI IDOC table (50 rows each)');

    console.log('Massive Seeding completed successfully.');
  } catch (error) {
    console.error('Error in Massive Seeding:', error);
  } finally {
    process.exit();
  }
}

seedMassive();
