import express from 'express';
import {
  getOrCreateConversation,
  getUserConversations,
  getConversationMessages,
  sendMessageHttp,
} from '../controllers/chatController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All chat endpoints require authentication
router.use(protect);

router.post('/conversations', getOrCreateConversation);
router.get('/conversations', getUserConversations);
router.get('/conversations/:conversationId/messages', getConversationMessages);
router.post('/conversations/:conversationId/messages', sendMessageHttp);

export default router;
