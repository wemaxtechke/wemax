import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

export const initializeCloudinary = () => {
    // Log environment variables (for debugging)
    console.log('Cloudinary Config:');
    console.log('  CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('  API_KEY:', process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'NOT SET');
    console.log('  API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '***' : 'NOT SET');

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
};

const storage = multer.memoryStorage();

export const upload = multer({ 
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

export const uploadToCloudinary = (buffer, folder = 'wemax') => {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            resource_type: 'auto',
        };
        
        // Only add folder if provided
        if (folder) {
            uploadOptions.folder = folder;
        }

        console.log('=== CLOUDINARY UPLOAD DETAILS ===');
        console.log('Buffer size:', buffer.length, 'bytes');
        
        const cfg = cloudinary.config();
        console.log('Config being used:');
        console.log('  Cloud Name:', cfg.cloud_name);
        console.log('  API Key (first 5):', cfg.api_key ? cfg.api_key.substring(0, 5) + '...' : 'NOT SET');
        console.log('  API Key (last 5):', cfg.api_key ? '...' + cfg.api_key.substring(cfg.api_key.length - 5) : 'NOT SET');
        console.log('  API Secret (length):', cfg.api_secret ? cfg.api_secret.length : 'NOT SET');
        console.log('  API Secret (first 5):', cfg.api_secret ? cfg.api_secret.substring(0, 5) + '...' : 'NOT SET');
        console.log('Upload options:', uploadOptions);
        
        const stream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    console.error('\n❌ UPLOAD FAILED');
                    console.error('Status Code:', error.http_code);
                    console.error('Error Name:', error.name);
                    console.error('Error Message:', error.message);
                    if (error.error) {
                        console.error('Error Details:', error.error);
                    }
                    reject(error);
                }
                else {
                    console.log('\n✅ UPLOAD SUCCESSFUL');
                    console.log('URL:', result.secure_url);
                    resolve(result);
                }
            }
        );
        
        stream.on('error', (err) => {
            console.error('Stream error:', err);
            reject(err);
        });
        
        stream.end(buffer);
    });
};

export default cloudinary;
