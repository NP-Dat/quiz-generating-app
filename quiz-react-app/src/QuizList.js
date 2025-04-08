import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function QuizList() {
    const [quizFiles, setQuizFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch list of quiz files from public/data directory
        fetch('/data/index.json')
            .then(response => response.json())
            .then(data => {
                setQuizFiles(data.files);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching quiz list:', error);
                setLoading(false);
            });
    }, []);

    const handleQuizSelect = (filename) => {
        navigate('/quiz', { state: { selectedQuiz: filename } });
    };

    if (loading) return <div className="loading">Loading quiz list...</div>;

    return (
        <div className="quiz-list">
            <h2>Available Quizzes</h2>
            <table>
                <thead>
                    <tr>
                        <th>Quiz Name</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {quizFiles.map((file, index) => (
                        <tr key={index}>
                            <td>{file}</td>
                            <td>
                                <button 
                                    onClick={() => handleQuizSelect(file)}
                                    className="restart-button"
                                >
                                    Start Quiz
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default QuizList;