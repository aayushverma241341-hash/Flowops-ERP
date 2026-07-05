const db = require('../config/db');

exports.processSalary = async (req, res) => {
    try {
        const { employee_id, month, basic_salary, allowances, deductions } = req.body;

        // Parse month string (e.g., "May 2026")
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const parts = month.split(' ');
        const mIndex = monthNames.indexOf(parts[0]) + 1;
        const y = parseInt(parts[1], 10);

        // Check for 'Present' attendance
        const attendanceCheck = await db.query(
            `SELECT COUNT(*) FROM attendance 
             WHERE employee_id = $1 AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3 AND status = 'Present'`,
            [employee_id, mIndex, y]
        );

        if (parseInt(attendanceCheck.rows[0].count) === 0) {
            return res.status(400).json({ message: 'Cannot process salary. Employee has no present attendance for this month.' });
        }

        const net_salary = parseFloat(basic_salary) + parseFloat(allowances) - parseFloat(deductions);
        
        const result = await db.query(
            `INSERT INTO salaries (employee_id, month, basic_salary, allowances, deductions, net_salary) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [employee_id, month, basic_salary, allowances, deductions, net_salary]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateSalaryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status, payment_date } = req.body;
        
        const result = await db.query(
            `UPDATE salaries SET payment_status = $1, payment_date = $2 WHERE salary_id = $3 RETURNING *`,
            [payment_status, payment_date, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Salary record not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllSalaries = async (req, res) => {
    try {
        const { month } = req.query;
        let query = `
            SELECT s.*, e.name as employee_name, e.post,
                (SELECT string_agg(DISTINCT st.site_name, ', ') 
                 FROM attendance a 
                 JOIN sites st ON a.site_id = st.site_id
                 WHERE a.employee_id = s.employee_id 
                   AND TO_CHAR(a.date, 'FMMonth YYYY') = s.month
                ) as sites_worked
            FROM salaries s
            JOIN employees e ON s.employee_id = e.employee_id
        `;
        let params = [];
        
        if (month) {
            query += ` WHERE s.month = $1`;
            params.push(month);
        }
        query += ` ORDER BY s.salary_id DESC`;
        
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.printPayslip = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(`
            SELECT s.*, e.name as employee_name, e.post, e.category 
            FROM salaries s
            JOIN employees e ON s.employee_id = e.employee_id
            WHERE s.salary_id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).send('Payslip not found');
        }

        const sal = result.rows[0];

        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Payslip - ${sal.employee_name}</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                .company-name { font-size: 24px; font-weight: bold; margin: 0; }
                .payslip-title { font-size: 18px; margin: 5px 0; color: #666; }
                .emp-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .emp-details div { width: 48%; }
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
                <p class="payslip-title">Payslip for the month of ${sal.month}</p>
            </div>
            
            <div class="emp-details">
                <div>
                    <p><strong>Employee Name:</strong> ${sal.employee_name}</p>
                    <p><strong>Designation:</strong> ${sal.post}</p>
                </div>
                <div>
                    <p><strong>Category:</strong> ${sal.category}</p>
                    <p><strong>Date Processed:</strong> ${new Date(sal.created_at).toLocaleDateString()}</p>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Earnings & Deductions</th>
                        <th class="amount">Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Basic Salary</td>
                        <td class="amount">${parseFloat(sal.basic_salary).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    </tr>
                    <tr>
                        <td>Allowances</td>
                        <td class="amount">${parseFloat(sal.allowances).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    </tr>
                    <tr>
                        <td>Deductions</td>
                        <td class="amount">-${parseFloat(sal.deductions).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    </tr>
                    <tr class="total-row">
                        <td>Net Salary</td>
                        <td class="amount">${parseFloat(sal.net_salary).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    </tr>
                </tbody>
            </table>
            
            <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                <div>
                    <hr style="width: 200px; margin-bottom: 5px;">
                    <p style="text-align: center; margin: 0;">Employer Signature</p>
                </div>
                <div>
                    <hr style="width: 200px; margin-bottom: 5px;">
                    <p style="text-align: center; margin: 0;">Employee Signature</p>
                </div>
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
