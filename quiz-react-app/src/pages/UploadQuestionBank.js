import React, { useState } from 'react';
import '../css/Quiz.css';
import { QUESTION_BANKS_ENDPOINT } from '../config';

const UploadQuestionBank = () => {
  const [fileName, setFileName] = useState('');
  const [questionsPreview, setQuestionsPreview] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFileName('');
    setQuestionsPreview(null);
    setMetadata(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      resetForm();
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const parsed = JSON.parse(loadEvent.target.result);
        
        // Support both formats: { questions: [...] } or direct array [...]
        let questions;
        let parsedMetadata = null;
        
        if (Array.isArray(parsed)) {
          questions = parsed;
        } else if (parsed.questions && Array.isArray(parsed.questions)) {
          questions = parsed.questions;
          parsedMetadata = parsed.metadata || null;
        } else {
          throw new Error('JSON file must contain a "questions" array or be an array of questions.');
        }

        // Validate question format
        questions.forEach((q, index) => {
          if (!q.question || typeof q.question !== 'string') {
            throw new Error(`Question at index ${index} is missing "question" field.`);
          }
          if (!q.answer || typeof q.answer !== 'string') {
            throw new Error(`Question at index ${index} is missing "answer" field.`);
          }
        });

        setQuestionsPreview(questions);
        setMetadata(parsedMetadata);
        setStatus({
          type: 'info',
          message: `Loaded ${questions.length} questions from ${file.name}.`
        });
      } catch (error) {
        console.error(error);
        setStatus({
          type: 'error',
          message: `Invalid JSON: ${error.message}`
        });
        setQuestionsPreview(null);
        setMetadata(null);
      }
    };
    reader.onerror = () => {
      setStatus({ type: 'error', message: 'Failed to read file.' });
      setQuestionsPreview(null);
      setMetadata(null);
    };

    reader.readAsText(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formElement = event.target;
    if (!fileName || !questionsPreview) {
      setStatus({ type: 'error', message: 'Please choose a JSON file first.' });
      return;
    }

    const payload = [
      {
        file_name: fileName,
        metadata: metadata || {
          total_questions: questionsPreview.length,
          includes_user_questions: true,
          note: 'Uploaded via web interface'
        },
        questions: questionsPreview
      }
    ];

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(QUESTION_BANKS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Upload failed.');
      }

      setStatus({
        type: 'success',
        message: `Successfully uploaded ${fileName}.`
      });
      resetForm();
      formElement.reset();
    } catch (error) {
      console.error(error);
      setStatus({
        type: 'error',
        message: error.message || 'Upload failed.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Question Bank JSON</h2>
      <p className="upload-description">
        Upload a JSON file containing questions with "question", "answer", and optional "pattern" fields.
      </p>
      <form className="upload-form" onSubmit={handleSubmit}>
        <label className="upload-label">
          Choose JSON File
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="file-input"
          />
        </label>
        <label className="upload-label">
          File Name to Save
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="network-fundamentals.json"
            className="text-input"
          />
        </label>
        <button type="submit" className="start-quiz-button" disabled={isSubmitting}>
          {isSubmitting ? 'Uploading...' : 'Upload to Database'}
        </button>
      </form>
      {status.message && (
        <p className={`status-message ${status.type}`}>{status.message}</p>
      )}
      {questionsPreview && questionsPreview.length > 0 && (
        <div className="preview-section">
          <h3>Preview (first question)</h3>
          <div className="preview-box">
            <p><strong>Question:</strong> {questionsPreview[0].question}</p>
            <p><strong>Answer:</strong> {questionsPreview[0].answer}</p>
            {questionsPreview[0].pattern && (
              <p><strong>Pattern:</strong> {questionsPreview[0].pattern}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadQuestionBank;

