const { Router } = require('express');

const { getAllQuizzes, upsertQuizzes } = require('../controllers/quizzesController');

const router = Router();

router.get('/', getAllQuizzes);
router.post('/', upsertQuizzes);

module.exports = router;

