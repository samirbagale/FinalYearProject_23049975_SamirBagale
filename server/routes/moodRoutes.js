const express = require('express');
const { getMoods, createMood, deleteMood } = require('../controllers/moodController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Protect all routes below

router.route('/')
    .get(getMoods)
    .post(createMood);

router.route('/:id')
    .delete(deleteMood);

module.exports = router;
