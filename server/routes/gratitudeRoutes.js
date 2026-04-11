const express = require('express');
const { 
    createEntry, 
    getMyEntries, 
    getAllEntries, 
    deleteEntry 
} = require('../controllers/gratitudeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes below are private

// User routes
router.route('/')
    .get(getMyEntries)
    .post(createEntry);

// Admin-only or shared deletion
router.get('/admin', authorize('admin'), getAllEntries);
router.delete('/:id', deleteEntry); // Controller handles permission logic

module.exports = router;
