import express from 'express';
import * as chatController from '../controllers/chatController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', requireAdmin, chatController.getChats);
router.get('/me', chatController.getMyChat);
router.get('/:chatId/messages', chatController.getMessages);
router.post('/send', chatController.sendMessage);

export default router;
