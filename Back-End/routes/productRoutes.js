import express from 'express';
import * as productController from '../controllers/productController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Admin routes
router.post('/', requireAuth, requireAdmin, upload.array('images', 10), productController.createProduct);
router.put('/:id', requireAuth, requireAdmin, upload.array('images', 10), productController.updateProduct);
router.delete('/:id', requireAuth, requireAdmin, productController.deleteProduct);
router.delete('/:productId/images/:publicId', requireAuth, requireAdmin, productController.removeProductImage);

export default router;
