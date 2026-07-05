const express = require('express');
const router = express.Router();
const fiController = require('../controllers/fiController');
// const auth = require('../middleware/authMiddleware'); // Omit for testing simplicity right now

router.get('/coa', fiController.getChartOfAccounts);
router.get('/ar', fiController.getAccountsReceivable);
router.get('/ap', fiController.getAccountsPayable);
router.get('/gl', fiController.getGeneralLedger);
router.get('/assets', fiController.getFixedAssets);

module.exports = router;
