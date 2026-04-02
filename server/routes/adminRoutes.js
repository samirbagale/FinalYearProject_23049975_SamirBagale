const express = require('express');
const { getStats, getUsers, deleteUser, restrictUser, updatePsychiatrist, getTransactions, createPsychiatrist } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/doctors/')
  },
  filename: function (req, file, cb) {
    cb(null, 'psychiatrist-' + req.params.id + '-' + Date.now() + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

// All routes are protected and require 'admin' role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/restrict', restrictUser);
router.get('/transactions', getTransactions);
router.put('/psychiatrists/:id', updatePsychiatrist);
router.post('/psychiatrists', createPsychiatrist);
router.post('/psychiatrists/:id/photo', upload.single('photo'), async (req, res) => {
    try {
        const photoUrl = 'http://127.0.0.1:5000/uploads/doctors/' + req.file.filename;
        await User.findByIdAndUpdate(req.params.id, { profilePhoto: photoUrl });
        res.json({ photoUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upload photo' });
    }
});

module.exports = router;
