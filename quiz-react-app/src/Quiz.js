import React, { useState, useEffect } from "react";
import "./css/Quiz.css";
import { useLocation, useNavigate } from "react-router-dom";
import { QUIZZES_ENDPOINT } from "./config";

// Fisher-Yates shuffle algorithm that also tracks the correct answer's new position
function shuffleAnswers(answers, correctAnswerIndex) {
  // Create array of { answer, isCorrect } objects
  const answerObjects = answers.map((answer, index) => ({
    answer,
    isCorrect: index === correctAnswerIndex,
  }));

  // Fisher-Yates shuffle
  for (let i = answerObjects.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [answerObjects[i], answerObjects[j]] = [answerObjects[j], answerObjects[i]];
  }

  // Extract shuffled answers and find new correct answer index
  const shuffledAnswers = answerObjects.map((obj) => obj.answer);
  const newCorrectIndex = answerObjects.findIndex((obj) => obj.isCorrect);

  return { shuffledAnswers, newCorrectIndex };
}

// Shuffle all questions' answers
function shuffleQuizQuestions(questions) {
  return questions.map((question) => {
    const { shuffledAnswers, newCorrectIndex } = shuffleAnswers(
      question.answers,
      question.correct_answer
    );
    return {
      ...question,
      answers: shuffledAnswers,
      correct_answer: newCorrectIndex,
    };
  });
}

function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedQuiz = location.state?.selectedQuiz;
  const queryParams = new URLSearchParams(location.search);
  const quizNameFromQuery = queryParams.get("name");
  const quizName =
    typeof selectedQuiz === "string"
      ? selectedQuiz
      : selectedQuiz?.file_name || quizNameFromQuery;

  const [questions, setQuestions] = useState(
    selectedQuiz && typeof selectedQuiz === "object"
      ? shuffleQuizQuestions(selectedQuiz.list_of_questions || [])
      : []
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [isLoading, setIsLoading] = useState(!questions.length);
  const [error, setError] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (selectedQuiz && typeof selectedQuiz === "object") {
      setQuestions(shuffleQuizQuestions(selectedQuiz.list_of_questions || []));
      setIsLoading(false);
      setError(null);
      return;
    }

    if (!quizName) {
      setIsLoading(false);
      setError("No quiz selected. Please return to the quiz list.");
      return;
    }

    setIsLoading(true);
    fetch(QUIZZES_ENDPOINT)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const match = (data.quizzes || []).find(
          (quiz) => quiz.file_name === quizName
        );
        if (!match) {
          throw new Error(`Quiz ${quizName} not found`);
        }
        setQuestions(shuffleQuizQuestions(match.list_of_questions || []));
        setIsLoading(false);
      })
      .catch((fetchError) => {
        console.error("Error fetching quiz data:", fetchError);
        setError(`Failed to load quiz: ${quizName}. Please try again.`);
        setIsLoading(false);
      });
  }, [selectedQuiz, quizName]);

  const handleAnswerOptionClick = (isCorrect, index) => {
    setSelectedAnswer(index);
    setIsAnswered(true);
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentQuestionIndex]: index, // Store the selected index for the current question
    }));

    if (isCorrect) {
      setScore(score + 1);
    }

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

  const getButtonClass = (qIndex, ansIndex, reviewMode = false) => {
    const currentQ = questions[qIndex];
    const correctAnswerIndex = currentQ.correct_answer;
    const userAnswerIndex = userAnswers[qIndex];

    if (!reviewMode) {
      // Existing logic for during the quiz
      if (!isAnswered) return "answer-button";
      if (ansIndex === selectedAnswer) {
        return ansIndex === correctAnswerIndex
          ? "answer-button correct"
          : "answer-button incorrect";
      }
      if (ansIndex === correctAnswerIndex)
        return "answer-button correct-unselected";
      return "answer-button disabled";
    } else {
      // Logic for review mode
      const isCorrect = ansIndex === correctAnswerIndex;
      const isUserSelection = ansIndex === userAnswerIndex;

      if (isCorrect) return "answer-button correct review"; // Always highlight correct answer in review
      if (isUserSelection && !isCorrect)
        return "answer-button incorrect review"; // Show user's wrong choice
      return "answer-button disabled review"; // Dim other incorrect options
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
    // Re-shuffle answers for a fresh experience
    setQuestions((prevQuestions) => shuffleQuizQuestions(prevQuestions));
  };

  const backToList = () => {
    navigate("/");
  };

  if (isLoading && !error) {
    // Show loading only if not errored
    return (
      <div className="loading">Loading Quiz: {quizName || "Unknown"}...</div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (questions.length === 0) {
    return <div className="loading">No questions found.</div>;
  }

  return (
    <div className="quiz-container">
      <p className="quiz-name-display">Playing: {quizName}</p>
      {showScore ? (
        <div className="score-section">
          {!showReview ? (
            <>
              <h2>Quiz Complete!</h2>
              <p>
                You scored {score} out of {questions.length}
              </p>
              <div className="score-actions">
                <button onClick={restartQuiz} className="restart-button">
                  Restart This Quiz
                </button>
                <button
                  onClick={() => setShowReview(true)}
                  className="review-button"
                >
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
                  <p className="question-text">
                    <strong>Q{qIndex + 1}:</strong> {question.question}
                  </p>
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
                <button
                  onClick={() => setShowReview(false)}
                  className="back-button"
                >
                  Back to Score
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="question-section">
            <div className="question-count">
              <span>Question {currentQuestionIndex + 1}</span>/
              {questions.length}
            </div>
            <div className="question-text">
              {questions[currentQuestionIndex].question}
            </div>
          </div>
          <div className="answer-section">
            {questions[currentQuestionIndex].answers.map(
              (answerOption, index) => {
                const isCorrect =
                  index === questions[currentQuestionIndex].correct_answer;
                return (
                  <button
                    key={index}
                    onClick={() =>
                      !isAnswered && handleAnswerOptionClick(isCorrect, index)
                    }
                    className={getButtonClass(currentQuestionIndex, index)} // Pass only question and answer index
                    disabled={isAnswered}
                  >
                    {answerOption}
                  </button>
                );
              }
            )}
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / questions.length) * 100
                }%`,
              }}
            ></div>
          </div>
        </>
      )}
    </div>
  );
}

export default Quiz;
