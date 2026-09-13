const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getConversations,
  getThread,
  sendMessage,
} = require('../controllers/messageController');

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.get('/:userId', getThread);
router.post('/', sendMessage);

module.exports = router;
