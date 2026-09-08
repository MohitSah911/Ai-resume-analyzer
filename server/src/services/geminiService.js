const { GoogleGenAI } = require('@google/genai');

const initGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is missing. AI features will fail or return stubs.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

const getResumeFeedback = async (resumeData, jobData, matchData) => {
  const ai = initGemini();
  if (!ai) {
    return {
      overallAssessment: "AI not configured",
      strengths: [],
      weaknesses: [],
      suggestions: ["Configure GEMINI_API_KEY to see suggestions"],
      roleSpecificSuggestions: []
    };
  }

  const prompt = `
    You are an expert technical recruiter. Analyze the candidate's resume against the target job description.
    
    Resume Skills: ${JSON.stringify(resumeData.skills || [])}
    Matched Skills: ${JSON.stringify(matchData.matchedSkills || [])}
    Missing Skills: ${JSON.stringify(matchData.missingSkills || [])}
    Match Score: ${matchData.matchScore}%
    
    CRITICAL INSTRUCTIONS:
    1. ONLY use the information provided above. Do not invent experience, technologies, or achievements.
    2. Do not claim the candidate has a skill that is absent from the Resume Skills.
    3. Explicitly distinguish extracted facts from your recommendations.
    
    Provide structured feedback in JSON format ONLY, without markdown wrapping or code blocks.
    The JSON structure MUST be exactly:
    {
      "overallAssessment": "string",
      "strengths": ["string"],
      "weaknesses": ["string"],
      "suggestions": ["string"],
      "roleSpecificSuggestions": ["string"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    });

    const resultText = response.text;
    const jsonResult = JSON.parse(resultText);
    return jsonResult;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      overallAssessment: "Failed to generate AI feedback.",
      strengths: [],
      weaknesses: [],
      suggestions: ["Please try again later."],
      roleSpecificSuggestions: []
    };
  }
};

const generateInterviewQuestions = async (resumeData, jobData, missingSkills) => {
  const ai = initGemini();
  if (!ai) {
    return [
      { category: "Technical", question: "What is your strongest skill?" },
      { category: "Behavioral", question: "Tell me about yourself." }
    ];
  }

  const prompt = `
    You are an expert technical interviewer.
    Generate exactly 5 interview questions tailored to the candidate based on their resume and the job description.
    
    Candidate Skills: ${JSON.stringify(resumeData.skills || [])}
    Missing Job Skills: ${JSON.stringify(missingSkills || [])}
    
    Provide the output in JSON format ONLY, as an array of objects.
    Each object MUST have:
    {
      "category": "string (Technical, Behavioral, or Project-based)",
      "question": "string"
    }
  `;

  try {
    const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};

const evaluateAnswer = async (question, answer) => {
  const ai = initGemini();
  if (!ai) {
    return {
      score: 0,
      strengths: [],
      weaknesses: [],
      missingPoints: ["AI not configured"],
      betterAnswer: "Configure AI to evaluate."
    };
  }

  const prompt = `
    You are an expert technical interviewer. Evaluate the candidate's answer to the following question.
    
    Question: ${question}
    Candidate's Answer: ${answer}
    
    Provide the evaluation in JSON format ONLY, without markdown.
    The JSON structure MUST be exactly:
    {
      "score": number (0-10),
      "strengths": ["string"],
      "weaknesses": ["string"],
      "missingPoints": ["string"],
      "betterAnswer": "string (an example of a great answer)"
    }
  `;

  try {
    const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      score: 0,
      strengths: [],
      weaknesses: [],
      missingPoints: ["Failed to evaluate answer"],
      betterAnswer: ""
    };
  }
};

module.exports = {
  getResumeFeedback,
  generateInterviewQuestions,
  evaluateAnswer
};
