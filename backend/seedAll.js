const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const siteNames = ["Alpha Tower Phase 1", "Beta Mall Extension", "Gamma Residential Complex", "Delta Logistics Hub", "Epsilon Tech Park", "Zeta Metro Station", "Eta Highway Bridge", "Theta University Campus", "Iota Healthcare Clinic", "Kappa Sports Arena", "Lambda Datacenter", "Mu Solar Farm", "Nu Water Treatment", "Xi Industrial Park", "Omicron Shopping Center", "Pi Office Plaza", "Rho Residential Block", "Sigma Research Lab", "Tau Assembly Plant", "Upsilon Warehouse"];
const locations = ["North District", "South Side", "East Wing", "West Zone", "Central Park Area"];

async function seedDatabase() {
    try {
        console.log("Fetching existing employees and work orders...");
        const empResult = await pool.query('SELECT employee_id FROM employees');
        const woResult = await pool.query('SELECT wo_no FROM work_orders');
        
        const employees = empResult.rows.map(r => r.employee_id);
        const workOrders = woResult.rows.map(r => r.wo_no);
        
        if (employees.length === 0 || workOrders.length === 0) {
            console.log("Error: You need employees and work orders in the DB first.");
            process.exit(1);
        }

        console.log(`Found ${employees.length} employees and ${workOrders.length} work orders.`);

        // 1. GENERATE SITES
        console.log("\n1. Generating 20 Sites...");
        const siteInsertQuery = `INSERT INTO sites (site_name, wo_no, start_date, max_employees, location) VALUES ($1, $2, $3, $4, $5) RETURNING site_id`;
        const siteIds = [];
        
        for (let i = 0; i < 20; i++) {
            const wo_no = workOrders[getRandomInt(0, workOrders.length - 1)];
            const date = `2025-${String(getRandomInt(1, 12)).padStart(2, '0')}-01`;
            const loc = locations[getRandomInt(0, locations.length - 1)];
            const res = await pool.query(siteInsertQuery, [siteNames[i], wo_no, date, 50, loc]);
            siteIds.push(res.rows[0].site_id);
        }
        console.log(`Created 20 Sites.`);

        // 2. ASSIGN EMPLOYEES TO SITES (site_employees)
        console.log("\n2. Assigning all employees to sites...");
        const siteEmpValues = [];
        const employeeSiteMap = {}; // Maps employee_id to site_id for attendance
        
        for (let i = 0; i < employees.length; i++) {
            const empId = employees[i];
            const siteId = siteIds[i % siteIds.length]; // Distribute evenly
            employeeSiteMap[empId] = siteId;
            siteEmpValues.push(`(${siteId}, ${empId}, '2025-01-01')`);
        }
        
        // Chunk insert site_employees
        for (let i = 0; i < siteEmpValues.length; i += 100) {
            const chunk = siteEmpValues.slice(i, i + 100);
            await pool.query(`INSERT INTO site_employees (site_id, employee_id, date_assigned) VALUES ${chunk.join(',')} ON CONFLICT DO NOTHING;`);
        }
        console.log(`Assigned ${employees.length} employees to sites.`);

        // 3. GENERATE ATTENDANCE (Last 30 Days)
        console.log("\n3. Generating 30 Days of Attendance for all employees (This may take a minute)...");
        const statuses = ['Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Absent', 'Leave']; // 80% Present
        const attValues = [];
        
        const today = new Date();
        for (let d = 0; d < 30; d++) {
            const dateObj = new Date();
            dateObj.setDate(today.getDate() - d);
            const dateStr = dateObj.toISOString().split('T')[0];
            
            // Skip Sundays
            if (dateObj.getDay() === 0) continue;

            for (let i = 0; i < employees.length; i++) {
                const empId = employees[i];
                const siteId = employeeSiteMap[empId];
                const status = statuses[getRandomInt(0, statuses.length - 1)];
                
                let checkIn = 'NULL';
                let checkOut = 'NULL';
                
                if (status === 'Present') {
                    // Random check-in around 9 AM
                    const inHr = getRandomInt(8, 9);
                    const inMin = getRandomInt(0, 59);
                    checkIn = `'${dateStr} ${String(inHr).padStart(2, '0')}:${String(inMin).padStart(2, '0')}:00'`;
                    
                    // Random check-out around 6 PM
                    const outHr = getRandomInt(17, 19);
                    const outMin = getRandomInt(0, 59);
                    checkOut = `'${dateStr} ${String(outHr).padStart(2, '0')}:${String(outMin).padStart(2, '0')}:00'`;
                }

                attValues.push(`(${empId}, '${dateStr}', ${checkIn}, ${checkOut}, '${status}', ${siteId})`);
            }
        }
        
        // Insert attendance in chunks of 500
        let attCount = 0;
        for (let i = 0; i < attValues.length; i += 500) {
            const chunk = attValues.slice(i, i + 500);
            await pool.query(`INSERT INTO attendance (employee_id, date, check_in_time, check_out_time, status, site_id) VALUES ${chunk.join(',')} ON CONFLICT DO NOTHING;`);
            attCount += chunk.length;
        }
        console.log(`Generated ${attCount} attendance records.`);

        // 4. GENERATE INVOICES
        console.log("\n4. Generating Invoices and Billing details...");
        for (let i = 0; i < 50; i++) {
            const siteId = siteIds[getRandomInt(0, siteIds.length - 1)];
            const wo_no = workOrders[getRandomInt(0, workOrders.length - 1)];
            
            const month = String(getRandomInt(1, 12)).padStart(2, '0');
            const issue_date = `2025-${month}-15`;
            const due_date = `2025-${month}-30`;
            const totalAmount = getRandomInt(50000, 500000);
            const status = ['Paid', 'Unpaid', 'Partially Paid'][getRandomInt(0, 2)];
            
            // Insert Invoice
            const invRes = await pool.query(
                `INSERT INTO invoices (wo_no, site_id, issue_date, due_date, amount, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING invoice_id`,
                [wo_no, siteId, issue_date, due_date, totalAmount, status]
            );
            const invoiceId = invRes.rows[0].invoice_id;
            
            // Insert Invoice Details (2-4 items per invoice)
            const numItems = getRandomInt(2, 4);
            const itemBase = totalAmount / numItems;
            
            const detailValues = [];
            for(let j=0; j<numItems; j++) {
                const desc = `Labor & Material supply Phase ${j+1}`;
                const qty = getRandomInt(1, 10);
                const rate = itemBase / qty;
                detailValues.push(`(${invoiceId}, '${desc}', ${qty}, ${rate}, ${itemBase})`);
            }
            await pool.query(`INSERT INTO invoice_details (invoice_id, description, quantity, rate, amount) VALUES ${detailValues.join(',')} ON CONFLICT DO NOTHING;`);
        }
        console.log("Generated 50 Invoices and line items.");

        console.log("\n✅ SUCCESS! All features have been fully populated with data.");
        process.exit(0);
    } catch (err) {
        console.error("Error seeding massive data:", err);
        process.exit(1);
    }
}

seedDatabase();
