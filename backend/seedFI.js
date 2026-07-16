const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const coaData = [
  { code: '100000', name: 'Petty Cash', group: 'Cash', type: 'Balance Sheet' },
  { code: '100100', name: 'Main Bank Account', group: 'Bank', type: 'Balance Sheet' },
  { code: '110000', name: 'Trade Receivables (AR)', group: 'Receivables', type: 'Balance Sheet' },
  { code: '120000', name: 'Inventory - Raw Materials', group: 'Inventory', type: 'Balance Sheet' },
  { code: '150000', name: 'Machinery & Equipment', group: 'Fixed Assets', type: 'Balance Sheet' },
  { code: '210000', name: 'Trade Payables (AP)', group: 'Payables', type: 'Balance Sheet' },
  { code: '220000', name: 'Sales Tax Payable', group: 'Tax', type: 'Balance Sheet' },
  { code: '300000', name: 'Share Capital', group: 'Equity', type: 'Balance Sheet' },
  { code: '400000', name: 'Sales Revenue - Domestic', group: 'Revenue', type: 'P&L' },
  { code: '400100', name: 'Service Revenue', group: 'Revenue', type: 'P&L' },
  { code: '500000', name: 'Cost of Goods Sold', group: 'COGS', type: 'P&L' },
  { code: '600000', name: 'Salaries & Wages', group: 'Expenses', type: 'P&L' },
  { code: '600100', name: 'Rent Expense', group: 'Expenses', type: 'P&L' },
  { code: '600200', name: 'Utilities', group: 'Expenses', type: 'P&L' },
  { code: '600300', name: 'Depreciation Expense', group: 'Expenses', type: 'P&L' },
];

const customers = ['Acme Corp', 'Global Industries', 'TechFlow Solutions', 'Stark Enterprises', 'Wayne Corp'];
const vendors = ['OfficeMax Supplies', 'BuildIt Hardware', 'Cisco Systems', 'Delta Logistics', 'FastTrack Couriers'];

async function seedFI() {
    try {
        console.log("Seeding Chart of Accounts...");
        for (const act of coaData) {
            await pool.query(`INSERT INTO fi_chart_of_accounts (account_code, account_name, account_group, statement_type) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`, [act.code, act.name, act.group, act.type]);
        }

        console.log("Seeding Accounts Receivable...");
        for (let i = 1; i <= 30; i++) {
            const cust = customers[getRandomInt(0, customers.length - 1)];
            const inv = `AR-INV-26-${String(i).padStart(3, '0')}`;
            const amount = getRandomInt(10000, 500000);
            const status = Math.random() > 0.4 ? 'Open' : 'Cleared';
            const month = String(getRandomInt(1, 6)).padStart(2, '0');
            await pool.query(`INSERT INTO fi_accounts_receivable (customer_id, customer_name, invoice_no, doc_date, due_date, amount, cleared_status) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`, 
            [`C${getRandomInt(100,999)}`, cust, inv, `2026-${month}-01`, `2026-${month}-28`, amount, status]);
        }

        console.log("Seeding Accounts Payable...");
        for (let i = 1; i <= 30; i++) {
            const vend = vendors[getRandomInt(0, vendors.length - 1)];
            const inv = `AP-INV-26-${String(i).padStart(3, '0')}`;
            const amount = getRandomInt(5000, 200000);
            const status = Math.random() > 0.5 ? 'Open' : 'Cleared';
            const month = String(getRandomInt(1, 6)).padStart(2, '0');
            await pool.query(`INSERT INTO fi_accounts_payable (vendor_id, vendor_name, invoice_no, doc_date, due_date, amount, cleared_status) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`, 
            [`V${getRandomInt(100,999)}`, vend, inv, `2026-${month}-05`, `2026-${month}-25`, amount, status]);
        }

        console.log("Seeding General Ledger (Journal Entries)...");
        for (let i = 1; i <= 50; i++) {
            const isDebit = Math.random() > 0.5;
            const act = coaData[getRandomInt(0, coaData.length - 1)];
            const amount = getRandomInt(1000, 50000);
            const debit = isDebit ? amount : 0;
            const credit = isDebit ? 0 : amount;
            const month = String(getRandomInt(1, 6)).padStart(2, '0');
            await pool.query(`INSERT INTO fi_general_ledger (transaction_date, account_code, document_type, reference, debit_amount, credit_amount, text) VALUES ($1, $2, $3, $4, $5, $6, $7)`, 
            [`2026-${month}-${String(getRandomInt(1,28)).padStart(2,'0')}`, act.code, 'SA', `REF-${String(i).padStart(4,'0')}`, debit, credit, `Monthly entry for ${act.name}`]);
        }

        console.log("Seeding Fixed Assets...");
        const assets = [
            { id: 'ASSET-001', desc: 'Heavy Excavator Model X', class: 'Machinery', val: 4500000 },
            { id: 'ASSET-002', desc: 'HQ Office Building', class: 'Buildings', val: 12500000 },
            { id: 'ASSET-003', desc: 'Server Rack Alpha', class: 'IT Equipment', val: 850000 },
            { id: 'ASSET-004', desc: 'Delivery Truck Fleet A', class: 'Vehicles', val: 3200000 },
            { id: 'ASSET-005', desc: 'Warehouse Forklifts', class: 'Machinery', val: 950000 },
        ];
        for (const ast of assets) {
            const dep = ast.val * 0.15; // 15% depreciation
            const nbv = ast.val - dep;
            await pool.query(`INSERT INTO fi_fixed_assets (asset_id, description, asset_class, purchase_date, acquisition_val, accum_depreciation, net_book_val) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`, 
            [ast.id, ast.desc, ast.class, '2023-05-15', ast.val, dep, nbv]);
        }

        console.log("✅ All FI data seeded successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Error seeding FI data:", err);
        process.exit(1);
    }
}

seedFI();
