import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import { parseSpecifications } from '../controllers/aiController.js';

const router = express.Router();

router.post('/parse-specs', requireAuth, requireAdmin, parseSpecifications);

export default router;

