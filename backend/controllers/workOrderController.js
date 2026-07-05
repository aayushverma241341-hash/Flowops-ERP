const db = require('../config/db');

exports.getAllWorkOrders = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM work_orders ORDER BY issue_date DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getWorkOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM work_orders WHERE wo_no = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Work Order not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getFullWorkOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const woResult = await db.query('SELECT * FROM work_orders WHERE wo_no = $1', [id]);
        if (woResult.rows.length === 0) {
            return res.status(404).json({ message: 'Work Order not found' });
        }
        
        const workOrder = woResult.rows[0];
        const sitesResult = await db.query('SELECT * FROM sites WHERE wo_no = $1 ORDER BY site_id DESC', [id]);
        
        res.json({
            ...workOrder,
            sites: sitesResult.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createWorkOrder = async (req, res) => {
    try {
        let { wo_no, issue_date, end_date, description } = req.body;
        end_date = end_date || null;
        let copy_file_path = req.file ? req.file.path : null;
        
        const result = await db.query(
            `INSERT INTO work_orders (wo_no, issue_date, end_date, description, copy_file_path) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [wo_no, issue_date, end_date, description, copy_file_path]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
};

exports.updateWorkOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { issue_date, end_date, description } = req.body;
        const result = await db.query(
            `UPDATE work_orders SET issue_date=$1, end_date=$2, description=$3 
            WHERE wo_no=$4 RETURNING *`,
            [issue_date, end_date, description, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Work Order not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteWorkOrder = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM work_orders WHERE wo_no = $1', [id]);
        res.json({ message: 'Work Order deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
