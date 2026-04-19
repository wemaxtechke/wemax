import express from 'express';
import { getPublicBaseUrl, getUploadsRoot, saveUploadBuffer, deleteStoredFile } from '../config/storage.js';

const router = express.Router();

router.get('/storage-config', (req, res) => {
    res.json({
        uploadsRoot: getUploadsRoot(),
        publicBaseUrl: getPublicBaseUrl(),
        staticMount: `${getPublicBaseUrl()}/uploads/...`,
    });
});

router.post('/storage-test', async (req, res) => {
    try {
        const testImageBuffer = Buffer.from([
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
            0x00, 0x00, 0x03, 0x00, 0x01, 0x6b, 0xe6, 0x3d, 0xbb, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
            0x44, 0xae, 0x42, 0x60, 0x82,
        ]);

        const result = await saveUploadBuffer(testImageBuffer, 'wemax/test', 'probe.png');
        await deleteStoredFile(result.public_id);

        res.json({
            success: true,
            message: 'Local storage write/delete test successful',
            sampleUrl: result.secure_url,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Local storage test failed',
            error: error.message,
        });
    }
});

export default router;
