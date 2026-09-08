const InterviewSession = require('../models/InterviewSession');
const JobAnalysis = require('../models/JobAnalysis');
const Resume = require('../models/Resume');
const { generateInterviewQuestions, evaluateAnswer } = require('../services/geminiService');

// @desc    Generate interview questions
// @route   POST /api/interviews
// @access  Private
const createInterviewSession = async (req, res) => {
  try {
    const { analysisId } = req.body;
    
    // Check if session already exists
    let session = await InterviewSession.findOne({ analysisId, userId: req.user._id });
    if (session) {
      return res.status(200).json({ success: true, data: session });
    }

    const analysis = await JobAnalysis.findOne({ _id: analysisId, userId: req.user._id });
    if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found' });
    
    const resume = await Resume.findById(analysis.resumeId);
    
    // Generate questions using Gemini
    const questions = await generateInterviewQuestions(
      resume.extractedData,
      analysis.extractedJobData,
      analysis.missingSkills
    );

    session = await InterviewSession.create({
      userId: req.user._id,
      analysisId: analysis._id,
      questions,
      answers: []
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    console.error('Interview Session Error:', error);
    res.status(500).json({ success: false, message: 'Server error generating questions' });
  }
};

// @desc    Get interview session
// @route   GET /api/interviews/:id
// @access  Private
const getInterviewSession = async (req, res) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving session' });
  }
};

// @desc    Evaluate interview answer
// @route   POST /api/interviews/:id/evaluate
// @access  Private
const evaluateInterviewAnswer = async (req, res) => {
  try {
    const { questionIndex, answer } = req.body;
    
    const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    
    const questionText = session.questions[questionIndex].question;
    
    // Evaluate answer using Gemini
    const evaluation = await evaluateAnswer(questionText, answer);

    // Save answer and evaluation
    const updatedAnswers = [...session.answers];
    updatedAnswers[questionIndex] = {
      question: questionText,
      answer,
      evaluation
    };

    session.answers = updatedAnswers;
    await session.save();

    res.status(200).json({ success: true, data: evaluation });
  } catch (error) {
    console.error('Evaluate Answer Error:', error);
    res.status(500).json({ success: false, message: 'Server error evaluating answer' });
  }
};

module.exports = { createInterviewSession, getInterviewSession, evaluateInterviewAnswer };
