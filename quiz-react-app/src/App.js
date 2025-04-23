import React, { useState, useEffect } from 'react';
import './css/App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Quiz from './Quiz';
import QuizList from './QuizList';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  useEffect(() => {
    if(darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Networking Quiz</h1>
          <nav>
            <Link to="/" className="nav-link">Quiz List</Link>
          </nav>
          <button onClick={toggleDarkMode} className="dark-mode-toggle">
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<QuizList darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/quiz" element={<Quiz darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          </Routes>
        </main>
        <footer className="App-footer">
          <p>Test your knowledge!</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
