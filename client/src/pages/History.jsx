import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const res = await api.get('/api/analyses');
        if (res.data.success) {
          setAnalyses(res.data.data);
        }
      } catch (err) {
        setError('Failed to fetch history');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyses();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading history...</div>;
  if (error) return <div className="p-8 text-red-500 text-center">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Analysis History</h1>
      
      {analyses.length === 0 ? (
        <p className="text-gray-500">No previous analyses found.</p>
      ) : (
        <div className="grid gap-6">
          {analyses.map(analysis => (
            <div key={analysis._id} className="bg-white p-6 rounded shadow flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-gray-500 mb-1">{new Date(analysis.createdAt).toLocaleDateString()}</p>
                <h2 className="text-xl font-semibold mb-2 line-clamp-1" title={analysis.jobDescription}>
                  {analysis.jobDescription.substring(0, 60)}...
                </h2>
                <div className="flex gap-4 text-sm">
                  <span className="text-blue-600 font-bold">Score: {analysis.matchScore}%</span>
                  <span className="text-red-600">Missing Skills: {analysis.missingSkills.length}</span>
                </div>
              </div>
              <button 
                onClick={() => navigate(`/interview/${analysis._id}`)}
                className="bg-purple-100 text-purple-700 px-4 py-2 rounded hover:bg-purple-200 font-semibold"
              >
                Practice Interview
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
