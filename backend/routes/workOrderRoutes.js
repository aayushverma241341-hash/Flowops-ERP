const express = require('express');
const router = express.Router();
const workOrderController = require('../controllers/workOrderController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.use(authMiddleware);

router.get('/', workOrderController.getAllWorkOrders);
router.get('/:id', workOrderController.getWorkOrderById);
router.get('/:id/full-details', workOrderController.getFullWorkOrderDetails);

// Only Admin can modify work orders
router.post('/', roleMiddleware(['Admin']), upload.single('copy_file'), workOrderController.createWorkOrder);
router.put('/:id', roleMiddleware(['Admin']), workOrderController.updateWorkOrder);
router.delete('/:id', roleMiddleware(['Admin']), workOrderController.deleteWorkOrder);

module.exports = router;
