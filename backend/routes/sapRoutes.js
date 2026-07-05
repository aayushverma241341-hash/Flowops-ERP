const express = require('express');
const router = express.Router();
const sapController = require('../controllers/sapController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware); // Protect all SAP routes

// Materials
router.get('/materials', sapController.getMaterials);
router.post('/materials', sapController.createMaterial);

// Vendors
router.get('/vendors', sapController.getVendors);
router.post('/vendors', sapController.createVendor);

// Purchase Orders
router.get('/purchase-orders', sapController.getPurchaseOrders);
router.post('/purchase-orders', sapController.createPurchaseOrder);

// Goods Receipt (MIGO)
router.get('/goods-receipts', sapController.getGoodsReceipts);
router.post('/goods-receipt', sapController.createGoodsReceipt);

// MM Expansion
router.get('/prs', sapController.getPRs);
router.get('/rfqs', sapController.getRFQs);
router.get('/info-records', sapController.getInfoRecords);
router.get('/contracts', sapController.getContracts);
router.get('/miro-invoices', sapController.getMiroInvoices);
router.get('/material-documents', sapController.getMaterialDocuments);
router.get('/stock-overview', sapController.getStockOverview);
router.get('/physical-inventory', sapController.getPhysicalInventory);

module.exports = router;
