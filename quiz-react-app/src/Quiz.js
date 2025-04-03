import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Progress, Spin, Alert, Result, Space, Grid } from 'antd';
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import './Quiz.css'; // Import the CSS file

const { Title, Text } = Typography;
const { useBreakpoint } = Grid; // Hook for responsive layouts

function Quiz() {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null); // Track selected answer index
    const [isAnswered, setIsAnswered] = useState(false); // Track if the current question is answered

    const screens = useBreakpoint(); // Get screen size info (e.g., lg, md, sm, xs)

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

    const handleAnswerOptionClick = (index) => {
        const isCorrect = index === questions[currentQuestionIndex].correct_answer;
        setSelectedAnswer(index);
        setIsAnswered(true);

        if (isCorrect) {
            setScore(score + 1);
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
        }, 1000); // Keep the delay for feedback visibility
    };

    // Get Ant Design button type and icon based on state
    const getButtonProps = (index) => {
        if (!isAnswered) return { type: 'default' }; // Default button appearance

        const isCorrect = index === questions[currentQuestionIndex].correct_answer;

        if (index === selectedAnswer) {
            return isCorrect
                ? { type: 'primary', style: { background: '#52c41a', borderColor: '#52c41a'}, icon: <CheckCircleOutlined /> } // Explicit green primary
                : { type: 'primary', danger: true, icon: <CloseCircleOutlined /> }; // Danger (red) primary
        }

        // If this option is correct but wasn't selected
        if (isCorrect) {
             return { type: 'dashed', style: { color: '#52c41a', borderColor: '#b7eb8f' }, icon: <CheckCircleOutlined /> }; // Dashed green outline
        }

        // Other incorrect, unselected options - disable and make less prominent
        return { type: 'default', disabled: true, style: { opacity: 0.6 } };
    };

    const restartQuiz = () => {
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowScore(false);
        setSelectedAnswer(null);
        setIsAnswered(false);
         // Optional: Re-fetch or re-shuffle if you want new questions order on restart
    };

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
                <p>Loading Quiz...</p>
            </div>
        );
    }

    if (error) {
        return <Alert message="Error" description={error} type="error" showIcon style={{ maxWidth: '600px', margin: '20px auto' }} />;
    }

    if (questions.length === 0 && !isLoading) {
        return <Alert message="No Questions" description="No questions were found. Please check the data source." type="warning" showIcon style={{ maxWidth: '600px', margin: '20px auto' }} />;
    }

    const progressPercent = Math.round(((currentQuestionIndex + (isAnswered ? 1 : 0)) / questions.length) * 100); // Show progress update slightly sooner

    return (
        <Card style={{ width: '100%', maxWidth: '700px' }} bordered={false}>
            {showScore ? (
                <Result
                    status="success"
                    title="Quiz Complete!"
                    subTitle={`You scored ${score} out of ${questions.length}. Well done!`}
                    extra={[
                        <Button type="primary" key="restart" icon={<ReloadOutlined />} onClick={restartQuiz}>
                            Restart Quiz
                        </Button>,
                    ]}
                />
            ) : (
                <>
                    <div style={{ marginBottom: '20px' }}>
                        <Text type="secondary">Question {currentQuestionIndex + 1}/{questions.length}</Text>
                        <Title level={4} style={{ marginTop: '5px' }}>{questions[currentQuestionIndex].question}</Title>
                    </div>

                    {/* Responsive Grid for Answers */}
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                         {questions[currentQuestionIndex].answers.map((answerOption, index) => (
                            <Button
                                key={index}
                                className="answer-button" // Add the custom class
                                block // Make button take full width of its container
                                size="large" // Make buttons slightly larger
                                onClick={() => !isAnswered && handleAnswerOptionClick(index)}
                                disabled={isAnswered} // Overall disabled state after answering
                                {...getButtonProps(index)} // Apply dynamic type and icon
                                // Merge dynamic styles from getButtonProps.
                                // Base styles like height, padding, etc., are now in Quiz.css
                                style={{ ...getButtonProps(index).style }}
                             >
                                {answerOption}
                            </Button>
                        ))}
                    </Space>

                    <Progress
                        percent={progressPercent}
                        status="active" // Show animation
                        strokeColor={{ from: '#108ee9', to: '#87d068' }} // Cute gradient
                        style={{ marginTop: '30px' }}
                        showInfo={false} // Hide the percentage text
                    />
                </>
            )}
        </Card>
    );
}

export default Quiz; 