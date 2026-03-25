const express = require('express');
const { register, login, getMe, getPsychiatrists } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/doctors/')
  },
  filename: function (req, file, cb) {
    cb(null, req.user.id + '-' + Date.now() + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/psychiatrists', getPsychiatrists);

router.post('/upload-photo', protect, upload.single('photo'), async (req, res) => {
    try {
        const photoUrl = '/uploads/doctors/' + req.file.filename;
        await User.findByIdAndUpdate(req.user.id, { profilePhoto: photoUrl });
        res.json({ photoUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upload photo' });
    }
});

router.post('/upgrade-premium', protect, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, { isPremium: true }, { new: true });
        res.json({ success: true, isPremium: user.isPremium });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upgrade to premium' });
    }
});

module.exports = router;
