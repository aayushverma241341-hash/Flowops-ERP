const pool = require('../config/db');

// 1. Chart of Accounts
exports.getChartOfAccounts = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM fi_chart_of_accounts ORDER BY account_code ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error fetching Chart of Accounts' });
    }
};

// 2. Accounts Receivable
exports.getAccountsReceivable = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM fi_accounts_receivable ORDER BY due_date ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error fetching Accounts Receivable' });
    }
};

// 3. Accounts Payable
exports.getAccountsPayable = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM fi_accounts_payable ORDER BY due_date ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error fetching Accounts Payable' });
    }
};

// 4. General Ledger
exports.getGeneralLedger = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM fi_general_ledger ORDER BY transaction_date DESC, id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error fetching General Ledger' });
    }
};

// 5. Fixed Assets
exports.getFixedAssets = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM fi_fixed_assets ORDER BY purchase_date DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error fetching Fixed Assets' });
    }
};
