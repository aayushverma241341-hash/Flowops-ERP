const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', salaryController.getAllSalaries);

// Only Accountant and Admin can process salaries
router.post('/process', roleMiddleware(['Admin', 'Accountant']), salaryController.processSalary);
router.put('/:id/status', roleMiddleware(['Admin', 'Accountant']), salaryController.updateSalaryStatus);

router.get('/:id/print', salaryController.printPayslip);

module.exports = router;
