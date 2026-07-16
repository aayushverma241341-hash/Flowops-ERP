const db = require('./config/db');
(async () => {
  try {
    const res = await db.query(`
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
          GROUP BY month
      )
      SELECT m.month, 
             COALESCE(r.revenue, 0) as revenue,
             COALESCE(p.payroll, 0) as payroll
      FROM months m
      LEFT JOIN monthly_revenue r ON m.month = r.month
      LEFT JOIN monthly_payroll p ON m.month = p.month
      ORDER BY m.month_date ASC
    `);
    console.log(res.rows);
    process.exit(0);
  } catch (err) {
    console.error('SQL ERROR:', err);
    process.exit(1);
  }
})();
