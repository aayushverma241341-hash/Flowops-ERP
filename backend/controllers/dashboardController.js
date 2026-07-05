const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        // Run all count queries in parallel
        const [
            employeesCountResult,
            activeWorkOrdersCountResult,
            activeSitesCountResult,
            payrollSumResult,
            recentEmployeesResult,
            recentInvoicesResult
        ] = await Promise.all([
            db.query('SELECT COUNT(*) FROM employees'),
            db.query('SELECT COUNT(*) FROM work_orders WHERE end_date IS NULL OR end_date >= CURRENT_DATE'),
            db.query('SELECT COUNT(*) FROM sites'),
            db.query('SELECT SUM(net_salary) FROM salaries WHERE payment_status = $1', ['Paid']),
            db.query('SELECT employee_id, name, category, post FROM employees ORDER BY employee_id DESC LIMIT 3'),
            db.query(`
                SELECT i.invoice_id, i.wo_no, i.amount, i.status, s.site_name
                FROM invoices i
                LEFT JOIN sites s ON i.site_id = s.site_id
                ORDER BY i.issue_date DESC
                LIMIT 3
            `)
        ]);

        const stats = {
            totalEmployees: parseInt(employeesCountResult.rows[0].count, 10),
            activeWorkOrders: parseInt(activeWorkOrdersCountResult.rows[0].count, 10),
            activeSites: parseInt(activeSitesCountResult.rows[0].count, 10),
            monthlyPayroll: parseFloat(payrollSumResult.rows[0].sum || 0),
            recentEmployees: recentEmployeesResult.rows,
            recentInvoices: recentInvoicesResult.rows
        };

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching dashboard stats' });
    }
};
