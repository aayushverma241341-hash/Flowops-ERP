const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', attendanceController.getMonthlyAttendance);

// HR Manager and Site Manager can mark attendance
router.post('/mark', roleMiddleware(['Admin', 'HR Manager', 'Site Manager']), attendanceController.markAttendance);
router.post('/bulk', roleMiddleware(['Admin', 'HR Manager', 'Site Manager']), attendanceController.markBulkAttendance);

module.exports = router;
