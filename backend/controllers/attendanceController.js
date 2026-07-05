const db = require('../config/db');

exports.markAttendance = async (req, res) => {
    try {
        const { employee_id, date, status, site_id } = req.body;
        // Check if attendance already exists for this date
        const existing = await db.query('SELECT * FROM attendance WHERE employee_id = $1 AND date = $2', [employee_id, date]);
        
        let result;
        if (existing.rows.length > 0) {
            // Update
            result = await db.query(
                `UPDATE attendance SET status=$1, site_id=$2, check_out_time=CURRENT_TIMESTAMP WHERE attendance_id=$3 RETURNING *`,
                [status, site_id, existing.rows[0].attendance_id]
            );
        } else {
            // Insert
            result = await db.query(
                `INSERT INTO attendance (employee_id, date, status, site_id, check_in_time) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *`,
                [employee_id, date, status, site_id]
            );
        }
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMonthlyAttendance = async (req, res) => {
    try {
        const { month, year } = req.query; // e.g., 04, 2024
        const result = await db.query(
            `SELECT a.*, e.name as employee_name FROM attendance a 
            JOIN employees e ON a.employee_id = e.employee_id
            WHERE EXTRACT(MONTH FROM a.date) = $1 AND EXTRACT(YEAR FROM a.date) = $2
            ORDER BY a.date DESC`,
            [month, year]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.markBulkAttendance = async (req, res) => {
    try {
        const { site_id, records } = req.body;
        if (!site_id || !Array.isArray(records)) {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        // We use a transaction for bulk update
        await db.query('BEGIN');

        for (const record of records) {
            const { employee_id, date, status } = record;
            
            const existing = await db.query('SELECT attendance_id FROM attendance WHERE employee_id = $1 AND date = $2', [employee_id, date]);
            
            if (existing.rows.length > 0) {
                await db.query(
                    `UPDATE attendance SET status=$1, site_id=$2 WHERE attendance_id=$3`,
                    [status, site_id, existing.rows[0].attendance_id]
                );
            } else {
                await db.query(
                    `INSERT INTO attendance (employee_id, date, status, site_id, check_in_time) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
                    [employee_id, date, status, site_id]
                );
            }
        }

        await db.query('COMMIT');
        res.status(200).json({ message: 'Bulk attendance saved successfully' });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Server error during bulk save' });
    }
};
