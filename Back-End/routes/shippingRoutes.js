import express from 'express';
import * as shippingController from '../controllers/shippingController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/public', shippingController.getPublicShippingRates);
router.get('/', requireAuth, requireAdmin, shippingController.getShippingRates);
router.post('/', requireAuth, requireAdmin, shippingController.createShippingRate);
router.put('/:id', requireAuth, requireAdmin, shippingController.updateShippingRate);
router.delete('/:id', requireAuth, requireAdmin, shippingController.deleteShippingRate);

export default router;
