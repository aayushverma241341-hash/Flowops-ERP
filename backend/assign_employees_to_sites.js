const db = require('./config/db');
const { fakerEN_IN: faker } = require('@faker-js/faker');

async function assignEmployees() {
  console.log("Starting employee assignment to sites...");
  try {
    // Fetch all employees and sites
    const { rows: employees } = await db.query('SELECT employee_id FROM employees');
    const { rows: sites } = await db.query('SELECT site_id FROM sites');
    
    if (employees.length === 0 || sites.length === 0) {
      console.log("Ensure you have generated employees and sites first!");
      process.exit(1);
    }

    console.log(`Assigning ${employees.length} employees to ${sites.length} sites...`);

    // Clear existing assignments
    await db.query('TRUNCATE TABLE site_employees CASCADE');
    await db.query('BEGIN');

    // Batch insertions
    let values = [];
    let valueStrings = [];
    let paramCounter = 1;

    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      // Randomly pick a site
      const site = faker.helpers.arrayElement(sites);
      
      const dateAssigned = faker.date.recent({ days: 30 }); // assigned sometime in the last 30 days
      
      values.push(site.site_id, employee.employee_id, dateAssigned);
      valueStrings.push(`($${paramCounter++}, $${paramCounter++}, $${paramCounter++})`);

      if ((i + 1) % 100 === 0 || i === employees.length - 1) {
        await db.query(`
          INSERT INTO site_employees (site_id, employee_id, date_assigned)
          VALUES ${valueStrings.join(', ')}
        `, values);
        
        values = [];
        valueStrings = [];
        paramCounter = 1;
      }
    }

    await db.query('COMMIT');
    console.log("Successfully assigned all employees to sites!");

  } catch (error) {
    await db.query('ROLLBACK');
    console.error("Error assigning employees to sites:", error);
  } finally {
    process.exit();
  }
}

assignEmployees();
