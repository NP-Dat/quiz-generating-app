import React, { useState } from 'react';
import '../css/Quiz.css';
import { QUIZZES_ENDPOINT } from '../config';

const UploadQuizPage = () => {
  const [fileName, setFileName] = useState('');
  const [questionsPreview, setQuestionsPreview] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFileName('');
    setQuestionsPreview(null);
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
        if (!Array.isArray(parsed)) {
          throw new Error('JSON file must contain an array of questions.');
        }
        setQuestionsPreview(parsed);
        setStatus({
          type: 'info',
          message: `Loaded ${parsed.length} questions from ${file.name}.`
        });
      } catch (error) {
        console.error(error);
        setStatus({
          type: 'error',
          message: `Invalid JSON: ${error.message}`
        });
        setQuestionsPreview(null);
      }
    };
    reader.onerror = () => {
      setStatus({ type: 'error', message: 'Failed to read file.' });
      setQuestionsPreview(null);
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
        list_of_questions: questionsPreview
      }
    ];

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(QUIZZES_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Upload failed.');
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
      <h2>Upload Quiz JSON</h2>
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
            placeholder="lecture-7-docker.json"
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
      {questionsPreview && (
        <div className="preview-section">
          <h3>Preview (first question)</h3>
          <pre className="preview-box">
            {JSON.stringify(questionsPreview[0], null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default UploadQuizPage;

