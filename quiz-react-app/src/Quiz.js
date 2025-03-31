import React, { useState, useEffect } from 'react';
import './Quiz.css'; // We'll create this file for styling

function Quiz() {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null); // Track selected answer index
    const [isAnswered, setIsAnswered] = useState(false); // Track if the current question is answered

    // Fetch quiz data
    useEffect(() => {
        fetch('/data.json') // Data is in the public folder
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                setQuestions(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch quiz data:", err);
                setError('Failed to load quiz questions. Please try refreshing the page.');
                setIsLoading(false);
            });
    }, []); // Empty dependency array means this runs once on mount

    const handleAnswerOptionClick = (isCorrect, index) => {
        setSelectedAnswer(index); // Set the selected answer
        setIsAnswered(true); // Mark question as answered

        if (isCorrect) {
            setScore(score + 1);
        }

        // Automatically move to the next question after a short delay
        setTimeout(() => {
            const nextQuestion = currentQuestionIndex + 1;
            if (nextQuestion < questions.length) {
                setCurrentQuestionIndex(nextQuestion);
                setSelectedAnswer(null); // Reset selected answer for the next question
                setIsAnswered(false); // Reset answered state
            } else {
                setShowScore(true); // Show results if it was the last question
            }
        }, 1500); // Delay of 1.5 seconds
    };

    const getButtonClass = (index, isCorrect) => {
        if (!isAnswered) {
            return 'answer-button'; // Default state
        }
        if (index === selectedAnswer) {
            return isCorrect ? 'answer-button correct' : 'answer-button incorrect';
        }
        // If this answer option is the correct one but wasn't selected, highlight it
        if (isCorrect) {
             return 'answer-button correct-unselected';
        }
        return 'answer-button disabled'; // Other buttons are disabled/dimmed after answering
    };

     const restartQuiz = () => {
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowScore(false);
        setSelectedAnswer(null);
        setIsAnswered(false);
    };


    if (isLoading) {
        return <div className="loading">Loading Quiz...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (questions.length === 0) {
        return <div className="loading">No questions found.</div>;
    }

    return (
        <div className='quiz-container'>
            {showScore ? (
                <div className='score-section'>
                    <h2>Quiz Complete!</h2>
                    <p>You scored {score} out of {questions.length}</p>
                     <button onClick={restartQuiz} className="restart-button">
                        Restart Quiz
                    </button>
                </div>
            ) : (
                <>
                    <div className='question-section'>
                        <div className='question-count'>
                            <span>Question {currentQuestionIndex + 1}</span>/{questions.length}
                        </div>
                        <div className='question-text'>{questions[currentQuestionIndex].question}</div>
                    </div>
                    <div className='answer-section'>
                        {questions[currentQuestionIndex].answers.map((answerOption, index) => {
                            const isCorrect = index === questions[currentQuestionIndex].correct_answer;
                            return (
                                <button
                                    key={index}
                                    onClick={() => !isAnswered && handleAnswerOptionClick(isCorrect, index)}
                                    className={getButtonClass(index, isCorrect)}
                                    disabled={isAnswered} // Disable button after an answer is selected
                                >
                                    {answerOption}
                                </button>
                            );
                        })}
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