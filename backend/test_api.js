const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testApi() {
    try {
        const token = jwt.sign(
            { user_id: 1, role: 'Admin' },
            process.env.JWT_SECRET || 'super_secret_jwt_key_12345',
            { expiresIn: '1d' }
        );

        const formData = {
            name: 'API Test Employee',
            post: 'Tester',
            category: 'Skilled',
            mobile_no: '',
            aadhar_no: '1234'
        };

        // First insert
        await fetch('http://localhost:5000/api/employees', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        // Second insert (should fail)
        const response = await fetch('http://localhost:5000/api/employees', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log("Response:", response.status, data);
    } catch (err) {
        console.error("Network Error:", err.message);
    }
}

testApi();
