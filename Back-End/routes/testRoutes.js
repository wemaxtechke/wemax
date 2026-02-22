import express from 'express';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Simple test to check if credentials are configured
router.get('/cloudinary-config', (req, res) => {
    const config = cloudinary.config();
    
    console.log('=== CLOUDINARY CONFIG CHECK ===');
    console.log('Cloud Name:', config.cloud_name || 'NOT SET');
    console.log('API Key length:', config.api_key ? config.api_key.length + ' chars' : 'NOT SET');
    console.log('API Secret length:', config.api_secret ? config.api_secret.length + ' chars' : 'NOT SET');
    
    res.json({
        cloudName: config.cloud_name || 'NOT SET',
        apiKeyConfigured: !!config.api_key,
        apiKeyLength: config.api_key ? config.api_key.length : 0,
        apiSecretConfigured: !!config.api_secret,
        apiSecretLength: config.api_secret ? config.api_secret.length : 0,
        nodeEnv: process.env.NODE_ENV,
    });
});

// Test endpoint to verify Cloudinary is working
router.post('/cloudinary-test', async (req, res) => {
    try {
        console.log('=== CLOUDINARY TEST ===');
        console.log('Received test request');

        const config = cloudinary.config();
        console.log('Current config:');
        console.log('  Cloud Name:', config.cloud_name);
        console.log('  API Key:', config.api_key ? 'SET (' + config.api_key.length + ' chars)' : 'NOT SET');
        console.log('  API Secret:', config.api_secret ? 'SET (' + config.api_secret.length + ' chars)' : 'NOT SET');

        // Create a simple test image buffer (1x1 pixel red PNG)
        const testImageBuffer = Buffer.from([
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
            0x00, 0x00, 0x03, 0x00, 0x01, 0x6b, 0xe6, 0x3d, 0xbb, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
            0x44, 0xae, 0x42, 0x60, 0x82
        ]);

        console.log('Test buffer created, size:', testImageBuffer.length, 'bytes');
        console.log('Attempting upload to Cloudinary...');

        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { resource_type: 'auto', folder: 'wemax/test' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(testImageBuffer);
        });

        console.log('✅ UPLOAD SUCCESSFUL');
        console.log('URL:', result.secure_url);

        res.json({
            success: true,
            message: 'Cloudinary upload test successful!',
            url: result.secure_url,
            publicId: result.public_id,
        });
    } catch (error) {
        console.error('❌ CLOUDINARY TEST FAILED');
        console.error('Error type:', error.name);
        console.error('Error message:', error.message);
        console.error('HTTP code:', error.http_code);
        console.error('Full error:', JSON.stringify(error, null, 2));

        res.status(400).json({
            success: false,
            message: 'Cloudinary upload test failed',
            error: error.message,
            details: {
                http_code: error.http_code,
                name: error.name,
            }
        });
    }
});

export default router;
