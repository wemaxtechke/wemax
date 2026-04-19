import { prisma } from '../lib/prisma.js';
import { parseIntId } from '../lib/parseId.js';
import { formatProduct, parseSort, productDetailInclude } from '../lib/apiFormatters.js';
import { saveUploadBuffer, deleteStoredFile } from '../config/storage.js';

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
            createdByEmail,
        } = req.query;

        const where = { AND: [] };

        if (search) {
            const q = String(search);
            where.AND.push({
                OR: [
                    { name: { contains: q } },
                    { description: { contains: q } },
                    { brand: { contains: q } },
                ],
            });
        }

        if (category) where.AND.push({ category });
        if (subCategory) where.AND.push({ subCategory });
        if (brand) {
            where.AND.push({ brand: String(brand) });
        }
        if (minPrice || maxPrice) {
            const np = {};
            if (minPrice) np.gte = Number(minPrice);
            if (maxPrice) np.lte = Number(maxPrice);
            where.AND.push({ newPrice: np });
        }
        if (flashDeal === 'true') where.AND.push({ isFlashDeal: true });
        if (freeShipping === 'true') where.AND.push({ freeShipping: true });
        if (createdByEmail) where.AND.push({ createdByEmail });

        const whereFinal = where.AND.length ? where : {};

        const skip = (Number(page) - 1) * Number(limit);
        const orderBy = parseSort(sort);

        const [rows, total] = await Promise.all([
            prisma.product.findMany({
                where: whereFinal,
                orderBy,
                skip,
                take: Number(limit),
                include: productDetailInclude,
            }),
            prisma.product.count({ where: whereFinal }),
        ]);

        res.json({
            products: rows.map(formatProduct),
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
        const id = parseIntId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const product = await prisma.product.findUnique({
            where: { id },
            include: productDetailInclude,
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(formatProduct(product));
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ message: error.message });
    }
};

function parseLocationShipping(body) {
    const raw = body.locationShipping;
    if (raw === undefined || raw === '') return undefined;
    try {
        const v = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return v && typeof v === 'object' && !Array.isArray(v) ? v : undefined;
    } catch {
        return undefined;
    }
}

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
        locationShipping: parseLocationShipping(body),
    };
}

export const createProduct = async (req, res) => {
    try {
        const images = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    console.log(`Saving file: ${file.originalname} (${file.size} bytes) locally...`);
                    const result = await saveUploadBuffer(file.buffer, 'wemax/products', file.originalname);
                    console.log(`Successfully saved: ${file.originalname} -> ${result.secure_url}`);
                    images.push({ url: result.secure_url, publicId: result.public_id });
                } catch (err) {
                    console.error(`Image upload FAILED for ${file.originalname}:`, err);
                    return res.status(400).json({ message: `Image upload failed: ${err.message}` });
                }
            }
        }

        const data = parseProductBody(req.body);
        const creator = req.user || null;

        const product = await prisma.product.create({
            data: {
                name: data.name,
                description: data.description,
                category: data.category,
                subCategory: data.subCategory,
                brand: data.brand,
                newPrice: data.newPrice,
                oldPrice: data.oldPrice,
                freeShipping: data.freeShipping,
                stock: data.stock,
                isFeatured: data.isFeatured,
                isFlashDeal: data.isFlashDeal,
                locationShipping: data.locationShipping ?? undefined,
                createdById: creator?.id,
                createdByEmail: creator?.email || undefined,
                images: {
                    create: images.map((im, i) => ({
                        url: im.url,
                        publicId: im.publicId,
                        sortOrder: i,
                    })),
                },
                specifications: {
                    create: data.specifications
                        .filter((s) => s && s.key)
                        .map((s) => ({ key: s.key, value: s.value || '' })),
                },
            },
            include: productDetailInclude,
        });

        res.status(201).json(formatProduct(product));
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const id = parseIntId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const existing = await prisma.product.findUnique({
            where: { id },
            include: { images: true },
        });
        if (!existing) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const newUploads = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const result = await saveUploadBuffer(file.buffer, 'wemax/products', file.originalname);
                    newUploads.push({ url: result.secure_url, publicId: result.public_id });
                } catch (err) {
                    return res.status(400).json({ message: `Image upload failed: ${err.message}` });
                }
            }
        }

        const data = parseProductBody(req.body);
        const mergedImages = [...(existing.images || []).map((i) => ({ url: i.url, publicId: i.publicId })), ...newUploads];

        await prisma.$transaction([
            prisma.productImage.deleteMany({ where: { productId: id } }),
            prisma.productSpec.deleteMany({ where: { productId: id } }),
        ]);

        const product = await prisma.product.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                category: data.category,
                subCategory: data.subCategory,
                brand: data.brand,
                newPrice: data.newPrice,
                oldPrice: data.oldPrice,
                freeShipping: data.freeShipping,
                stock: data.stock,
                isFeatured: data.isFeatured,
                isFlashDeal: data.isFlashDeal,
                ...(data.locationShipping !== undefined ? { locationShipping: data.locationShipping } : {}),
                images: {
                    create: mergedImages.map((im, i) => ({
                        url: im.url,
                        publicId: im.publicId || null,
                        sortOrder: i,
                    })),
                },
                specifications: {
                    create: data.specifications
                        .filter((s) => s && s.key)
                        .map((s) => ({ key: s.key, value: s.value || '' })),
                },
            },
            include: productDetailInclude,
        });

        res.json(formatProduct(product));
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const id = parseIntId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const product = await prisma.product.findUnique({
            where: { id },
            include: { images: true },
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        for (const image of product.images || []) {
            if (image.publicId) {
                try {
                    await deleteStoredFile(image.publicId);
                } catch (_) {}
            }
        }

        await prisma.product.delete({ where: { id } });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeProductImage = async (req, res) => {
    try {
        const productId = parseIntId(req.params.productId);
        const publicId = decodeURIComponent(req.params.publicId || '');
        if (!productId) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        try {
            await deleteStoredFile(publicId);
        } catch (_) {}

        await prisma.productImage.deleteMany({ where: { productId, publicId } });

        res.json({ message: 'Image removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
