const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-bank' + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(new Error('Only JPG files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter
});

router.use(authMiddleware);

router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.get('/:id/full-details', employeeController.getFullEmployeeDetails);

// Only HR and Admin can modify employees
router.post('/', roleMiddleware(['Admin', 'HR Manager']), upload.single('bank_photo'), employeeController.createEmployee);
router.put('/:id', roleMiddleware(['Admin', 'HR Manager']), upload.single('bank_photo'), employeeController.updateEmployee);
router.delete('/:id', roleMiddleware(['Admin', 'HR Manager']), employeeController.deleteEmployee);

module.exports = router;
