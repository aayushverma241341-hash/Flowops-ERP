const db = require('../config/db');

const validateEmployeeData = async (req, isUpdate = false, empId = null) => {
    let { date_of_birth, uan_no, esic_no, bank_account_no, ifsc_no, mobile_no, aadhar_no } = req.body;
    
    if (date_of_birth) {
        const dob = new Date(date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        if (age < 18) throw new Error("Employee must be at least 18 years old.");
    }

    if (mobile_no && !/^\d{10}$/.test(mobile_no)) {
        throw new Error("Mobile number must be exactly 10 digits.");
    }

    if (bank_account_no && !/^\d+$/.test(bank_account_no)) {
        throw new Error("Bank account number must contain only numbers.");
    }

    if (ifsc_no && !/^[A-Za-z0-9]{11}$/.test(ifsc_no)) {
        throw new Error("IFSC code must be exactly 11 alphanumeric characters.");
    }

    if (uan_no && !/^\d{12}$/.test(uan_no)) {
        throw new Error("UAN number must be exactly 12 digits.");
    }

    if (esic_no && !/^\d{10}$/.test(esic_no)) {
        throw new Error("ESIC number must be exactly 10 digits.");
    }

    if (aadhar_no) {
        if (!/^\d{12}$/.test(aadhar_no)) {
            throw new Error("Aadhar number must be exactly 12 digits.");
        }
        
        let aadharQuery = 'SELECT * FROM employees WHERE aadhar_no = $1';
        let aadharParams = [aadhar_no];
        if (isUpdate && empId) {
            aadharQuery += ' AND employee_id != $2';
            aadharParams.push(empId);
        }
        const duplicateAadhar = await db.query(aadharQuery, aadharParams);
        if (duplicateAadhar.rows.length > 0) {
            const dup = duplicateAadhar.rows[0];
            throw new Error(`Aadhar number already exists. It is attached to Employee: ${dup.name} (Post: ${dup.post}, ID: ${dup.employee_id}).`);
        }
    }
};

exports.getAllEmployees = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM employees ORDER BY employee_id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM employees WHERE employee_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getFullEmployeeDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const employeeResult = await db.query('SELECT * FROM employees WHERE employee_id = $1', [id]);
        
        if (employeeResult.rows.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        
        const employee = employeeResult.rows[0];
        
        const salariesResult = await db.query('SELECT * FROM salaries WHERE employee_id = $1 ORDER BY salary_id DESC', [id]);
        
        const attendanceResult = await db.query(`
            SELECT a.*, s.site_name 
            FROM attendance a
            LEFT JOIN sites s ON a.site_id = s.site_id
            WHERE a.employee_id = $1 
            ORDER BY a.date DESC
        `, [id]);

        const assignedSitesResult = await db.query(`
            SELECT s.* 
            FROM sites s
            JOIN site_employees se ON s.site_id = se.site_id
            WHERE se.employee_id = $1
        `, [id]);

        res.json({
            ...employee,
            salaries: salariesResult.rows,
            attendance: attendanceResult.rows,
            assigned_sites: assignedSitesResult.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createEmployee = async (req, res) => {
    try {
        await validateEmployeeData(req, false);

        let { name, father_name, date_of_birth, uan_no, esic_no, bank_account_no, ifsc_no, mobile_no, aadhar_no, post, category } = req.body;
        father_name = father_name || null;
        date_of_birth = date_of_birth || null;
        uan_no = uan_no || null;
        esic_no = esic_no || null;
        bank_account_no = bank_account_no || null;
        ifsc_no = ifsc_no || null;
        mobile_no = mobile_no || null;
        aadhar_no = aadhar_no || null;
        post = post || null;
        category = category || null;

        let bank_photo_path = req.file ? req.file.path : null;

        const result = await db.query(
            `INSERT INTO employees 
            (name, father_name, date_of_birth, uan_no, esic_no, bank_account_no, ifsc_no, mobile_no, aadhar_no, post, category, bank_photo_path) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [name, father_name, date_of_birth, uan_no, esic_no, bank_account_no, ifsc_no, mobile_no, aadhar_no, post, category, bank_photo_path]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        await validateEmployeeData(req, true, id);
        
        const { name, father_name, date_of_birth, uan_no, esic_no, bank_account_no, ifsc_no, mobile_no, aadhar_no, post, category } = req.body;
        
        // If a new photo is uploaded, update it. Otherwise keep existing.
        let bank_photo_path = req.file ? req.file.path : null;

        let query, params;
        if (bank_photo_path) {
            query = `UPDATE employees SET 
                name=$1, father_name=$2, date_of_birth=$3, uan_no=$4, esic_no=$5, bank_account_no=$6, ifsc_no=$7, mobile_no=$8, aadhar_no=$9, post=$10, category=$11, bank_photo_path=$12
                WHERE employee_id=$13 RETURNING *`;
            params = [name, father_name, date_of_birth, uan_no, esic_no, bank_account_no, ifsc_no, mobile_no, aadhar_no, post, category, bank_photo_path, id];
        } else {
            query = `UPDATE employees SET 
                name=$1, father_name=$2, date_of_birth=$3, uan_no=$4, esic_no=$5, bank_account_no=$6, ifsc_no=$7, mobile_no=$8, aadhar_no=$9, post=$10, category=$11
                WHERE employee_id=$12 RETURNING *`;
            params = [name, father_name, date_of_birth, uan_no, esic_no, bank_account_no, ifsc_no, mobile_no, aadhar_no, post, category, id];
        }

        const result = await db.query(query, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM employees WHERE employee_id = $1', [id]);
        res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
