const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const projects = ["Renovation of", "Construction of", "Maintenance for", "Electrical wiring at", "Plumbing overhaul for", "HVAC installation at", "Structural repair of", "Painting and interior work at", "Security system setup for", "Landscaping at"];
const locations = ["City Mall", "Downtown Office", "Central Hospital", "High School Campus", "Residential Complex", "Tech Park Building A", "Suburban Clinic", "Metro Station", "Airport Terminal 2", "University Library"];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedWorkOrders() {
    try {
        console.log("Generating 100 random work orders...");
        let values = [];
        
        for (let i = 1; i <= 100; i++) {
            const wo_no = `WO-2026-${String(i).padStart(3, '0')}`;
            
            // Random Issue Date between Jan 1, 2024 and Dec 31, 2025
            const year = getRandomInt(2024, 2025);
            const month = String(getRandomInt(1, 12)).padStart(2, '0');
            const day = String(getRandomInt(1, 28)).padStart(2, '0');
            const issue_date = `${year}-${month}-${day}`;
            
            // Random End Date (about 6 months later)
            const endYear = year + (month > 6 ? 1 : 0);
            const endMonth = String(((parseInt(month) + 6) % 12) || 12).padStart(2, '0');
            const end_date = `${endYear}-${endMonth}-${day}`;
            
            const desc = `${projects[getRandomInt(0, projects.length - 1)]} ${locations[getRandomInt(0, locations.length - 1)]}. Includes material sourcing and labor deployment.`;
            
            values.push(`('${wo_no}', '${issue_date}', '${end_date}', '${desc}')`);
        }

        console.log("Inserting into live database...");
        
        const chunkSize = 50;
        for (let i = 0; i < values.length; i += chunkSize) {
            const chunk = values.slice(i, i + chunkSize);
            const query = `INSERT INTO work_orders (wo_no, issue_date, end_date, description) VALUES ${chunk.join(',')} ON CONFLICT DO NOTHING;`;
            await pool.query(query);
            console.log(`Inserted ${i + chunk.length} / 100`);
        }
        
        console.log("SUCCESS! 100 work orders have been added to your database.");
        process.exit(0);
    } catch (err) {
        console.error("Error seeding work orders:", err);
        process.exit(1);
    }
}

seedWorkOrders();
