import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import '../css/Quiz.css';
import '../css/QuestionBank.css';
import { QUESTION_BANKS_ENDPOINT } from '../config';

function QuestionBankDetail() {
  const { fileName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [questionBank, setQuestionBank] = useState(location.state?.questionBank || null);
  const [loading, setLoading] = useState(!location.state?.questionBank);
  const [error, setError] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    if (questionBank) return;

    const controller = new AbortController();

    fetch(`${QUESTION_BANKS_ENDPOINT}/${encodeURIComponent(fileName)}`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error fetching question bank: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        setQuestionBank(data);
        setLoading(false);
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        console.error(err);
        setError('Failed to load question bank. Please try again later.');
        setLoading(false);
      });

    return () => controller.abort();
  }, [fileName, questionBank]);

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const expandAll = () => {
    const allExpanded = {};
    questionBank.questions.forEach((_, index) => {
      allExpanded[index] = true;
    });
    setExpandedQuestions(allExpanded);
  };

  const collapseAll = () => {
    setExpandedQuestions({});
  };

  if (loading) return <div className="loading">Loading question bank...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!questionBank) return <div className="loading">Question bank not found.</div>;

  const displayName = questionBank.file_name?.replace('.json', '') || fileName?.replace('.json', '');

  return (
    <div className="question-bank-container">
      <div className="question-bank-header">
        <button onClick={() => navigate('/question-bank')} className="back-button">
          ← Back to Topics
        </button>
        <h2>{displayName}</h2>
        <p className="question-count-info">
          {questionBank.questions?.length || 0} questions
        </p>
        <div className="expand-controls">
          <button onClick={expandAll} className="control-button">
            Expand All
          </button>
          <button onClick={collapseAll} className="control-button">
            Collapse All
          </button>
        </div>
      </div>

      <div className="questions-list">
        {questionBank.questions?.map((q, index) => (
          <div
            key={index}
            className={`question-item ${expandedQuestions[index] ? 'expanded' : ''}`}
          >
            <div
              className="question-header"
              onClick={() => toggleQuestion(index)}
            >
              <span className="question-number">Q{index + 1}</span>
              <p className="question-text-preview">{q.question}</p>
              <span className="expand-icon">
                {expandedQuestions[index] ? '−' : '+'}
              </span>
            </div>
            
            {expandedQuestions[index] && (
              <div className="question-details">
                <div className="answer-block">
                  <h4>Answer:</h4>
                  <p className="answer-text">{q.answer}</p>
                </div>
                {q.pattern && (
                  <div className="pattern-block">
                    <h4>Pattern:</h4>
                    <span className="pattern-tag">{q.pattern}</span>
                  </div>
                )}
                {q.pdf && q.pdf !== 'User_Provided' && (
                  <div className="source-block">
                    <h4>Source:</h4>
                    <span className="source-text">{q.pdf}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuestionBankDetail;

