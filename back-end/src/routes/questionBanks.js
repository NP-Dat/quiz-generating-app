const { Router } = require('express');

const {
  getAllQuestionBanks,
  getQuestionBankByName,
  upsertQuestionBanks,
  deleteQuestionBank
} = require('../controllers/questionBanksController');

const router = Router();

router.get('/', getAllQuestionBanks);
router.get('/:fileName', getQuestionBankByName);
router.post('/', upsertQuestionBanks);
router.delete('/:fileName', deleteQuestionBank);

module.exports = router;

