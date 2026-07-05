const express = require('express');
const router = express.Router();
const ediController = require('../controllers/ediController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/idocs', ediController.getIdocs);

module.exports = router;
