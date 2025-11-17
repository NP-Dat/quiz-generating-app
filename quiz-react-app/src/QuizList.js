import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Quiz.css';
import { QUIZZES_ENDPOINT } from './config';

function QuizList() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();

        fetch(QUIZZES_ENDPOINT, { signal: controller.signal })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error fetching quiz list: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                setQuizzes(data.quizzes || []);
                setLoading(false);
            })
            .catch(err => {
                if (err.name === 'AbortError') return;
                console.error(err);
                setError('Failed to load quizzes. Please try again later.');
                setLoading(false);
            });

        return () => controller.abort();
    }, []);

    const handleQuizSelect = (quiz) => {
        navigate(`/quiz?name=${encodeURIComponent(quiz.file_name)}`, {
            state: { selectedQuiz: quiz }
        });
    };

    if (loading) return <div className="loading">Loading quiz list...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!quizzes || quizzes.length === 0) return <div className="loading">No quizzes found in the database.</div>;

    return (
        <div className="quiz-list-container">
            <h2>Available Quizzes</h2>
            <div className="quiz-cards">
                {quizzes.map((quiz) => (
                    <div key={quiz.file_name} className="quiz-card">
                        <h3 className="quiz-card-title">{quiz.file_name.replace('.json', '')}</h3>
                        <button
                            onClick={() => handleQuizSelect(quiz)}
                            className="start-quiz-button"
                        >
                            Start Quiz
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default QuizList;