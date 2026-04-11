const express = require('express');
const { submitContact, getContacts, deleteContact } = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', submitContact); // Public
router.get('/', protect, authorize('admin'), getContacts); // Admin Only
router.delete('/:id', protect, authorize('admin'), deleteContact); // Admin Only

module.exports = router;
