require('dotenv').config();
const db = require('./config/db');

async function seedFI() {
  try {
    console.log('Starting FI Seeding with Expanded Data...');

    // Clear existing data
    await db.query('TRUNCATE TABLE fi_general_ledger CASCADE');
    await db.query('TRUNCATE TABLE fi_chart_of_accounts CASCADE');
    await db.query('TRUNCATE TABLE fi_accounts_receivable CASCADE');
    await db.query('TRUNCATE TABLE fi_accounts_payable CASCADE');
    await db.query('TRUNCATE TABLE fi_fixed_assets CASCADE');

    // 1. Chart of Accounts
    const coaData = [
      ['1000', 'Cash in Hand', 'Asset', 250000.00],
      ['1010', 'HDFC Bank Current Account', 'Asset', 3500000.00],
      ['1020', 'SBI Savings Account', 'Asset', 1200000.00],
      ['1200', 'Accounts Receivable - Domestic', 'Asset', 1450000.00],
      ['1210', 'Accounts Receivable - International', 'Asset', 850000.00],
      ['1500', 'Machinery & Equipment', 'Asset', 8000000.00],
      ['1510', 'IT & Computer Equipment', 'Asset', 1200000.00],
      ['1520', 'Vehicles & Logistics', 'Asset', 2500000.00],
      ['2000', 'Accounts Payable - Domestic', 'Liability', 720000.00],
      ['2010', 'Accounts Payable - International', 'Liability', 450000.00],
      ['2100', 'Short Term Bank Loan', 'Liability', 1000000.00],
      ['2200', 'Taxes Payable (GST)', 'Liability', 180000.00],
      ['3000', 'Share Capital', 'Equity', 10000000.00],
      ['3100', 'Retained Earnings', 'Equity', 5000000.00],
      ['4000', 'Product Sales Revenue', 'Revenue', 15000000.00],
      ['4100', 'Service & Consulting Revenue', 'Revenue', 4500000.00],
      ['5000', 'Cost of Goods Sold (COGS)', 'Expense', 8000000.00],
      ['6000', 'Employee Salaries', 'Expense', 2400000.00],
      ['6100', 'Office Rent & Maintenance', 'Expense', 600000.00],
      ['6200', 'IT & Software Licenses', 'Expense', 350000.00],
      ['6300', 'Travel & Transport', 'Expense', 280000.00]
    ];
    for (const row of coaData) {
      await db.query(
        'INSERT INTO fi_chart_of_accounts (account_code, account_name, account_type, balance) VALUES ($1, $2, $3, $4)',
        row
      );
    }

    // 2. Accounts Receivable
    const arData = [
      ['INV-R-001', 'Reliance Industries', 125000.00, '2026-07-01', 'Open'],
      ['INV-R-002', 'Tata Motors', 85000.00, '2026-06-15', 'Overdue'],
      ['INV-R-003', 'Infosys Tech', 240000.00, '2026-07-10', 'Open'],
      ['INV-R-004', 'Wipro Ltd', 55000.00, '2026-07-05', 'Open'],
      ['INV-R-005', 'Larsen & Toubro', 320000.00, '2026-06-10', 'Paid'],
      ['INV-R-006', 'Mahindra Group', 180000.00, '2026-06-25', 'Open'],
      ['INV-R-007', 'HDFC Bank (Vendor IT)', 95000.00, '2026-06-18', 'Overdue'],
      ['INV-R-008', 'Adani Enterprises', 450000.00, '2026-07-20', 'Open'],
      ['INV-R-009', 'Tech Mahindra', 115000.00, '2026-07-12', 'Open'],
      ['INV-R-010', 'State Bank of India', 75000.00, '2026-06-05', 'Paid'],
      ['INV-R-011', 'Maruti Suzuki', 210000.00, '2026-07-18', 'Open'],
      ['INV-R-012', 'Sun Pharma', 65000.00, '2026-06-28', 'Open'],
      ['INV-R-013', 'TCS', 340000.00, '2026-07-25', 'Open'],
      ['INV-R-014', 'ITC Limited', 135000.00, '2026-06-12', 'Overdue'],
      ['INV-R-015', 'Bajaj Auto', 90000.00, '2026-07-08', 'Open']
    ];
    for (const row of arData) {
      await db.query(
        'INSERT INTO fi_accounts_receivable (invoice_number, customer_name, amount, due_date, status) VALUES ($1, $2, $3, $4, $5)',
        row
      );
    }

    // 3. Accounts Payable
    const apData = [
      ['INV-P-001', 'Amazon Web Services', 45000.00, '2026-07-05', 'Open'],
      ['INV-P-002', 'Global Logistics', 120000.00, '2026-06-20', 'Overdue'],
      ['INV-P-003', 'Office Supplies Inc', 15500.00, '2026-07-15', 'Open'],
      ['INV-P-004', 'Dell Technologies', 350000.00, '2026-06-10', 'Paid'],
      ['INV-P-005', 'WeWork India', 280000.00, '2026-07-01', 'Open'],
      ['INV-P-006', 'BlueDart Express', 25000.00, '2026-06-25', 'Open'],
      ['INV-P-007', 'Oracle Corporation', 180000.00, '2026-06-18', 'Overdue'],
      ['INV-P-008', 'Cisco Systems', 220000.00, '2026-07-20', 'Open'],
      ['INV-P-009', 'Local Cleaning Co.', 12000.00, '2026-07-12', 'Open'],
      ['INV-P-010', 'Microsoft India', 195000.00, '2026-06-05', 'Paid'],
      ['INV-P-011', 'Tata Power', 45000.00, '2026-07-18', 'Open'],
      ['INV-P-012', 'Jio Telecommunications', 18000.00, '2026-06-28', 'Open'],
      ['INV-P-013', 'HP Enterprise', 140000.00, '2026-07-25', 'Open'],
      ['INV-P-014', 'Legal Consult LLP', 85000.00, '2026-06-12', 'Overdue'],
      ['INV-P-015', 'Zomato Corporate', 14000.00, '2026-07-08', 'Open']
    ];
    for (const row of apData) {
      await db.query(
        'INSERT INTO fi_accounts_payable (invoice_number, vendor_name, amount, due_date, status) VALUES ($1, $2, $3, $4, $5)',
        row
      );
    }

    // 4. General Ledger
    const glData = [
      ['2026-06-01', 'DOC-001', 'Initial Capital Investment', '1010', 5000000.00, 0],
      ['2026-06-01', 'DOC-002', 'Equity Allocation', '3000', 0, 5000000.00],
      ['2026-06-05', 'DOC-003', 'Payment from L&T', '1010', 320000.00, 0],
      ['2026-06-05', 'DOC-004', 'Reduce AR - L&T', '1200', 0, 320000.00],
      ['2026-06-05', 'DOC-005', 'Payment from SBI', '1010', 75000.00, 0],
      ['2026-06-05', 'DOC-006', 'Reduce AR - SBI', '1200', 0, 75000.00],
      ['2026-06-10', 'DOC-007', 'Paid Dell Technologies', '2000', 350000.00, 0],
      ['2026-06-10', 'DOC-008', 'Cash Outflow Dell', '1010', 0, 350000.00],
      ['2026-06-10', 'DOC-009', 'Paid Microsoft', '2000', 195000.00, 0],
      ['2026-06-10', 'DOC-010', 'Cash Outflow Microsoft', '1010', 0, 195000.00],
      ['2026-06-15', 'DOC-011', 'Product Sales Revenue', '1200', 85000.00, 0],
      ['2026-06-15', 'DOC-012', 'Sales Revenue Account', '4000', 0, 85000.00],
      ['2026-06-18', 'DOC-013', 'Consulting Service Billing', '1200', 95000.00, 0],
      ['2026-06-18', 'DOC-014', 'Service Revenue Account', '4100', 0, 95000.00],
      ['2026-06-20', 'DOC-015', 'Logistics Invoice Received', '5000', 120000.00, 0],
      ['2026-06-20', 'DOC-016', 'Increase AP - Logistics', '2000', 0, 120000.00],
      ['2026-06-25', 'DOC-017', 'Rent Payment', '6100', 280000.00, 0],
      ['2026-06-25', 'DOC-018', 'Cash Outflow Rent', '1010', 0, 280000.00],
      ['2026-06-30', 'DOC-019', 'Salary Disbursement', '6000', 1400000.00, 0],
      ['2026-06-30', 'DOC-020', 'Cash Outflow Salary', '1010', 0, 1400000.00]
    ];
    for (const row of glData) {
      await db.query(
        'INSERT INTO fi_general_ledger (transaction_date, document_number, description, account_code, debit, credit) VALUES ($1, $2, $3, $4, $5, $6)',
        row
      );
    }

    // 5. Fixed Assets
    const faData = [
      ['AST-001', 'Heavy Excavator Model X', 'Machinery', '2023-01-15', 4500000.00, 3100000.00, 'Active'],
      ['AST-002', 'Server Rack Unit A', 'IT Equipment', '2024-06-01', 500000.00, 400000.00, 'Active'],
      ['AST-003', 'Delivery Truck - Tata 407', 'Vehicles', '2022-11-20', 1200000.00, 600000.00, 'Active'],
      ['AST-004', 'Corporate Office Furniture', 'Furniture', '2023-05-10', 800000.00, 650000.00, 'Active'],
      ['AST-005', 'Developer Laptops (Batch 1)', 'IT Equipment', '2025-01-15', 1500000.00, 1200000.00, 'Active'],
      ['AST-006', 'Forklift Model Y', 'Machinery', '2021-08-22', 1800000.00, 450000.00, 'Retired'],
      ['AST-007', 'Network Switches & Routers', 'IT Equipment', '2024-09-10', 350000.00, 280000.00, 'Active'],
      ['AST-008', 'Executive Vehicles (SUVs)', 'Vehicles', '2025-03-05', 4500000.00, 3800000.00, 'Active'],
      ['AST-009', 'Diesel Generator Set', 'Machinery', '2022-02-18', 950000.00, 500000.00, 'Active'],
      ['AST-010', 'Conference Room AV System', 'IT Equipment', '2024-11-05', 420000.00, 350000.00, 'Active']
    ];
    for (const row of faData) {
      await db.query(
        'INSERT INTO fi_fixed_assets (asset_number, asset_name, asset_class, purchase_date, purchase_value, current_book_value, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        row
      );
    }

    console.log('FI Seeding with Expanded Data completed successfully.');
  } catch (error) {
    console.error('Error in FI Seeding:', error);
  } finally {
    process.exit();
  }
}

seedFI();
