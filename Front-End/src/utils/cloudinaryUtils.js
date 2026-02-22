/**
 * Upload an image to Cloudinary
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The URL of the uploaded image
 */
export const uploadToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    
    if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary configuration is missing. Please check your .env.local file.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'wemax'); // Organize uploads in a folder

    try {
        console.log(`Uploading image: ${file.name} to Cloudinary...`);
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error('Cloudinary error response:', data);
            throw new Error(data.error?.message || `Upload failed with status ${response.status}`);
        }

        console.log(`Successfully uploaded: ${file.name}`, data.secure_url);
        return data.secure_url; // Return the secure HTTPS URL
    } catch (error) {
        console.error('Cloudinary upload error for file', file.name, ':', error);
        throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
    }
};

/**
 * Upload multiple images to Cloudinary
 * @param {File[]} files - Array of image files
 * @returns {Promise<string[]>} - Array of uploaded image URLs
 */
export const uploadMultipleToCloudinary = async (files) => {
    try {
        const uploadPromises = files.map((file) => uploadToCloudinary(file));
        const urls = await Promise.all(uploadPromises);
        return urls;
    } catch (error) {
        console.error('Multiple upload error:', error);
        throw error;
    }
};
