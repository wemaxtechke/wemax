import express from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get('/dashboard', analyticsController.getDashboardStats);

export default router;
