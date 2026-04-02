const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res) => {
    try {
        const { psychiatristId, date, time } = req.body;

        // Check if psychiatrist exists
        const psych = await User.findById(psychiatristId);
        if (!psych) {
            return res.status(404).json({ success: false, error: 'Psychiatrist not found' });
        }

        const roomId = `session-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const appointment = await Appointment.create({
            patient: req.user.id,
            psychiatrist: psychiatristId,
            date,
            time,
            roomId
        });

        res.status(201).json({
            success: true,
            data: appointment
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get user appointments (handles both patient and psychiatrist)
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
    try {
        let query;

        // If psychiatrist, find appointments where they are the doctor
        if (req.user.role === 'psychiatrist') {
            query = { psychiatrist: req.user.id };
        } else {
            // Otherwise find appointments where they are the patient
            query = { patient: req.user.id };
        }

        const appointments = await Appointment.find(query)
            .populate('patient', 'username email')
            .populate('psychiatrist', 'username email')
            .sort({ date: 1, time: 1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all appointments (Admin only)
// @route   GET /api/appointments/all
// @access  Private/Admin
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patient', 'username email')
            .populate('psychiatrist', 'username email')
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
// @desc    Cancel an appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }

        // Make sure user is the patient or psychiatrist for this appointment
        if (appointment.patient.toString() !== req.user.id && appointment.psychiatrist.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized to cancel this appointment' });
        }

        appointment.status = 'cancelled';
        await appointment.save();

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
// @desc    Complete an appointment (Mark as finished after call)
// @route   PUT /api/appointments/:id/complete
// @access  Private
exports.completeAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }

        // Make sure user is the patient or psychiatrist for this appointment
        if (appointment.patient.toString() !== req.user.id && appointment.psychiatrist.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized to update this appointment' });
        }

        appointment.status = 'completed';
        await appointment.save();

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
