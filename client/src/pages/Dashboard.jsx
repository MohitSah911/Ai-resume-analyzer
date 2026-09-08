import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import ResumeUpload from '../components/ResumeUpload';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [currentResume, setCurrentResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleUploadSuccess = (resumeData) => {
    setCurrentResume(resumeData);
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!currentResume) {
      setError('Please upload a resume first.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please enter a job description.');
      return;
    }

    setAnalyzing(true);
    setError('');
    
    try {
      const res = await api.post('/api/analyses', {
        resumeId: currentResume._id,
        jobDescription
      });
      if (res.data.success) {
        setAnalysisResult(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze job.');
    } finally {
      setAnalyzing(false);
    }
  };

  const startInterview = () => {
    if (analysisResult) {
      navigate(`/interview/${analysisResult._id}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="text-lg mb-6">Welcome, <span className="font-semibold">{user?.name}</span>!</p>

        <ResumeUpload onUploadSuccess={handleUploadSuccess} />

        {currentResume && (
          <div className="bg-white p-6 rounded shadow mt-6">
            <h2 className="text-xl font-semibold mb-2">1. Current Resume</h2>
            <p className="text-gray-600 mb-2">{currentResume.fileName}</p>
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">2. Job Description</h2>
              <textarea 
                className="w-full border p-2 rounded h-40 mb-4"
                placeholder="Paste job description here..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
              />
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <button 
                onClick={handleAnalyze}
                disabled={analyzing}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {analyzing ? 'Analyzing...' : 'Analyze Match'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        {analysisResult && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Analysis Result</h2>
            
            <div className="mb-6 flex items-center justify-between">
              <span className="text-lg font-semibold">Match Score:</span>
              <span className="text-3xl font-bold text-blue-600">
                {analysisResult.matchScore !== null ? `${analysisResult.matchScore}%` : 'N/A'}
              </span>
            </div>

            {analysisResult.matchScore === null && (
              <p className="text-red-500 mb-6 text-sm font-semibold">
                Unable to calculate a reliable match score because no recognized skills were extracted.
              </p>
            )}

            <div className="mb-6">
              <h3 className="font-semibold text-green-700 mb-2">Matched Skills</h3>
              <div className="flex flex-wrap gap-2">
                {analysisResult.matchedSkills.map(skill => (
                  <span key={skill} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">{skill}</span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-red-700 mb-2">Missing Skills</h3>
              <div className="flex flex-wrap gap-2">
                {analysisResult.missingSkills.map(skill => (
                  <span key={skill} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">{skill}</span>
                ))}
              </div>
            </div>

            {analysisResult.feedback && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2 text-purple-700">AI Feedback</h3>
                <p className="text-sm mb-2"><strong>Overall:</strong> {analysisResult.feedback.overallAssessment}</p>
                
                <h4 className="font-semibold text-sm mt-4">Strengths</h4>
                <ul className="list-disc pl-5 text-sm">
                  {analysisResult.feedback.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                </ul>

                <h4 className="font-semibold text-sm mt-4">Suggestions</h4>
                <ul className="list-disc pl-5 text-sm">
                  {analysisResult.feedback.suggestions?.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            <button 
              onClick={startInterview}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 font-bold"
            >
              Practice Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
