const mongoose = require('mongoose');

const questionItemSchema = new mongoose.Schema(
  {
    pdf: {
      type: String,
      default: ''
    },
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    pattern: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const questionBankSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    metadata: {
      total_questions: { type: Number, default: 0 },
      includes_user_questions: { type: Boolean, default: false },
      note: { type: String, default: '' }
    },
    questions: {
      type: [questionItemSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('QuestionBank', questionBankSchema);

