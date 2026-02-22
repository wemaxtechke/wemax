import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.get('/:id/quotation', orderController.getQuotationPDF);
router.patch('/:id/status', requireAdmin, orderController.updateOrderStatus);
router.patch('/:id/payment-confirm', requireAdmin, orderController.confirmPayment);

export default router;
