const db = require('./config/db');

(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        head_of_department VARCHAR(255),
        budget NUMERIC(15, 2) DEFAULT 0,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('departments table created/verified.');

    // Check if department_id exists on employees
    const res = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'employees' AND column_name = 'department_id'
    `);
    
    if (res.rows.length === 0) {
      await db.query('ALTER TABLE employees ADD COLUMN department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL');
      console.log('Added department_id to employees.');
    } else {
      console.log('department_id already exists on employees.');
    }

    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})();
