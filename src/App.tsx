import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router';
import QuestionsDemo from './application';
import SimpleDemo from './SimpleDemo';

const App: React.FC = () => {
  const location = useLocation();

  return (
    <div>
      {/* Navigation */}
      <nav className="bg-gray-800 text-white p-4">
        <div className="max-w-6xl mx-auto flex gap-6">
          <Link
            to="/"
            className={`px-4 py-2 rounded transition-colors ${
              location.pathname === '/' ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            Full Demo
          </Link>
          <Link
            to="/simple"
            className={`px-4 py-2 rounded transition-colors ${
              location.pathname === '/simple' ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            Simple Demo
          </Link>
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<QuestionsDemo />} />
        <Route path="/simple" element={<SimpleDemo />} />
      </Routes>
    </div>
  );
};

export default App;