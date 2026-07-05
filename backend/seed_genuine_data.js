const db = require('./config/db');
const { fakerEN_IN: faker } = require('@faker-js/faker');

async function seedGenuineData() {
  console.log("Starting genuine data generation...");
  try {
    // 1. Clear existing data
    console.log("Clearing old data (Employees, Work Orders, Sites, and dependencies)...");
    await db.query(`TRUNCATE TABLE employees, work_orders, sites CASCADE;`);

    await db.query('BEGIN');

    // 2. Generate 5 Work Orders
    console.log("Generating 5 Work Orders...");
    const wo_nos = [];
    for (let i = 1; i <= 5; i++) {
      const wo_no = `WO-${faker.string.alphanumeric({ length: 4, casing: 'upper' })}-${faker.date.past({ years: 1 }).getFullYear()}`;
      wo_nos.push(wo_no);
      
      const issueDate = faker.date.past({ years: 1 });
      const endDate = faker.date.future({ years: 1, refDate: issueDate });
      
      await db.query(`
        INSERT INTO work_orders (wo_no, issue_date, end_date, description)
        VALUES ($1, $2, $3, $4)
      `, [
        wo_no,
        issueDate,
        endDate,
        `${faker.company.catchPhrase()} Project - ${faker.commerce.department()} Renovation/Construction`
      ]);
    }

    // 3. Generate 15 Sites
    console.log("Generating 15 Sites...");
    const sites = [];
    for (let i = 1; i <= 15; i++) {
      const wo_no = faker.helpers.arrayElement(wo_nos);
      const siteName = `${faker.location.city()} ${faker.company.buzzNoun().charAt(0).toUpperCase() + faker.company.buzzNoun().slice(1)} Hub`;
      
      const startDate = faker.date.past({ years: 1 });
      const endDate = faker.date.future({ years: 2, refDate: startDate });
      
      const newSite = {
        name: siteName,
        wo_no,
        start_date: startDate,
        end_date: endDate,
        max_employees: faker.number.int({ min: 20, max: 200 }),
        location: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()}`,
        employee_category: faker.helpers.arrayElement(['Skilled', 'Semi-Skilled', 'Mixed'])
      };
      
      await db.query(`
        INSERT INTO sites (site_name, wo_no, start_date, end_date, max_employees, location, employee_category)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        newSite.name,
        newSite.wo_no,
        newSite.start_date,
        newSite.end_date,
        newSite.max_employees,
        newSite.location,
        newSite.employee_category
      ]);
    }

    // 4. Generate 500 Employees
    console.log("Generating 500 Employees...");
    const categories = ['Skilled', 'Semi-Skilled', 'Unskilled'];
    const posts = ['Engineer', 'Technician', 'Electrician', 'Plumber', 'Supervisor', 'Manager', 'Laborer', 'Foreman', 'Welder'];
    
    // Batch inserts
    let employeeValues = [];
    let valueStrings = [];
    let paramCounter = 1;
    
    for (let i = 1; i <= 500; i++) {
      const gender = faker.helpers.arrayElement(['male', 'female']);
      const name = faker.person.fullName({ sex: gender });
      const father_name = faker.person.fullName({ sex: 'male' });
      const date_of_birth = faker.date.birthdate({ min: 18, max: 60, mode: 'age' });
      
      // Realistic Indian IDs
      const uan_no = faker.string.numeric(12); // UAN is usually 12 digits
      const esic_no = faker.string.numeric(10); // ESIC is usually 10 digits
      const bank_account_no = faker.finance.accountNumber(12);
      const ifsc_no = `${faker.string.alpha({ length: 4, casing: 'upper' })}0${faker.string.numeric(6)}`; // e.g. HDFC0123456
      const mobile_no = faker.phone.number({ style: 'national' }); // e.g., 9876543210
      const aadhar_no = faker.string.numeric(12);
      
      const post = faker.helpers.arrayElement(posts);
      const category = faker.helpers.arrayElement(categories);

      employeeValues.push(name, father_name, date_of_birth, uan_no, esic_no, bank_account_no, ifsc_no, mobile_no, aadhar_no, post, category);
      
      const placeholders = [];
      for(let j=0; j<11; j++) {
        placeholders.push(`$${paramCounter++}`);
      }
      valueStrings.push(`(${placeholders.join(', ')})`);

      // execute batch every 100 rows
      if (i % 100 === 0) {
        await db.query(`
          INSERT INTO employees (name, father_name, date_of_birth, uan_no, esic_no, bank_account_no, ifsc_no, mobile_no, aadhar_no, post, category)
          VALUES ${valueStrings.join(', ')}
        `, employeeValues);
        
        employeeValues = [];
        valueStrings = [];
        paramCounter = 1;
      }
    }

    await db.query('COMMIT');
    console.log("Genuine dummy data inserted successfully!");

  } catch (error) {
    await db.query('ROLLBACK');
    console.error("Error inserting data:", error);
  } finally {
    process.exit();
  }
}

seedGenuineData();
