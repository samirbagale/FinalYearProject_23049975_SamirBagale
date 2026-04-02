const express = require('express');
const { createAppointment, getAppointments, getAllAppointments, cancelAppointment, completeAppointment } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes protected

// Patient/Psychiatrist routes
router.route('/')
    .get(getAppointments)
    .post(createAppointment);

router.route('/:id/cancel')
    .put(cancelAppointment);

router.route('/:id/complete')
    .put(completeAppointment);

// Admin route
router.route('/all')
    .get(authorize('admin'), getAllAppointments);

module.exports = router;
