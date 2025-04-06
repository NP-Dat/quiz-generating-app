import React, { useState, useEffect } from 'react';
import './css/Quiz.css'; // We'll create this file for styling
import { 
  Button, 
  Typography, 
  LinearProgress, 
  Card, 
  CardContent, 
  Container,
  Box,
  IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

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
        }, 1000); // Delay of 1.0 seconds
    };

    const getButtonStyle = (index, isCorrect) => {
        if (!isAnswered) return {};
        if (index === selectedAnswer) {
            return {
                bgcolor: isCorrect ? 'success.light' : 'error.light',
                '&:hover': { bgcolor: isCorrect ? 'success.main' : 'error.main' }
            };
        }
        if (isCorrect) return { bgcolor: 'success.light', opacity: 0.8 };
        return { opacity: 0.6 };
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
        <Card sx={{ 
            my: 4, 
            p: 3, 
            borderRadius: 4, 
            boxShadow: 3,
            width: '100%', // Full width of container
            maxWidth: 800, // Maximum width
            minHeight: 600, // Minimum height
            maxHeight: 600, // Maximum height
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden' // Prevent content from overflowing card
        }}>
            <CardContent>
                {showScore ? (
                    <Box textAlign="center">
                        <Typography variant="h3" gutterBottom color="primary.main">
                            Quiz Complete!
                        </Typography>
                        <Typography variant="h5" sx={{ mb: 3 }}>
                            Score: {score}/{questions.length}
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={restartQuiz}
                            startIcon={<CheckCircleIcon />}
                        >
                            Restart Quiz
                        </Button>
                    </Box>
                ) : (
                    <>
                        <Box sx={{ 
                            mb: 4,
                            height: 120, // Fixed height
                            overflow: 'auto', // Add scroll for long content
                            flexShrink: 0 // Prevent size changes
                        }}>
                            <Typography variant="overline" color="text.secondary">
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </Typography>
                            <Typography 
                                variant="h5" // Smaller heading variant
                                sx={{ 
                                    mt: 1,
                                    whiteSpace: 'normal', // Allow text wrapping
                                    fontSize: '1.5rem', // Fixed base size
                                    lineHeight: 1.3, // Tighter line spacing
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3, // Limit to 3 lines max
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                {questions[currentQuestionIndex].question}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'grid', gap: 2 }}>
                            {questions[currentQuestionIndex].answers.map((answer, index) => {
                                const isCorrect = index === questions[currentQuestionIndex].correct_answer;
                                return (
                                    <Button
                                        key={index}
                                        variant="outlined"
                                        onClick={() => !isAnswered && handleAnswerOptionClick(isCorrect, index)}
                                        disabled={isAnswered}
                                        sx={{
                                            justifyContent: 'flex-start',
                                            py: 2,
                                            textTransform: 'none',
                                            ...getButtonStyle(index, isCorrect),
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': { 
                                                transform: 'translateY(-2px)',
                                                boxShadow: 3
                                            },
                                            height: 56,
                                            '& .MuiButton-label': {
                                                whiteSpace: 'normal',
                                                textAlign: 'left'
                                            }
                                        }}
                                    >
                                        {isAnswered && (
                                            <Box sx={{ mr: 1 }}>
                                                {isCorrect ? <CheckCircleIcon /> : <CancelIcon />}
                                            </Box>
                                        )}
                                        {answer}
                                    </Button>
                                );
                            })}
                        </Box>

                        <LinearProgress
                            variant="determinate"
                            value={((currentQuestionIndex + 1) / questions.length) * 100}
                            sx={{ mt: 4, height: 8, borderRadius: 4 }}
                        />
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default Quiz; 