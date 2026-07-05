const db = require('./config/db');

async function migrate() {
    try {
        console.log("Adding copy_file_path to work_orders...");
        await db.query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS copy_file_path VARCHAR(255);`);
        
        console.log("Adding employee_category to sites...");
        await db.query(`ALTER TABLE sites ADD COLUMN IF NOT EXISTS employee_category VARCHAR(100);`);
        
        console.log("Migration successful");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit();
    }
}

migrate();
