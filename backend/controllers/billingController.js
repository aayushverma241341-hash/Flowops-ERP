const db = require('../config/db');

exports.createInvoice = async (req, res) => {
    try {
        const { wo_no, site_id, issue_date, due_date, amount, details } = req.body;
        
        await db.query('BEGIN'); // Start transaction
        
        const invoiceRes = await db.query(
            `INSERT INTO invoices (wo_no, site_id, issue_date, due_date, amount) 
            VALUES ($1, $2, $3, $4, $5) RETURNING invoice_id`,
            [wo_no, site_id, issue_date, due_date, amount]
        );
        
        const invoice_id = invoiceRes.rows[0].invoice_id;
        
        // Insert details
        for (let detail of details) {
            await db.query(
                `INSERT INTO invoice_details (invoice_id, description, quantity, rate, amount) 
                VALUES ($1, $2, $3, $4, $5)`,
                [invoice_id, detail.description, detail.quantity, detail.rate, detail.amount]
            );
        }
        
        await db.query('COMMIT');
        res.status(201).json({ message: 'Invoice created successfully', invoice_id });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllInvoices = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT i.*, w.description as wo_description, s.site_name 
            FROM invoices i
            LEFT JOIN work_orders w ON i.wo_no = w.wo_no
            LEFT JOIN sites s ON i.site_id = s.site_id
            ORDER BY i.issue_date DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateInvoiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, credited_date } = req.body;
        
        const result = await db.query(
            `UPDATE invoices SET status = $1, credited_date = $2 WHERE invoice_id = $3 RETURNING *`,
            [status, credited_date, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invResult = await db.query(`
            SELECT i.*, w.description as wo_description, s.site_name 
            FROM invoices i
            LEFT JOIN work_orders w ON i.wo_no = w.wo_no
            LEFT JOIN sites s ON i.site_id = s.site_id
            WHERE i.invoice_id = $1
        `, [id]);

        if (invResult.rows.length === 0) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const detailsResult = await db.query(`
            SELECT * FROM invoice_details WHERE invoice_id = $1
        `, [id]);

        res.json({
            invoice: invResult.rows[0],
            details: detailsResult.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.printInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invResult = await db.query(`
            SELECT i.*, w.description as wo_description, s.site_name 
            FROM invoices i
            LEFT JOIN work_orders w ON i.wo_no = w.wo_no
            LEFT JOIN sites s ON i.site_id = s.site_id
            WHERE i.invoice_id = $1
        `, [id]);

        if (invResult.rows.length === 0) {
            return res.status(404).send('Invoice not found');
        }

        const inv = invResult.rows[0];

        const detailsResult = await db.query(`
            SELECT * FROM invoice_details WHERE invoice_id = $1
        `, [id]);

        const details = detailsResult.rows;

        let detailsHtml = '';
        details.forEach(d => {
            detailsHtml += `
            <tr>
                <td>${d.description}</td>
                <td>${d.quantity}</td>
                <td>${parseFloat(d.rate).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td class="amount">${parseFloat(d.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            </tr>
            `;
        });

        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Invoice INV-${inv.invoice_id}</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                .company-name { font-size: 24px; font-weight: bold; margin: 0; }
                .invoice-title { font-size: 18px; margin: 5px 0; color: #666; }
                .inv-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .inv-details div { width: 48%; }
                table { w-full: 100%; width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th, td { padding: 12px; border: 1px solid #ddd; text-align: left; }
                th { background-color: #f9f9f9; }
                .total-row { font-weight: bold; background-color: #f1f1f1; }
                .amount { text-align: right; }
                @media print {
                    @page { margin: 1cm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            </style>
        </head>
        <body onload="window.print()">
            <div class="header">
                <p class="company-name">FlowOps ERP</p>
                <p class="invoice-title">Tax Invoice</p>
            </div>
            
            <div class="inv-details">
                <div>
                    <p><strong>Invoice Number:</strong> INV-${inv.invoice_id}</p>
                    <p><strong>Issue Date:</strong> ${new Date(inv.issue_date).toLocaleDateString()}</p>
                    <p><strong>Due Date:</strong> ${new Date(inv.due_date).toLocaleDateString()}</p>
                </div>
                <div>
                    <p><strong>Work Order:</strong> ${inv.wo_no} (${inv.wo_description})</p>
                    <p><strong>Site:</strong> ${inv.site_name}</p>
                    <p><strong>Status:</strong> ${inv.status || 'Pending'}</p>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Rate (₹)</th>
                        <th class="amount">Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    ${detailsHtml}
                    <tr class="total-row">
                        <td colspan="3" style="text-align: right;">Total Amount</td>
                        <td class="amount">₹ ${parseFloat(inv.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    </tr>
                </tbody>
            </table>
            
            <div style="margin-top: 50px; text-align: right;">
                <p style="margin-bottom: 40px;">For FlowOps ERP</p>
                <hr style="width: 200px; margin-left: auto; margin-right: 0;">
                <p>Authorized Signatory</p>
            </div>
        </body>
        </html>
        `;

        res.send(html);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
