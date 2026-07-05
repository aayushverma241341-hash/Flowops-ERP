const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', siteController.getAllSites);
router.get('/:id', siteController.getSiteById);
router.get('/:id/full-details', siteController.getFullSiteDetails);

// Admin and Site Manager can modify sites
router.post('/', roleMiddleware(['Admin', 'Site Manager']), siteController.createSite);
router.post('/assign', roleMiddleware(['Admin', 'Site Manager']), siteController.assignEmployee);

module.exports = router;
