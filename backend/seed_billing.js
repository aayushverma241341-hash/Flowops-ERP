const db = require('./config/db');

async function seedBilling() {
  console.log("Starting Billing Seeding...");
  try {
    const woRes = await db.query('SELECT wo_no FROM work_orders');
    const sitesRes = await db.query('SELECT site_id FROM sites');
    
    if (woRes.rows.length === 0 || sitesRes.rows.length === 0) {
      console.log("No work orders or sites found. Cannot seed billing.");
      return;
    }

    const workOrders = woRes.rows.map(r => r.wo_no);
    const sites = sitesRes.rows.map(r => r.site_id);
    const statuses = ['Unpaid', 'Paid'];
    
    const descriptions = [
      'Labor Charges - Skilled',
      'Material Cost - Cement',
      'Equipment Rental',
      'Transportation',
      'Consulting Fee',
      'Site Maintenance'
    ];

    // Generate 20 random invoices
    for (let i = 0; i < 20; i++) {
      const wo_no = workOrders[Math.floor(Math.random() * workOrders.length)];
      const site_id = sites[Math.floor(Math.random() * sites.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const issueDate = new Date();
      issueDate.setDate(issueDate.getDate() - Math.floor(Math.random() * 60)); // Up to 60 days ago
      
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + 30); // Net 30

      // Generate 1 to 4 random details
      const numDetails = Math.floor(Math.random() * 4) + 1;
      let totalAmount = 0;
      const details = [];

      for (let j = 0; j < numDetails; j++) {
        const desc = descriptions[Math.floor(Math.random() * descriptions.length)];
        const qty = Math.floor(Math.random() * 50) + 1;
        const rate = (Math.random() * 1000 + 100).toFixed(2);
        const amt = (qty * rate).toFixed(2);
        totalAmount += parseFloat(amt);
        
        details.push({ description: desc, quantity: qty, rate, amount: amt });
      }

      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');

        const invRes = await client.query(
          `INSERT INTO invoices (wo_no, site_id, issue_date, due_date, amount, status)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING invoice_id`,
          [wo_no, site_id, issueDate, dueDate, totalAmount, status]
        );
        
        const invoice_id = invRes.rows[0].invoice_id;

        for (const d of details) {
          await client.query(
            `INSERT INTO invoice_details (invoice_id, description, quantity, rate, amount)
             VALUES ($1, $2, $3, $4, $5)`,
            [invoice_id, d.description, d.quantity, d.rate, d.amount]
          );
        }

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    console.log("Successfully seeded 20 invoices with line items!");
  } catch (err) {
    await db.query('ROLLBACK');
    console.error("Error seeding billing:", err);
  } finally {
    process.exit(0);
  }
}

seedBilling();
