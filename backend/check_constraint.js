const db = require('./config/db');
(async () => {
  const res = await db.query(`
    SELECT pg_get_constraintdef(c.oid)
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'fi_chart_of_accounts' AND c.conname = 'fi_chart_of_accounts_statement_type_check'
  `);
  console.log(res.rows[0]);
  process.exit(0);
})();
