const createError = require('http-errors');

const Quiz = require('../models/Quiz');

const formatQuiz = (quiz) => ({
  file_name: quiz.fileName,
  list_of_questions: quiz.questions
});

const validatePayloadItem = (item, index) => {
  if (typeof item !== 'object' || item === null) {
    throw createError(400, `Item at index ${index} must be an object`);
  }

  if (!item.file_name || typeof item.file_name !== 'string') {
    throw createError(400, `Item at index ${index} must include a non-empty file_name`);
  }

  if (!Array.isArray(item.list_of_questions)) {
    throw createError(400, `Item at index ${index} must include list_of_questions array`);
  }

  item.list_of_questions.forEach((question, qIndex) => {
    if (typeof question.question !== 'string') {
      throw createError(400, `Question ${qIndex} in ${item.file_name} is missing text`);
    }

    if (!Array.isArray(question.answers) || question.answers.length === 0) {
      throw createError(400, `Question ${qIndex} in ${item.file_name} must include answers`);
    }

    if (typeof question.correct_answer !== 'number') {
      throw createError(400, `Question ${qIndex} in ${item.file_name} missing numeric correct_answer`);
    }
  });
};

exports.getAllQuizzes = async (_req, res, next) => {
  try {
    const quizzes = await Quiz.find().sort({ fileName: 1 });
    res.json({
      quizzes: quizzes.map(formatQuiz)
    });
  } catch (error) {
    next(error);
  }
};

exports.upsertQuizzes = async (req, res, next) => {
  try {
    const payload = req.body;

    if (!Array.isArray(payload) || payload.length === 0) {
      throw createError(400, 'Payload must be a non-empty array');
    }

    payload.forEach(validatePayloadItem);

    const operations = payload.map((item) => ({
      updateOne: {
        filter: { fileName: item.file_name },
        update: {
          fileName: item.file_name,
          questions: item.list_of_questions
        },
        upsert: true
      }
    }));

    await Quiz.bulkWrite(operations);

    const updated = await Quiz.find({
      fileName: { $in: payload.map((item) => item.file_name) }
    }).sort({ fileName: 1 });

    res.status(201).json({
      updated: updated.map(formatQuiz)
    });
  } catch (error) {
    next(error);
  }
};

