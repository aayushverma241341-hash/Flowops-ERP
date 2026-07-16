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
            recentInvoicesResult,
            trendDataResult,
            siteDataResult
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
            `),
            db.query(`
                WITH months AS (
                    SELECT to_char(date_trunc('month', current_date - interval '5 months' + (n || ' months')::interval), 'Mon YYYY') as month,
                           date_trunc('month', current_date - interval '5 months' + (n || ' months')::interval) as month_date
                    FROM generate_series(0, 5) n
                ),
                monthly_revenue AS (
                    SELECT to_char(date_trunc('month', issue_date), 'Mon YYYY') as month,
                           SUM(amount) as revenue
                    FROM invoices
                    WHERE issue_date >= date_trunc('month', current_date - interval '5 months')
                    GROUP BY 1
                ),
                monthly_payroll AS (
                    SELECT month, SUM(net_salary) as payroll
                    FROM salaries
                    -- Since salaries table has month as 'Month YYYY', we can just match it
                    GROUP BY month
                )
                SELECT m.month, 
                       COALESCE(r.revenue, 0) as revenue,
                       COALESCE(p.payroll, 0) as payroll
                FROM months m
                LEFT JOIN monthly_revenue r ON m.month = r.month
                LEFT JOIN monthly_payroll p ON m.month = p.month
                ORDER BY m.month_date ASC
            `),
            db.query(`
                SELECT s.site_name as site, COUNT(DISTINCT a.employee_id) as employees
                FROM sites s
                LEFT JOIN attendance a ON s.site_id = a.site_id AND a.date >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY s.site_name
                HAVING COUNT(DISTINCT a.employee_id) > 0
                ORDER BY employees DESC
                LIMIT 5
            `)
        ]);

        const stats = {
            totalEmployees: parseInt(employeesCountResult.rows[0].count, 10),
            activeWorkOrders: parseInt(activeWorkOrdersCountResult.rows[0].count, 10),
            activeSites: parseInt(activeSitesCountResult.rows[0].count, 10),
            monthlyPayroll: parseFloat(payrollSumResult.rows[0].sum || 0),
            recentEmployees: recentEmployeesResult.rows,
            recentInvoices: recentInvoicesResult.rows,
            trendData: trendDataResult ? trendDataResult.rows : [],
            siteData: siteDataResult ? siteDataResult.rows : []
        };

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching dashboard stats' });
    }
};
