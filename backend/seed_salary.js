const db = require('./config/db');

async function seedSalary() {
  console.log("Starting Salary Seeding...");
  try {
    const employeesRes = await db.query('SELECT employee_id FROM employees');
    
    if (employeesRes.rows.length === 0) {
      console.log("No employees found. Cannot seed salaries.");
      return;
    }

    const employees = employeesRes.rows.map(r => r.employee_id);
    
    const month = 'June 2026';
    const statuses = ['Pending', 'Paid'];

    let count = 0;
    
    // Seed salaries for 100 random employees
    const numToSeed = Math.min(100, employees.length);
    
    // Shuffle and pick
    const shuffled = employees.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numToSeed);

    for (const empId of selected) {
      const basic_salary = (Math.random() * 10000 + 15000).toFixed(2); // 15k to 25k
      const allowances = (Math.random() * 2000 + 1000).toFixed(2);
      const deductions = (Math.random() * 500 + 200).toFixed(2);
      const net_salary = (parseFloat(basic_salary) + parseFloat(allowances) - parseFloat(deductions)).toFixed(2);
      
      const payment_status = statuses[Math.floor(Math.random() * statuses.length)];
      const payment_date = payment_status === 'Paid' ? new Date().toISOString() : null;

      await db.query(
        `INSERT INTO salaries (employee_id, month, basic_salary, allowances, deductions, net_salary, payment_status, payment_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT DO NOTHING`,
        [empId, month, basic_salary, allowances, deductions, net_salary, payment_status, payment_date]
      );
      count++;
    }

    console.log(`Successfully seeded ${count} salary records for ${month}!`);
  } catch (err) {
    console.error("Error seeding salary:", err);
  } finally {
    process.exit(0);
  }
}

seedSalary();
