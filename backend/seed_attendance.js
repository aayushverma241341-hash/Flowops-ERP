const db = require('./config/db');

async function seedAttendance() {
  console.log("Starting Attendance Seeding...");
  try {
    // Get all employees and sites
    const employeesRes = await db.query('SELECT employee_id FROM employees');
    const sitesRes = await db.query('SELECT site_id FROM sites');
    
    if (employeesRes.rows.length === 0 || sitesRes.rows.length === 0) {
      console.log("No employees or sites found. Cannot seed attendance.");
      return;
    }

    const employees = employeesRes.rows.map(r => r.employee_id);
    const sites = sitesRes.rows.map(r => r.site_id);
    const statuses = ['Present', 'Present', 'Present', 'Absent', 'Leave', 'Half-Day'];

    // We will seed attendance for the last 5 days
    const today = new Date();
    
    let valueStrings = [];
    let queryValues = [];
    let paramIndex = 1;

    for (let i = 0; i < 5; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() - i);
      const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD

      for (const empId of employees) {
        // Assign random site and status
        const siteId = sites[Math.floor(Math.random() * sites.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Random check-in check-out around 9 AM to 5 PM
        const checkIn = new Date(currentDate);
        checkIn.setHours(9, Math.floor(Math.random() * 60), 0);
        
        const checkOut = new Date(currentDate);
        checkOut.setHours(17, Math.floor(Math.random() * 60), 0);

        let checkInTime = status === 'Absent' || status === 'Leave' ? null : checkIn.toISOString();
        let checkOutTime = status === 'Absent' || status === 'Leave' ? null : checkOut.toISOString();

        queryValues.push(empId, dateString, checkInTime, checkOutTime, status, siteId);
        valueStrings.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);

        // Batch insert every 500 rows
        if (valueStrings.length >= 500) {
          await db.query(`
            INSERT INTO attendance (employee_id, date, check_in_time, check_out_time, status, site_id)
            VALUES ${valueStrings.join(', ')}
            ON CONFLICT (employee_id, date) DO NOTHING
          `, queryValues);
          valueStrings = [];
          queryValues = [];
          paramIndex = 1;
        }
      }
    }

    // Insert any remaining rows
    if (valueStrings.length > 0) {
      await db.query(`
        INSERT INTO attendance (employee_id, date, check_in_time, check_out_time, status, site_id)
        VALUES ${valueStrings.join(', ')}
        ON CONFLICT (employee_id, date) DO NOTHING
      `, queryValues);
    }

    console.log("Successfully seeded attendance for the last 5 days!");
  } catch (err) {
    console.error("Error seeding attendance:", err);
  } finally {
    process.exit(0);
  }
}

seedAttendance();
