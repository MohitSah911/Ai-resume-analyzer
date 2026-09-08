const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { analyzeJob, getAnalyses } = require('../controllers/analysisController');

router.post('/', protect, analyzeJob);
router.get('/', protect, getAnalyses);

module.exports = router;
