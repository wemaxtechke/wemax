import express from 'express';
import * as packageController from '../controllers/packageController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.get('/', packageController.getPackages);
router.get('/:id', packageController.getPackageById);

// Admin routes
router.post('/', requireAuth, requireAdmin, upload.array('images', 10), packageController.createPackage);
router.put('/:id', requireAuth, requireAdmin, upload.array('images', 10), packageController.updatePackage);
router.delete('/:id', requireAuth, requireAdmin, packageController.deletePackage);

export default router;
