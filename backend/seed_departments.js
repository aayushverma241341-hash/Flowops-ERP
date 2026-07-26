const db = require('./config/db');

const seedDepartments = async () => {
  try {
    const departments = [
      { name: 'Engineering & Development', head: 'Alice Johnson', budget: 1500000.00, desc: 'Software development, IT infrastructure, and product engineering.' },
      { name: 'Human Resources (HR)', head: 'Robert Smith', budget: 250000.00, desc: 'Employee relations, recruitment, and payroll.' },
      { name: 'Finance & Accounting', head: 'Sarah Williams', budget: 500000.00, desc: 'Financial planning, accounting, and audits.' },
      { name: 'Sales & Marketing', head: 'James Brown', budget: 850000.00, desc: 'Client acquisition, branding, and market research.' },
      { name: 'Production Planning', head: 'Michael Davis', budget: 1200000.00, desc: 'Manufacturing operations and material requirements planning.' },
      { name: 'Warehouse Management', head: 'Emily Wilson', budget: 600000.00, desc: 'Inventory control, logistics, and supply chain.' },
      { name: 'Procurement', head: 'David Miller', budget: 400000.00, desc: 'Vendor management and purchasing.' },
      { name: 'Customer Support', head: 'Jessica Taylor', budget: 300000.00, desc: 'Client relations and technical support.' }
    ];

    for (const dept of departments) {
      await db.query(
        'INSERT INTO departments (name, head_of_department, budget, description) VALUES ($1, $2, $3, $4)',
        [dept.name, dept.head, dept.budget, dept.desc]
      );
    }
    
    console.log('Successfully seeded 8 departments!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding departments:', err);
    process.exit(1);
  }
};

seedDepartments();
