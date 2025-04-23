import React, { useState, useEffect } from 'react';
import './css/Quiz.css'; // We'll create this file for styling
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate

function Quiz({ darkMode, toggleDarkMode }) {
    const location = useLocation();
    const navigate = useNavigate(); // Hook for navigation
    const selectedQuiz = location.state?.selectedQuiz; // Removed default 'data.json'

    // Redirect if no quiz is selected (e.g., direct navigation to /quiz)
    useEffect(() => {
        if (!selectedQuiz) {
            navigate('/'); // Redirect to the quiz list
        }
    }, [selectedQuiz, navigate]);

    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [userAnswers, setUserAnswers] = useState({}); // Store user answers { questionIndex: selectedAnswerIndex }
    const [showReview, setShowReview] = useState(false); // State to toggle review section
    const [maxReachedIndex, setMaxReachedIndex] = useState(0); // Track the furthest question reached
    
    // Fetch quiz data - only if selectedQuiz is available
    useEffect(() => {
        if (!selectedQuiz) {
            setIsLoading(false); // Don't load if no quiz is selected
            return;
        }
        setIsLoading(true); // Set loading true when fetching
        fetch(`/data/${selectedQuiz}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setQuestions(data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching quiz data:', error);
                setError(`Failed to load quiz: ${selectedQuiz}. Please try again.`);
                setIsLoading(false);
            });
    }, [selectedQuiz]); // Dependency remains selectedQuiz

    const handleAnswerOptionClick = (isCorrect, index) => {
        setSelectedAnswer(index);
        setIsAnswered(true);
        setUserAnswers(prevAnswers => ({
            ...prevAnswers,
            [currentQuestionIndex]: index
        }));

        if (isCorrect) {
            setScore(score + 1);
        }

        // Update maxReachedIndex if we're moving to a new question
        if (currentQuestionIndex + 1 > maxReachedIndex) {
            setMaxReachedIndex(currentQuestionIndex + 1);
        }

        setTimeout(() => {
            const nextQuestion = currentQuestionIndex + 1;
            if (nextQuestion < questions.length) {
                setCurrentQuestionIndex(nextQuestion);
                setSelectedAnswer(null);
                setIsAnswered(false);
            } else {
                setShowScore(true);
            }
        }, 1000);
    };

    // Updated function to only navigate to a previous question if it was answered
    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0 && userAnswers[currentQuestionIndex - 1] !== undefined) {
            const prevIndex = currentQuestionIndex - 1;
            setCurrentQuestionIndex(prevIndex);
            setSelectedAnswer(userAnswers[prevIndex] ?? null);
            setIsAnswered(userAnswers[prevIndex] !== undefined);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < maxReachedIndex) {
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);
            setSelectedAnswer(userAnswers[nextIndex] ?? null);
            setIsAnswered(userAnswers[nextIndex] !== undefined);
        }
    };

    // Updated getButtonClass for review state
    const getButtonClass = (qIndex, ansIndex, reviewMode = false) => {
        const currentQ = questions[qIndex];
        const correctAnswerIndex = currentQ.correct_answer;
        const userAnswerIndex = userAnswers[qIndex];

        if (!reviewMode) {
            // Existing logic for during the quiz
            if (!isAnswered) return 'answer-button';
            if (ansIndex === selectedAnswer) {
                return ansIndex === correctAnswerIndex ? 'answer-button correct' : 'answer-button incorrect';
            }
            if (ansIndex === correctAnswerIndex) return 'answer-button correct-unselected';
            return 'answer-button disabled';
        } else {
            // Logic for review mode
            const isCorrect = ansIndex === correctAnswerIndex;
            const isUserSelection = ansIndex === userAnswerIndex;

            if (isCorrect) return 'answer-button correct review'; // Always highlight correct answer in review
            if (isUserSelection && !isCorrect) return 'answer-button incorrect review'; // Show user's wrong choice
            return 'answer-button disabled review'; // Dim other incorrect options
        }
    };

     const restartQuiz = () => {
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowScore(false);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setUserAnswers({}); // Reset user answers
        setShowReview(false); // Hide review section
    };

    // Handle navigating back to the list
    const backToList = () => {
        navigate('/');
    };


    // Redirect if no selected quiz and not loading/error
    if (!selectedQuiz && !isLoading && !error) {
         return <div className="loading">No quiz selected. Redirecting...</div>;
     }

    if (isLoading && !error) { // Show loading only if not errored
        return <div className="loading">Loading Quiz: {selectedQuiz}...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (questions.length === 0) {
        return <div className="loading">No questions found.</div>;
    }

    return (
        <div className={`quiz-container ${darkMode ? 'dark-mode' : ''}`}>
            <button className="dark-mode-toggle" onClick={toggleDarkMode}>
                {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <p className="quiz-name-display">Playing: {selectedQuiz}</p> {/* Display selected quiz name */}
            {showScore ? (
                <div className='score-section'>
                    {!showReview ? (
                        <>
                            <h2>Quiz Complete!</h2>
                            <p>You scored {score} out of {questions.length}</p>
                            <div className="score-actions">
                                <button onClick={restartQuiz} className="restart-button">
                                    Restart This Quiz
                                </button>
                                <button onClick={() => setShowReview(true)} className="review-button">
                                    Review Answers
                                </button>
                                <button onClick={backToList} className="back-button">
                                    Back to Quiz List
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="review-section">
                            <h2>Review Your Answers</h2>
                            {questions.map((question, qIndex) => (
                                <div key={qIndex} className="review-question-block">
                                    <p className="question-text"><strong>Q{qIndex + 1}:</strong> {question.question}</p>
                                    <div className="answer-section review">
                                        {question.answers.map((answer, ansIndex) => (
                                            <button
                                                key={ansIndex}
                                                className={getButtonClass(qIndex, ansIndex, true)} // Pass reviewMode = true
                                                disabled // Buttons are not interactive in review
                                            >
                                                {answer}
                                            </button>
                                        ))}
                                    </div>
                                     <hr />
                                </div>
                            ))}
                             <div className="score-actions">
                                <button onClick={restartQuiz} className="restart-button">
                                    Restart This Quiz
                                </button>
                                <button onClick={backToList} className="back-button">
                                    Back to Quiz List
                                </button>
                                <button onClick={() => setShowReview(false)} className="back-button">
                                    Back to Score
                                </button>
                             </div>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className='question-section'>
                        <div className='question-count'>
                            <span>Question {currentQuestionIndex + 1}</span>/{questions.length}
                        </div>
                        <div className='question-text'>{questions[currentQuestionIndex]?.question}</div>
                    </div>
                    <div className='answer-section'>
                        {questions[currentQuestionIndex]?.answers.map((answer, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerOptionClick(index === questions[currentQuestionIndex].correct_answer, index)}
                                className={getButtonClass(currentQuestionIndex, index)}
                                disabled={isAnswered}
                            >
                                {answer}
                            </button>
                        ))}
                    </div>
                    <div className="navigation-buttons">
                        <button 
                            onClick={handlePreviousQuestion}
                            disabled={currentQuestionIndex === 0}
                            className="nav-button"
                        >
                            Previous Question
                        </button>
                        <button 
                            onClick={handleNextQuestion}
                            disabled={currentQuestionIndex >= maxReachedIndex}
                            className="nav-button"
                        >
                            Next Question
                        </button>
                    </div>
                    <div className="progress-bar-container">
                        <div
                            className="progress-bar"
                            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        ></div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Quiz;