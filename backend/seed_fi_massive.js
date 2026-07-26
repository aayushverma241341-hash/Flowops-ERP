require('dotenv').config();
const db = require('./config/db');
const { faker } = require('@faker-js/faker');

const SEED_COUNT = 550;

async function seed() {
  console.log(`Starting massive FI seed with ${SEED_COUNT} records per module...`);
  
  try {
    // 1. Chart of Accounts (COA)
    console.log("Seeding Chart of Accounts...");
    const coaGroups = ['Assets', 'Liabilities', 'Equity', 'Revenue', 'Expenses'];
    const stmtTypes = ['Balance Sheet', 'P&L'];
    for (let i = 0; i < SEED_COUNT; i++) {
      const code = (100000 + i).toString();
      const name = faker.finance.accountName() + ' ' + i;
      const group = faker.helpers.arrayElement(coaGroups);
      const stmt = faker.helpers.arrayElement(stmtTypes);
      await db.query(
        `INSERT INTO fi_chart_of_accounts (account_code, account_name, account_group, statement_type) 
         VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
        [code, name, group, stmt]
      );
    }

    // 2. Accounts Receivable (AR)
    console.log("Seeding Accounts Receivable...");
    const arStatuses = ['Open', 'Cleared'];
    for (let i = 0; i < SEED_COUNT; i++) {
      const cid = 'CUST-' + faker.string.numeric(4);
      const cname = faker.company.name();
      const inv = 'INV-' + faker.string.alphanumeric(6).toUpperCase();
      const date = faker.date.recent({ days: 90 });
      const due = new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000);
      const amt = faker.finance.amount(1000, 50000, 2);
      const status = faker.helpers.arrayElement(arStatuses);
      
      await db.query(
        `INSERT INTO fi_accounts_receivable (customer_id, customer_name, invoice_no, doc_date, due_date, amount, cleared_status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [cid, cname, inv, date, due, amt, status]
      );
    }

    // 3. Accounts Payable (AP)
    console.log("Seeding Accounts Payable...");
    const apStatuses = ['Open', 'Cleared'];
    for (let i = 0; i < SEED_COUNT; i++) {
      const vid = 'VEND-' + faker.string.numeric(4);
      const vname = faker.company.name();
      const inv = 'V-INV-' + faker.string.alphanumeric(6).toUpperCase();
      const date = faker.date.recent({ days: 90 });
      const due = new Date(date.getTime() + 45 * 24 * 60 * 60 * 1000);
      const amt = faker.finance.amount(500, 30000, 2);
      const status = faker.helpers.arrayElement(apStatuses);
      
      await db.query(
        `INSERT INTO fi_accounts_payable (vendor_id, vendor_name, invoice_no, doc_date, due_date, amount, cleared_status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [vid, vname, inv, date, due, amt, status]
      );
    }

    // 4. General Ledger (GL)
    console.log("Seeding General Ledger...");
    const docTypes = ['SA', 'DZ', 'KZ', 'KR', 'DR'];
    for (let i = 0; i < SEED_COUNT; i++) {
      const tdate = faker.date.recent({ days: 120 });
      const acode = (100000 + faker.number.int({ min: 0, max: 400 })).toString();
      const dtype = faker.helpers.arrayElement(docTypes);
      const ref = 'REF-' + faker.string.alphanumeric(5).toUpperCase();
      const isDebit = faker.datatype.boolean();
      const amt = parseFloat(faker.finance.amount(100, 20000, 2));
      const deb = isDebit ? amt : 0;
      const cred = isDebit ? 0 : amt;
      const text = faker.finance.transactionDescription();
      
      await db.query(
        `INSERT INTO fi_general_ledger (transaction_date, account_code, document_type, reference, debit_amount, credit_amount, text) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [tdate, acode, dtype, ref, deb, cred, text]
      );
    }

    // 5. Fixed Assets (FA)
    console.log("Seeding Fixed Assets...");
    const faClasses = ['Machinery', 'Vehicles', 'IT Equipment', 'Furniture', 'Buildings'];
    for (let i = 0; i < SEED_COUNT; i++) {
      const aid = 'FA-' + (1000 + i);
      const desc = faker.commerce.productName();
      const aclass = faker.helpers.arrayElement(faClasses);
      const pdate = faker.date.past({ years: 5 });
      const acqVal = parseFloat(faker.finance.amount(5000, 500000, 2));
      const dep = acqVal * faker.number.float({ min: 0.1, max: 0.8, precision: 0.01 });
      const nbv = acqVal - dep;
      
      await db.query(
        `INSERT INTO fi_fixed_assets (asset_id, description, asset_class, purchase_date, acquisition_val, accum_depreciation, net_book_val) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
        [aid, desc, aclass, pdate, acqVal, dep, nbv]
      );
    }

    console.log("Massive seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding DB:", error);
    process.exit(1);
  }
}

seed();
