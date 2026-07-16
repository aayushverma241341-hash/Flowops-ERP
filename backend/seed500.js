const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const firstNames = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Mary", "Patricia", "Jennifer", "Linda", "Barbara", "Susan", "Jessica", "Sarah", "Karen", "Rahul", "Amit", "Raj", "Priya", "Neha", "Arjun", "Karan", "Pooja", "Vikram", "Sneha"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Sharma", "Singh", "Patel", "Kumar", "Gupta", "Desai", "Joshi", "Verma", "Reddy", "Rao"];
const posts = ["Electrician", "Plumber", "Site Supervisor", "Site Manager", "Engineer", "Technician", "Foreman", "Safety Officer", "Laborer", "Welder", "Carpenter"];
const categories = ["Unskilled", "Semi-Skilled", "Skilled", "Highly-Skilled"];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomMobile() {
    return '9' + Math.floor(10000000 + Math.random() * 90000000).toString() + Math.floor(Math.random() * 10).toString();
}

function generateRandomAadhar() {
    return Math.floor(100000000000 + Math.random() * 899999999999).toString();
}

async function seedEmployees() {
    try {
        console.log("Generating 500 random employees...");
        let values = [];
        
        for (let i = 0; i < 500; i++) {
            const firstName = firstNames[getRandomInt(0, firstNames.length - 1)];
            const lastName = lastNames[getRandomInt(0, lastNames.length - 1)];
            const name = `${firstName} ${lastName}`;
            const fatherName = `${firstNames[getRandomInt(0, firstNames.length - 1)]} ${lastName}`;
            
            // Random DOB between 1970 and 2000
            const year = getRandomInt(1970, 2000);
            const month = String(getRandomInt(1, 12)).padStart(2, '0');
            const day = String(getRandomInt(1, 28)).padStart(2, '0');
            const dob = `${year}-${month}-${day}`;
            
            const mobile = generateRandomMobile();
            const aadhar = generateRandomAadhar();
            const post = posts[getRandomInt(0, posts.length - 1)];
            const category = categories[getRandomInt(0, categories.length - 1)];
            
            values.push(`('${name.replace(/'/g, "''")}', '${fatherName.replace(/'/g, "''")}', '${dob}', '${mobile}', '${aadhar}', '${post}', '${category}')`);
        }

        console.log("Inserting into live database (this might take a few seconds)...");
        
        // Split into chunks of 100 to avoid giant SQL queries
        const chunkSize = 100;
        for (let i = 0; i < values.length; i += chunkSize) {
            const chunk = values.slice(i, i + chunkSize);
            const query = `INSERT INTO employees (name, father_name, date_of_birth, mobile_no, aadhar_no, post, category) VALUES ${chunk.join(',')} ON CONFLICT DO NOTHING;`;
            await pool.query(query);
            console.log(`Inserted ${i + chunk.length} / 500`);
        }
        
        console.log("SUCCESS! 500 employees have been added to your database.");
        process.exit(0);
    } catch (err) {
        console.error("Error seeding employees:", err);
        process.exit(1);
    }
}

seedEmployees();
