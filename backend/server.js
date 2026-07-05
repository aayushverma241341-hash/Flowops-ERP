const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const workOrderRoutes = require('./routes/workOrderRoutes');
const siteRoutes = require('./routes/siteRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const billingRoutes = require('./routes/billingRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const sapRoutes = require('./routes/sapRoutes');
const fiRoutes = require('./routes/fiRoutes');
const sdRoutes = require('./routes/sdRoutes');
const wmRoutes = require('./routes/wmRoutes');
const ediRoutes = require('./routes/ediRoutes');
const ppRoutes = require('./routes/ppRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sap', sapRoutes);
app.use('/api/fi', fiRoutes);
app.use('/api/sd', sdRoutes);
app.use('/api/wm', wmRoutes);
app.use('/api/edi', ediRoutes);
app.use('/api/pp', ppRoutes);
app.use('/api/chat', chatRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'ERP API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
