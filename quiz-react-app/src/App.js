import React from "react";
import "./css/App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Quiz from "./Quiz";
import QuizList from "./QuizList";
import UploadQuizPage from "./pages/UploadQuizPage";
import QuestionBankList from "./pages/QuestionBankList";
import QuestionBankDetail from "./pages/QuestionBankDetail";
import UploadQuestionBank from "./pages/UploadQuestionBank";

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className="App">
        <header className="App-header">
          <h1>Networking Quiz</h1>
          <nav>
            <Link to="/" className="nav-link">
              Quiz List
            </Link>
            <Link to="/upload" className="nav-link">
              Upload Quiz
            </Link>
            <Link to="/question-bank" className="nav-link">
              Question Bank
            </Link>
            <Link to="/upload-question-bank" className="nav-link">
              Upload Question Bank
            </Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<QuizList />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/upload" element={<UploadQuizPage />} />
            <Route path="/question-bank" element={<QuestionBankList />} />
            <Route
              path="/question-bank/:fileName"
              element={<QuestionBankDetail />}
            />
            <Route
              path="/upload-question-bank"
              element={<UploadQuestionBank />}
            />
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
