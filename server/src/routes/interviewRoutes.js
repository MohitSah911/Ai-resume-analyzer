const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createInterviewSession, getInterviewSession, evaluateInterviewAnswer } = require('../controllers/interviewController');

router.post('/', protect, createInterviewSession);
router.get('/:id', protect, getInterviewSession);
router.post('/:id/evaluate', protect, evaluateInterviewAnswer);

module.exports = router;
