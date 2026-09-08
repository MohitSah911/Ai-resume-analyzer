import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-600">AI Resume Analyzer</Link>
      <div>
        {user ? (
          <div className="flex gap-4 items-center">
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            <Link to="/history" className="hover:underline">History</Link>
            <span>{user.name}</span>
            <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Logout</button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link to="/login" className="text-blue-600 hover:text-blue-800">Login</Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
