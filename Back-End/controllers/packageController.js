import Package from '../models/Package.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import cloudinary from '../config/cloudinary.js';

function parsePackageBody(body) {
    let items = [];
    if (body.items) {
        try {
            items = typeof body.items === 'string' ? JSON.parse(body.items) : body.items;
        } catch (_) {}
    }
    return {
        name: body.name,
        description: body.description || '',
        items: Array.isArray(items) ? items : [],
        totalPrice: Number(body.totalPrice) || 0,
        oldTotalPrice: body.oldTotalPrice !== undefined && body.oldTotalPrice !== '' ? Number(body.oldTotalPrice) : undefined,
        freeShipping: body.freeShipping === 'true' || body.freeShipping === true,
        category: body.category || '',
        tag: body.tag || '',
    };
}

export const getPackages = async (req, res) => {
    try {
        const { search, category, tag, sort = '-createdAt', page = 1, limit = 20 } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        if (category) query.category = category;
        if (tag) query.tag = tag;

        const skip = (Number(page) - 1) * Number(limit);

        const packages = await Package.find(query)
            .populate('items.product')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        const total = await Package.countDocuments(query);

        res.json({
            packages,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            total,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPackageById = async (req, res) => {
    try {
        const packageDoc = await Package.findById(req.params.id).populate('items.product');
        if (!packageDoc) {
            return res.status(404).json({ message: 'Package not found' });
        }
        res.json(packageDoc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createPackage = async (req, res) => {
    try {
        const images = [];
        
        // Handle file uploads
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    console.log(`Uploading file: ${file.originalname} (${file.size} bytes) to Cloudinary...`);
                    const result = await uploadToCloudinary(file.buffer, 'wemax/packages');
                    console.log(`Successfully uploaded: ${file.originalname} -> ${result.secure_url}`);
                    images.push({ url: result.secure_url, publicId: result.public_id });
                } catch (err) {
                    console.error(`Cloudinary upload FAILED for ${file.originalname}:`, err);
                    return res.status(400).json({ message: `Image upload failed: ${err.message}` });
                }
            }
        }
        
        const data = parsePackageBody(req.body);
        const packageDoc = await Package.create({ ...data, images });
        const populatedPackage = await Package.findById(packageDoc._id).populate('items.product');
        res.status(201).json(populatedPackage);
    } catch (error) {
        console.error('Create package error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const updatePackage = async (req, res) => {
    try {
        const packageDoc = await Package.findById(req.params.id);
        if (!packageDoc) {
            return res.status(404).json({ message: 'Package not found' });
        }
        
        const images = [...(packageDoc.images || [])];
        
        // Handle file uploads
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    console.log(`Uploading file: ${file.originalname} (${file.size} bytes) to Cloudinary...`);
                    const result = await uploadToCloudinary(file.buffer, 'wemax/packages');
                    console.log(`Successfully uploaded: ${file.originalname} -> ${result.secure_url}`);
                    images.push({ url: result.secure_url, publicId: result.public_id });
                } catch (err) {
                    console.error(`Cloudinary upload FAILED for ${file.originalname}:`, err);
                    return res.status(400).json({ message: `Image upload failed: ${err.message}` });
                }
            }
        }
        
        const data = parsePackageBody(req.body);
        const updatedPackage = await Package.findByIdAndUpdate(
            req.params.id,
            { ...data, images },
            { new: true, runValidators: true }
        ).populate('items.product');
        res.json(updatedPackage);
    } catch (error) {
        console.error('Update package error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const deletePackage = async (req, res) => {
    try {
        const packageDoc = await Package.findById(req.params.id);
        if (!packageDoc) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Delete images from Cloudinary
        for (const image of packageDoc.images || []) {
            if (image.publicId) {
                try {
                    await cloudinary.uploader.destroy(image.publicId);
                } catch (_) {}
            }
        }

        await Package.findByIdAndDelete(req.params.id);
        res.json({ message: 'Package deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
