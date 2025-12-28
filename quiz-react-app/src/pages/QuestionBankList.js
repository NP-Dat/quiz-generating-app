import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Quiz.css';
import { QUESTION_BANKS_ENDPOINT } from '../config';

function QuestionBankList() {
  const [questionBanks, setQuestionBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    fetch(QUESTION_BANKS_ENDPOINT, { signal: controller.signal })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error fetching question banks: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        setQuestionBanks(data.questionBanks || []);
        setLoading(false);
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        console.error(err);
        setError('Failed to load question banks. Please try again later.');
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const handleTopicSelect = (qb) => {
    navigate(`/question-bank/${encodeURIComponent(qb.file_name)}`, {
      state: { questionBank: qb }
    });
  };

  if (loading) return <div className="loading">Loading question banks...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!questionBanks || questionBanks.length === 0) {
    return <div className="loading">No question banks found in the database.</div>;
  }

  return (
    <div className="quiz-list-container">
      <h2>Question Bank Topics</h2>
      <div className="quiz-cards">
        {questionBanks.map((qb) => (
          <div key={qb.file_name} className="quiz-card question-bank-card">
            <h3 className="quiz-card-title">{qb.file_name.replace('.json', '')}</h3>
            <p className="quiz-card-description">
              {qb.questions?.length || 0} questions
            </p>
            <button
              onClick={() => handleTopicSelect(qb)}
              className="start-quiz-button"
            >
              View Questions
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuestionBankList;

