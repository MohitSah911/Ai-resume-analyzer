const JobAnalysis = require('../models/JobAnalysis');
const Resume = require('../models/Resume');

// @desc    Analyze job description against resume
// @route   POST /api/analyses
// @access  Private
const analyzeJob = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId || !jobDescription) {
      return res.status(400).json({ success: false, message: 'Please provide resumeId and jobDescription' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Process job description in Python
    const pyJobRes = await fetch(`${process.env.PYTHON_SERVICE_URL}/api/process-job`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: jobDescription })
    });
    
    if (!pyJobRes.ok) {
      return res.status(500).json({ success: false, message: 'Failed to process job description' });
    }
    const jobDataResult = await pyJobRes.json();
    const extractedJobData = jobDataResult.data;

    // Calculate match score
    const resumeSkills = resume.extractedData.skills || [];
    const pyMatchRes = await fetch(`${process.env.PYTHON_SERVICE_URL}/api/calculate-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        resume_skills: resumeSkills,
        job_required_skills: extractedJobData.requiredSkills || [],
        job_preferred_skills: extractedJobData.preferredSkills || []
      })
    });

    if (!pyMatchRes.ok) {
      return res.status(500).json({ success: false, message: 'Failed to calculate match score' });
    }
    const matchResult = await pyMatchRes.json();
    const matchData = matchResult.data;

    if (matchData.error) {
      // We still want to save it, but we can bypass gemini or let gemini know there wasn't enough data
      // For now, let's just proceed with score: null
    }

    // Normalize the data contract from Python to match Node expectations
    const normalizedMatchData = {
      matchScore: matchData.score, // this will be null if insufficient data
      matchedSkills: matchData.matched_skills || [],
      missingSkills: matchData.missing_skills || []
    };

    // Get AI Feedback
    const { getResumeFeedback } = require('../services/geminiService');
    const aiFeedback = await getResumeFeedback(resume.extractedData, extractedJobData, normalizedMatchData);

    // Save Analysis
    const analysis = await JobAnalysis.create({
      userId: req.user._id,
      resumeId: resume._id,
      jobDescription,
      extractedJobData,
      matchScore: normalizedMatchData.matchScore,
      matchedSkills: normalizedMatchData.matchedSkills,
      missingSkills: normalizedMatchData.missingSkills,
      feedback: aiFeedback
    });

    res.status(201).json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ success: false, message: 'Server error processing analysis' });
  }
};

// @desc    Get user analyses
// @route   GET /api/analyses
// @access  Private
const getAnalyses = async (req, res) => {
  try {
    const analyses = await JobAnalysis.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: analyses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving analyses' });
  }
};

module.exports = { analyzeJob, getAnalyses };
