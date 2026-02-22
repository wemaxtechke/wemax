import express from 'express';
import * as flashSaleController from '../controllers/flashSaleController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route - get flash sale settings (raw configuration)
router.get('/', flashSaleController.getFlashSaleSettings);

// Public route - get remaining time for customers (continues after refresh)
router.get('/remaining', flashSaleController.getFlashSaleRemaining);

// Admin route - update flash sale settings
router.put('/', requireAuth, requireAdmin, flashSaleController.updateFlashSaleSettings);

export default router;
