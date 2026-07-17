const db = require('./config/db');
(async () => {
  try {
    const gl = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'fi_general_ledger'`);
    const ar = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'fi_accounts_receivable'`);
    const ap = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'fi_accounts_payable'`);
    
    console.log("GL:", gl.rows.map(r => r.column_name));
    console.log("AR:", ar.rows.map(r => r.column_name));
    console.log("AP:", ap.rows.map(r => r.column_name));
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})();
