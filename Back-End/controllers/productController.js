import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import cloudinary from '../config/cloudinary.js';

export const getProducts = async (req, res) => {
    try {
        const {
            search,
            category,
            subCategory,
            brand,
            minPrice,
            maxPrice,
            sort = '-createdAt',
            page = 1,
            limit = 20,
            flashDeal,
            freeShipping,
        } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
            ];
        }

        if (category) query.category = category;
        if (subCategory) query.subCategory = subCategory;
        if (brand) query.brand = { $regex: new RegExp(`^${String(brand).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
        if (minPrice || maxPrice) {
            query.newPrice = {};
            if (minPrice) query.newPrice.$gte = Number(minPrice);
            if (maxPrice) query.newPrice.$lte = Number(maxPrice);
        }
        if (flashDeal === 'true') query.isFlashDeal = true;
        if (freeShipping === 'true') query.freeShipping = true;

        const skip = (Number(page) - 1) * Number(limit);

        const products = await Product.find(query)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        const total = await Product.countDocuments(query);

        res.json({
            products,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            total,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        // Validate MongoDB ObjectId format
        if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ message: error.message });
    }
};

function parseProductBody(body) {
    const specRaw = body.specifications;
    let specifications = [];
    if (specRaw) {
        try {
            specifications = typeof specRaw === 'string' ? JSON.parse(specRaw) : specRaw;
        } catch (_) {}
    }
    return {
        name: body.name,
        description: body.description || '',
        category: body.category,
        subCategory: body.subCategory,
        brand: body.brand || '',
        newPrice: Number(body.newPrice) || 0,
        oldPrice: body.oldPrice !== undefined && body.oldPrice !== '' ? Number(body.oldPrice) : undefined,
        freeShipping: body.freeShipping === 'true' || body.freeShipping === true,
        stock: Number(body.stock) || 0,
        isFeatured: body.isFeatured === 'true' || body.isFeatured === true,
        isFlashDeal: body.isFlashDeal === 'true' || body.isFlashDeal === true,
        specifications: Array.isArray(specifications) ? specifications : [],
    };
}

export const createProduct = async (req, res) => {
    try {
        const images = [];
        
        // Handle file uploads
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    console.log(`Uploading file: ${file.originalname} (${file.size} bytes) to Cloudinary...`);
                    const result = await uploadToCloudinary(file.buffer, 'wemax/products');
                    console.log(`Successfully uploaded: ${file.originalname} -> ${result.secure_url}`);
                    images.push({ url: result.secure_url, publicId: result.public_id });
                } catch (err) {
                    console.error(`Cloudinary upload FAILED for ${file.originalname}:`, err);
                    return res.status(400).json({ message: `Image upload failed: ${err.message}` });
                }
            }
        }

        const data = parseProductBody(req.body);
        const product = await Product.create({ ...data, images });

        res.status(201).json(product);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const images = [...(product.images || [])];
        
        // Handle file uploads
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    console.log(`Uploading file: ${file.originalname} (${file.size} bytes) to Cloudinary...`);
                    const result = await uploadToCloudinary(file.buffer, 'wemax/products');
                    console.log(`Successfully uploaded: ${file.originalname} -> ${result.secure_url}`);
                    images.push({ url: result.secure_url, publicId: result.public_id });
                } catch (err) {
                    console.error(`Cloudinary upload FAILED for ${file.originalname}:`, err);
                    return res.status(400).json({ message: `Image upload failed: ${err.message}` });
                }
            }
        }
        
        const data = parseProductBody(req.body);
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { ...data, images },
            { new: true, runValidators: true }
        );

        res.json(updatedProduct);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        for (const image of product.images || []) {
            if (image.publicId) {
                try {
                    await cloudinary.uploader.destroy(image.publicId);
                } catch (_) {}
            }
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeProductImage = async (req, res) => {
    try {
        const { productId, publicId } = req.params;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (_) {}
        product.images = (product.images || []).filter(img => img.publicId !== publicId);
        await product.save();

        res.json({ message: 'Image removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
