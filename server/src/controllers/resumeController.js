const Resume = require('../models/Resume');
const pdfParse = require('pdf-parse');

// @desc    Upload resume
// @route   POST /api/resumes/upload
// @access  Private
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ success: false, message: 'Only PDF files are allowed' });
    }

    // Extract text from PDF
    console.log("req.file:", req.file);
    const dataBuffer = req.file.buffer;
    let text = "";
    try {
      const data = await pdfParse(dataBuffer);
      if (data && data.text && data.text.trim().length > 0) {
        text = data.text;
      } else {
        return res.status(400).json({ success: false, message: 'Unable to extract text from this PDF. Please upload a text-based PDF.' });
      }
    } catch (e) {
      console.error('PDF Parse error:', e.message);
      return res.status(400).json({ success: false, message: 'Failed to parse PDF file. Ensure the file is not corrupted or password protected.' });
    }

    // Send text to Python service for structuring
    const pythonResponse = await fetch(`${process.env.PYTHON_SERVICE_URL}/api/process-resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    
    let structuredData = { rawText: text };
    if (pythonResponse.ok) {
      const pyResult = await pythonResponse.json();
      if (pyResult.success || pyResult.status === 'success') {
        structuredData = { ...structuredData, ...pyResult.data };
      }
    }

    // Save initial resume record
    const resume = await Resume.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      extractedData: structuredData
    });

    res.status(201).json({
      success: true,
      data: resume
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, message: 'Server error processing file' });
  }
};

module.exports = { uploadResume };
