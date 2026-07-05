const db = require('../config/db');

exports.getAllSites = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM sites ORDER BY site_id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getSiteById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM sites WHERE site_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Site not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getFullSiteDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const siteResult = await db.query('SELECT * FROM sites WHERE site_id = $1', [id]);
        if (siteResult.rows.length === 0) {
            return res.status(404).json({ message: 'Site not found' });
        }
        
        const site = siteResult.rows[0];
        
        let workOrder = null;
        if (site.wo_no) {
            const woResult = await db.query('SELECT * FROM work_orders WHERE wo_no = $1', [site.wo_no]);
            if (woResult.rows.length > 0) {
                workOrder = woResult.rows[0];
            }
        }
        
        const assignedResult = await db.query(`
            SELECT e.* 
            FROM employees e
            JOIN site_employees se ON e.employee_id = se.employee_id
            WHERE se.site_id = $1
            ORDER BY e.name ASC
        `, [id]);
        
        res.json({
            ...site,
            work_order: workOrder,
            assigned_employees: assignedResult.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createSite = async (req, res) => {
    try {
        let { site_name, wo_no, start_date, end_date, max_employees, location, employee_category } = req.body;
        wo_no = wo_no || null;
        start_date = start_date || new Date().toISOString().split('T')[0];
        end_date = end_date || null;
        max_employees = max_employees || null;
        employee_category = employee_category || null;
        
        const result = await db.query(
            `INSERT INTO sites (site_name, wo_no, start_date, end_date, max_employees, location, employee_category) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [site_name, wo_no, start_date, end_date, max_employees, location, employee_category]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.assignEmployee = async (req, res) => {
    try {
        const { site_id, employee_id } = req.body;
        const result = await db.query(
            `INSERT INTO site_employees (site_id, employee_id) VALUES ($1, $2) RETURNING *`,
            [site_id, employee_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
