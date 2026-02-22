import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/product/:productId', reviewController.getReviews);
router.post('/product/:productId', requireAuth, reviewController.createReview);
router.put('/:id', requireAuth, reviewController.updateReview);
router.delete('/:id', requireAuth, reviewController.deleteReview);

export default router;
