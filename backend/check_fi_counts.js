const db = require('./config/db');
(async () => {
  try {
    const gl = await db.query(`SELECT COUNT(*) FROM fi_general_ledger`);
    const ar = await db.query(`SELECT COUNT(*) FROM fi_accounts_receivable`);
    const ap = await db.query(`SELECT COUNT(*) FROM fi_accounts_payable`);
    
    console.log("GL count:", gl.rows[0].count);
    console.log("AR count:", ar.rows[0].count);
    console.log("AP count:", ap.rows[0].count);
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})();
