const db = require('./config/db');

async function run() {
  try {
    const emps = await db.query('SELECT employee_id FROM employees');
    const sites = await db.query('SELECT site_id FROM sites');
    
    if (emps.rows.length === 0 || sites.rows.length === 0) {
      console.log('No employees or sites');
      return;
    }
    
    let values = [];
    let params = [];
    let i = 1;
    
    for (const e of emps.rows) {
      const siteId = sites.rows[Math.floor(Math.random() * sites.rows.length)].site_id;
      values.push(`($${i++}, $${i++})`);
      params.push(siteId, e.employee_id);
      
      if (values.length >= 500) {
        await db.query(`INSERT INTO site_employees (site_id, employee_id) VALUES ${values.join(',')} ON CONFLICT DO NOTHING`, params);
        values = [];
        params = [];
        i = 1;
      }
    }
    
    if (values.length > 0) {
      await db.query(`INSERT INTO site_employees (site_id, employee_id) VALUES ${values.join(',')} ON CONFLICT DO NOTHING`, params);
    }
    
    console.log('Done mapping employees to sites!');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
