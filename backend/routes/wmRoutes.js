const express = require('express');
const router = express.Router();
const wmController = require('../controllers/wmController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/bins', wmController.getBins);
router.get('/trs', wmController.getTRs);
router.get('/tos', wmController.getTOs);

module.exports = router;
