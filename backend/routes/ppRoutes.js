const express = require('express');
const router = express.Router();
const ppController = require('../controllers/ppController');

router.get('/production-orders', ppController.getProductionOrders);
router.get('/mrp-runs', ppController.getMRPRuns);
router.get('/routings', ppController.getRoutings);
router.get('/boms', ppController.getBOMs);

module.exports = router;
