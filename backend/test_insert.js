const db = require('./config/db');

async function testInsert() {
    try {
        let name = "Test Name";
        let father_name = null;
        let date_of_birth = null;
        let uan_no = null;
        let esic_no = null;
        let bank_account_no = null;
        let ifsc_no = null;
        let mobile_no = "1234567890";
        let aadhar_no = null;
        let post = "Test Post";
        let category = "Skilled";

        console.log("Attempting insert...");
        const result = await db.query(
            `INSERT INTO employees 
            (name, father_name, date_of_birth, uan_no, esic_no, bank_account_no, ifsc_no, mobile_no, aadhar_no, post, category) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [name, father_name, date_of_birth, uan_no, esic_no, bank_account_no, ifsc_no, mobile_no, aadhar_no, post, category]
        );
        console.log("Success:", result.rows[0]);
    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        process.exit();
    }
}

testInsert();
