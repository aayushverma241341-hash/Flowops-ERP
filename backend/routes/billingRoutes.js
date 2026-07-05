const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', billingController.getAllInvoices);

// Only Accountant and Admin can handle billing
router.post('/create', roleMiddleware(['Admin', 'Accountant']), billingController.createInvoice);
router.put('/:id/status', roleMiddleware(['Admin', 'Accountant']), billingController.updateInvoiceStatus);

router.get('/:id/print', billingController.printInvoice);

module.exports = router;
