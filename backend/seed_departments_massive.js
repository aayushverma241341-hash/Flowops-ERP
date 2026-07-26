const db = require('./config/db');
const fs = require('fs');

const seedMassiveDepartments = async () => {
  try {
    const prefixes = ['Global', 'Regional', 'Corporate', 'Enterprise', 'Digital', 'Strategic', 'Applied', 'Advanced', 'Core', 'Integrated'];
    const domains = ['Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations', 'Research', 'Development', 'Logistics', 'Procurement', 'Customer Success', 'Quality Assurance', 'Legal', 'Compliance', 'Information Technology', 'Security', 'Data Science', 'Product Management', 'Design', 'Facilities'];
    const suffixes = ['Group', 'Division', 'Unit', 'Department', 'Team', 'Hub', 'Center'];
    
    const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

    const departments = [];

    // Generate ~100 unique departments
    for (let i = 0; i < 100; i++) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      
      const head = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
      const budget = (Math.floor(Math.random() * 5000000) + 100000).toFixed(2);
      const desc = `Responsible for all aspects of ${domain.toLowerCase()} within the ${prefix.toLowerCase()} organization.`;

      departments.push({ name: `${prefix} ${domain} ${suffix}`, head, budget, desc });
    }

    console.log(`Inserting ${departments.length} departments...`);
    
    for (const dept of departments) {
      await db.query(
        'INSERT INTO departments (name, head_of_department, budget, description) VALUES ($1, $2, $3, $4)',
        [dept.name, dept.head, dept.budget, dept.desc]
      );
    }
    
    // Now get all department IDs
    const deptRes = await db.query('SELECT id FROM departments');
    const deptIds = deptRes.rows.map(r => r.id);
    
    // Assign a random department to all existing employees
    const empRes = await db.query('SELECT employee_id FROM employees');
    const empIds = empRes.rows.map(r => r.employee_id);
    
    console.log(`Assigning ${empIds.length} employees to random departments...`);
    
    for (const empId of empIds) {
      const randomDeptId = deptIds[Math.floor(Math.random() * deptIds.length)];
      await db.query('UPDATE employees SET department_id = $1 WHERE employee_id = $2', [randomDeptId, empId]);
    }

    console.log('Successfully seeded 100 departments and linked all employees!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding massive departments:', err);
    process.exit(1);
  }
};

seedMassiveDepartments();
