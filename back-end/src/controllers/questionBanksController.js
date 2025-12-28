const createError = require('http-errors');

const QuestionBank = require('../models/QuestionBank');

const formatQuestionBank = (qb) => ({
  file_name: qb.fileName,
  metadata: qb.metadata,
  questions: qb.questions
});

const validatePayloadItem = (item, index) => {
  if (typeof item !== 'object' || item === null) {
    throw createError(400, `Item at index ${index} must be an object`);
  }

  if (!item.file_name || typeof item.file_name !== 'string') {
    throw createError(400, `Item at index ${index} must include a non-empty file_name`);
  }

  if (!Array.isArray(item.questions)) {
    throw createError(400, `Item at index ${index} must include questions array`);
  }

  item.questions.forEach((question, qIndex) => {
    if (typeof question.question !== 'string' || !question.question.trim()) {
      throw createError(400, `Question ${qIndex} in ${item.file_name} is missing question text`);
    }

    if (typeof question.answer !== 'string' || !question.answer.trim()) {
      throw createError(400, `Question ${qIndex} in ${item.file_name} is missing answer text`);
    }
  });
};

exports.getAllQuestionBanks = async (_req, res, next) => {
  try {
    const questionBanks = await QuestionBank.find().sort({ fileName: 1 });
    res.json({
      questionBanks: questionBanks.map(formatQuestionBank)
    });
  } catch (error) {
    next(error);
  }
};

exports.getQuestionBankByName = async (req, res, next) => {
  try {
    const { fileName } = req.params;
    const questionBank = await QuestionBank.findOne({ fileName });

    if (!questionBank) {
      throw createError(404, `Question bank "${fileName}" not found`);
    }

    res.json(formatQuestionBank(questionBank));
  } catch (error) {
    next(error);
  }
};

exports.upsertQuestionBanks = async (req, res, next) => {
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
          metadata: item.metadata || {
            total_questions: item.questions.length,
            includes_user_questions: false,
            note: ''
          },
          questions: item.questions
        },
        upsert: true
      }
    }));

    await QuestionBank.bulkWrite(operations);

    const updated = await QuestionBank.find({
      fileName: { $in: payload.map((item) => item.file_name) }
    }).sort({ fileName: 1 });

    res.status(201).json({
      updated: updated.map(formatQuestionBank)
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteQuestionBank = async (req, res, next) => {
  try {
    const { fileName } = req.params;
    const result = await QuestionBank.findOneAndDelete({ fileName });

    if (!result) {
      throw createError(404, `Question bank "${fileName}" not found`);
    }

    res.json({ message: `Question bank "${fileName}" deleted successfully` });
  } catch (error) {
    next(error);
  }
};

