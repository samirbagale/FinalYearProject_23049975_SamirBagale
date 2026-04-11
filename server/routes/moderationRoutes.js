const express = require('express');
const { protect } = require('../middleware/auth');
const moderationController = require('../controllers/moderationController');

const router = express.Router();

router.use(protect);

router.route('/report')
    .post(moderationController.createReport);

router.route('/reports')
    .get(moderationController.getReports); // In production, add admin check middleware here

module.exports = router;
