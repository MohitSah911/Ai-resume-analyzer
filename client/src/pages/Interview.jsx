import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Interview() {
  const { analysisId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrCreateSession = async () => {
      try {
        const createRes = await api.post('/api/interviews', { analysisId });
        if (createRes.data.success) {
          const loadedSession = createRes.data.data;
          setSession(loadedSession);
          
          if (loadedSession.answers && loadedSession.answers.length > 0) {
            const answeredCount = loadedSession.answers.filter(Boolean).length;
            if (answeredCount < loadedSession.questions.length) {
              setCurrentQuestionIndex(answeredCount);
            } else {
              setCurrentQuestionIndex(loadedSession.questions.length - 1);
              setEvaluation(loadedSession.answers[loadedSession.questions.length - 1].evaluation);
              setAnswer(loadedSession.answers[loadedSession.questions.length - 1].answer);
            }
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to initialize interview');
      } finally {
        setLoading(false);
      }
    };
    fetchOrCreateSession();
  }, [analysisId]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    
    setEvaluating(true);
    setError('');
    
    try {
      const res = await api.post(`/api/interviews/${session._id}/evaluate`, {
        questionIndex: currentQuestionIndex,
        answer
      });
      if (res.data.success) {
        setEvaluation(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to evaluate answer');
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswer('');
      setEvaluation(null);
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) return <div className="p-8 text-center">Preparing your interview questions...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!session || !session.questions || session.questions.length === 0) return <div className="p-8">No questions generated.</div>;

  const currentQuestion = session.questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Interview Practice</h1>
      
      <div className="bg-white p-8 rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-semibold">
            {currentQuestion.category}
          </span>
          <span className="text-gray-500 text-sm">Question {currentQuestionIndex + 1} of {session.questions.length}</span>
        </div>
        
        <h2 className="text-2xl font-semibold mb-6">{currentQuestion.question}</h2>
        
        {!evaluation ? (
          <div>
            <textarea
              className="w-full border p-4 rounded h-48 mb-4 focus:outline-none focus:border-blue-500"
              placeholder="Type your answer here as if you were speaking in an interview..."
              value={answer}
              onChange={e => setAnswer(e.target.value)}
            />
            <button
              onClick={handleSubmitAnswer}
              disabled={evaluating || !answer.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {evaluating ? 'Evaluating...' : 'Submit Answer'}
            </button>
          </div>
        ) : (
          <div className="mt-8 border-t pt-8">
            <h3 className="text-xl font-bold mb-4">Feedback</h3>
            <div className="mb-4">
              <span className="text-lg font-semibold">Score: </span>
              <span className={`text-2xl font-bold ${evaluation.score >= 7 ? 'text-green-600' : 'text-orange-500'}`}>
                {evaluation.score}/10
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-green-700 mb-2">Strengths</h4>
                <ul className="list-disc pl-5 text-sm">
                  {evaluation.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-700 mb-2">Areas for Improvement</h4>
                <ul className="list-disc pl-5 text-sm">
                  {evaluation.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  {evaluation.missingPoints.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded">
              <h4 className="font-semibold text-blue-800 mb-2">Example of a Better Answer:</h4>
              <p className="text-sm italic text-gray-700">"{evaluation.betterAnswer}"</p>
            </div>
            
            <button
              onClick={handleNextQuestion}
              className="mt-6 w-full bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 font-bold"
            >
              {currentQuestionIndex < session.questions.length - 1 ? 'Next Question' : 'Finish Interview'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
