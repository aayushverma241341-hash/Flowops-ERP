const db = require('../config/db');

exports.getProductionOrders = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM sap_production_orders ORDER BY start_date DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error fetching Production Orders' });
    }
};

exports.getMRPRuns = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM sap_mrp_runs ORDER BY run_date DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error fetching MRP Runs' });
    }
};

exports.getRoutings = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM sap_routings ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error fetching Routings' });
    }
};

exports.getBOMs = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM sap_boms ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error fetching BOMs' });
    }
};
