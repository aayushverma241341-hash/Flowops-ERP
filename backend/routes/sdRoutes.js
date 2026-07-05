const express = require('express');
const router = express.Router();
const sdController = require('../controllers/sdController');

router.get('/sales-orders', sdController.getSalesOrders);

module.exports = router;
