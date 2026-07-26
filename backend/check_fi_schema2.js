const db = require('./config/db');
(async () => {
  try {
    const coa = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'fi_chart_of_accounts'`);
    const fa = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'fi_fixed_assets'`);
    
    console.log("COA:", coa.rows.map(r => r.column_name));
    console.log("FA:", fa.rows.map(r => r.column_name));
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})();
