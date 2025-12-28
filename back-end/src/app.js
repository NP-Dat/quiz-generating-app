const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const createError = require('http-errors');

const quizzesRouter = require('./routes/quizzes');
const questionBanksRouter = require('./routes/questionBanks');

const app = express();

const corsOrigin = process.env.CLIENT_ORIGIN || '*';

app.use(corsOrigin === '*'
  ? cors()
  : cors({ origin: corsOrigin, credentials: true })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/quizzes', quizzesRouter);
app.use('/api/question-banks', questionBanksRouter);

app.use((_req, _res, next) => {
  next(createError(404, 'Route not found'));
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;

