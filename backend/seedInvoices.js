const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedInvoices() {
    try {
        console.log("Fetching existing sites and work orders...");
        const siteResult = await pool.query('SELECT site_id FROM sites');
        const woResult = await pool.query('SELECT wo_no FROM work_orders');
        
        const siteIds = siteResult.rows.map(r => r.site_id);
        const workOrders = woResult.rows.map(r => r.wo_no);
        
        if (siteIds.length === 0 || workOrders.length === 0) {
            console.log("Error: You need sites and work orders in the DB first.");
            process.exit(1);
        }

        console.log(`Found ${siteIds.length} sites and ${workOrders.length} work orders.`);

        // 4. GENERATE INVOICES
        console.log("\n4. Generating 50 Invoices and Billing details...");
        for (let i = 0; i < 50; i++) {
            const siteId = siteIds[getRandomInt(0, siteIds.length - 1)];
            const wo_no = workOrders[getRandomInt(0, workOrders.length - 1)];
            
            const month = String(getRandomInt(1, 12)).padStart(2, '0');
            const issue_date = `2025-${month}-15`;
            const due_date = `2025-${month}-28`; // Safe date for all months
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

        console.log("\n✅ SUCCESS! Invoices have been fully populated with data.");
        process.exit(0);
    } catch (err) {
        console.error("Error seeding invoices data:", err);
        process.exit(1);
    }
}

seedInvoices();
