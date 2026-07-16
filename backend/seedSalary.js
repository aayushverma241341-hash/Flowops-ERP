const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedSalaries() {
    try {
        console.log("Fetching existing employees...");
        const empResult = await pool.query('SELECT employee_id, category FROM employees');
        const employees = empResult.rows;
        
        if (employees.length === 0) {
            console.log("Error: You need employees in the DB first.");
            process.exit(1);
        }

        console.log(`Found ${employees.length} employees.`);
        console.log("Generating June 2026 Salary records...");

        const salaryValues = [];
        const monthStr = 'June 2026';
        const paymentDate = '2026-07-05';

        for (let i = 0; i < employees.length; i++) {
            const emp = employees[i];
            
            // Base salary logic based on category
            let basic_salary = 15000;
            if (emp.category === 'Highly-Skilled') basic_salary = 35000;
            else if (emp.category === 'Skilled') basic_salary = 25000;
            else if (emp.category === 'Semi-Skilled') basic_salary = 18000;
            else if (emp.category === 'Unskilled') basic_salary = 12000;

            const allowances = getRandomInt(1000, 5000);
            
            // Randomly some employees have deductions (e.g. for leave)
            const hasDeduction = Math.random() > 0.7;
            const deductions = hasDeduction ? getRandomInt(500, 2000) : 0;
            
            const net_salary = basic_salary + allowances - deductions;
            
            // 80% paid, 20% pending
            const status = Math.random() > 0.2 ? 'Paid' : 'Pending';
            const payDateVal = status === 'Paid' ? `'${paymentDate}'` : 'NULL';

            salaryValues.push(`(${emp.employee_id}, '${monthStr}', ${basic_salary}, ${allowances}, ${deductions}, ${net_salary}, '${status}', ${payDateVal})`);
        }

        // Insert in chunks to avoid query length limits
        let count = 0;
        for (let i = 0; i < salaryValues.length; i += 100) {
            const chunk = salaryValues.slice(i, i + 100);
            await pool.query(`INSERT INTO salaries (employee_id, month, basic_salary, allowances, deductions, net_salary, payment_status, payment_date) VALUES ${chunk.join(',')} ON CONFLICT DO NOTHING;`);
            count += chunk.length;
        }

        console.log(`✅ SUCCESS! Generated ${count} salary slips for ${monthStr}.`);
        process.exit(0);
    } catch (err) {
        console.error("Error seeding salary data:", err);
        process.exit(1);
    }
}

seedSalaries();
