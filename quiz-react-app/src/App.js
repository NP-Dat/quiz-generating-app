import React from 'react';
import './css/App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Quiz from './Quiz';
import QuizList from './QuizList';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Networking Quiz</h1>
          <nav>
            <Link to="/" className="nav-link">Quiz List</Link>
            <Link to="/quiz" className="nav-link">Quiz</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<QuizList />} />
            <Route path="/quiz" element={<Quiz />} />
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
