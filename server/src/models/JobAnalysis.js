const mongoose = require('mongoose');

const JobAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
  },
  jobDescription: {
    type: String,
    required: true,
  },
  extractedJobData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  matchScore: {
    type: Number,
    default: null,
  },
  matchedSkills: {
    type: [String],
    default: [],
  },
  missingSkills: {
    type: [String],
    default: [],
  },
  feedback: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

module.exports = mongoose.model('JobAnalysis', JobAnalysisSchema);
