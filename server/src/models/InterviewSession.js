const mongoose = require('mongoose');

const InterviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  analysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobAnalysis',
    required: true,
  },
  questions: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  answers: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('InterviewSession', InterviewSessionSchema);
