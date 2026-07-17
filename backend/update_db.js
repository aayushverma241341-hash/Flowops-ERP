const db = require('./config/db');
(async () => {
  try {
    // Shift all invoices from 2025 to 2026
    await db.query(`UPDATE invoices SET issue_date = issue_date + interval '1 year'`);
    console.log('Invoices updated to 2026.');
    
    // Check salaries distinct months
    const s = await db.query(`SELECT DISTINCT month FROM salaries`);
    console.log('Salary months:', s.rows);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})();
