
const db = require('./config/db');
(async () => {
  try {
    const inv = await db.query('SELECT issue_date, amount FROM invoices');
    console.log('Invoices:', inv.rows);
    
    const sal = await db.query('SELECT month, net_salary FROM salaries');
    console.log('Salaries:', sal.rows);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})();

