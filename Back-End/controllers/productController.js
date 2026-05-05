import { executeQuery, executeTransaction } from '../lib/mysql.js';
import { parseIntId } from '../lib/parseId.js';
import { formatProduct, parseSortForSQL } from '../lib/apiFormatters.js';
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

        // Build WHERE conditions
        const conditions = [];
        const params = [];

        if (search) {
            const q = `%${String(search)}%`;
            conditions.push('(p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)');
            params.push(q, q, q);
        }

        if (category) {
            conditions.push('p.category = ?');
            params.push(category);
        }
        if (subCategory) {
            conditions.push('p.subCategory = ?');
            params.push(subCategory);
        }
        if (brand) {
            conditions.push('p.brand = ?');
            params.push(String(brand));
        }
        if (minPrice) {
            conditions.push('p.newPrice >= ?');
            params.push(Number(minPrice));
        }
        if (maxPrice) {
            conditions.push('p.newPrice <= ?');
            params.push(Number(maxPrice));
        }
        if (flashDeal === 'true') {
            conditions.push('p.isFlashDeal = true');
        }
        if (freeShipping === 'true') {
            conditions.push('p.freeShipping = true');
        }
        if (createdByEmail) {
            conditions.push('p.createdByEmail = ?');
            params.push(createdByEmail);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Pagination
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        // Sorting
        const orderBy = parseSortForSQL(sort) || 'createdAt DESC';

        // Count total
        const countQuery = `SELECT COUNT(*) as total FROM Product p ${whereClause}`;
        const countResult = await executeQuery(countQuery, params);
        const total = countResult[0].total;

        // Get products with related data
        const productsQuery = `
            SELECT 
                p.*,
                pi.url as imageUrl,
                ps.specKey,
                ps.value as specValue
            FROM Product p
            LEFT JOIN ProductImage pi ON p.id = pi.productId AND pi.sortOrder = 0
            LEFT JOIN ProductSpec ps ON p.id = ps.productId
            ${whereClause}
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `;
        const rows = await executeQuery(productsQuery, [...params, take, skip]);

        // Group product specs and format
        const productsMap = new Map();
        rows.forEach(row => {
            if (!productsMap.has(row.id)) {
                productsMap.set(row.id, {
                    ...row,
                    images: row.imageUrl ? [{ url: row.imageUrl, sortOrder: 0 }] : [],
                    specifications: []
                });
            }
            if (row.specKey && row.specValue) {
                const product = productsMap.get(row.id);
                product.specifications.push({
                    specKey: row.specKey,
                    value: row.specValue
                });
            }
        });

        const products = Array.from(productsMap.values()).map(formatProduct);

        res.json({
            products,
            totalPages: Math.ceil(total / take),
            currentPage: Number(page),
            total,
        });
    } catch (error) {
        console.error('getProducts error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const id = parseIntId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        // Get product with images and specs
        const products = await executeQuery(`
            SELECT 
                p.*,
                pi.id as imageId,
                pi.url as imageUrl,
                pi.publicId as imagePublicId,
                pi.sortOrder as imageSortOrder,
                ps.id as specId,
                ps.specKey,
                ps.value as specValue
            FROM Product p
            LEFT JOIN ProductImage pi ON p.id = pi.productId
            LEFT JOIN ProductSpec ps ON p.id = ps.productId
            WHERE p.id = ?
        `, [id]);

        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Group product data
        const product = {
            ...products[0],
            images: [],
            specifications: []
        };

        const imageMap = new Map();
        products.forEach(row => {
            if (row.imageId && !imageMap.has(row.imageId)) {
                imageMap.set(row.imageId, {
                    id: row.imageId,
                    url: row.imageUrl,
                    publicId: row.imagePublicId,
                    sortOrder: row.imageSortOrder
                });
            }
            if (row.specId && row.specKey) {
                const exists = product.specifications.find(s => s.id === row.specId);
                if (!exists) {
                    product.specifications.push({
                        id: row.specId,
                        specKey: row.specKey,
                        value: row.specValue
                    });
                }
            }
        });

        product.images = Array.from(imageMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);

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

        // Insert product
        const productResult = await executeQuery(
            `INSERT INTO Product (
                name, description, category, subCategory, brand,
                newPrice, oldPrice, freeShipping, stock, isFeatured, isFlashDeal,
                locationShipping, createdById, createdByEmail, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                data.name,
                data.description,
                data.category,
                data.subCategory,
                data.brand,
                data.newPrice,
                data.oldPrice || null,
                data.freeShipping,
                data.stock,
                data.isFeatured,
                data.isFlashDeal,
                data.locationShipping ? JSON.stringify(data.locationShipping) : null,
                creator?.id || null,
                creator?.email || null
            ]
        );

        const productId = productResult.insertId;

        // Insert images
        if (images.length > 0) {
            const imageQueries = images.map((im, i) => ({
                query: `INSERT INTO ProductImage (productId, url, publicId, sortOrder) VALUES (?, ?, ?, ?)`,
                params: [productId, im.url, im.publicId, i]
            }));
            await executeTransaction(imageQueries);
        }

        // Insert specifications
        const validSpecs = data.specifications.filter(s => s && s.key);
        if (validSpecs.length > 0) {
            const specQueries = validSpecs.map(s => ({
                query: `INSERT INTO ProductSpec (productId, specKey, value) VALUES (?, ?, ?)`,
                params: [productId, s.key, s.value || '']
            }));
            await executeTransaction(specQueries);
        }

        // Fetch complete product with relations
        const product = await getProductWithRelations(productId);

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

        // Check if product exists
        const existingProducts = await executeQuery('SELECT * FROM Product WHERE id = ?', [id]);
        if (existingProducts.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const existing = existingProducts[0];

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

        // Get existing images
        const existingImages = await executeQuery(
            'SELECT * FROM ProductImage WHERE productId = ?',
            [id]
        );
        const mergedImages = [...existingImages.map(i => ({ url: i.url, publicId: i.publicId })), ...newUploads];

        // Update product
        await executeQuery(
            `UPDATE Product SET
                name = ?, description = ?, category = ?, subCategory = ?, brand = ?,
                newPrice = ?, oldPrice = ?, freeShipping = ?, stock = ?,
                isFeatured = ?, isFlashDeal = ?, locationShipping = ?, updatedAt = NOW()
            WHERE id = ?`,
            [
                data.name, data.description, data.category, data.subCategory, data.brand,
                data.newPrice, data.oldPrice || null, data.freeShipping, data.stock,
                data.isFeatured, data.isFlashDeal,
                data.locationShipping ? JSON.stringify(data.locationShipping) : null,
                id
            ]
        );

        // Delete old images and specs
        await executeQuery('DELETE FROM ProductImage WHERE productId = ?', [id]);
        await executeQuery('DELETE FROM ProductSpec WHERE productId = ?', [id]);

        // Insert new images
        if (mergedImages.length > 0) {
            const imageQueries = mergedImages.map((im, i) => ({
                query: `INSERT INTO ProductImage (productId, url, publicId, sortOrder) VALUES (?, ?, ?, ?)`,
                params: [id, im.url, im.publicId || null, i]
            }));
            await executeTransaction(imageQueries);
        }

        // Insert new specifications
        const validSpecs = data.specifications.filter(s => s && s.key);
        if (validSpecs.length > 0) {
            const specQueries = validSpecs.map(s => ({
                query: `INSERT INTO ProductSpec (productId, specKey, value) VALUES (?, ?, ?)`,
                params: [id, s.key, s.value || '']
            }));
            await executeTransaction(specQueries);
        }

        // Fetch updated product
        const product = await getProductWithRelations(id);

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

        // Get product with images
        const products = await executeQuery(
            'SELECT * FROM Product WHERE id = ?',
            [id]
        );
        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Get product images for deletion
        const images = await executeQuery(
            'SELECT * FROM ProductImage WHERE productId = ?',
            [id]
        );

        // Delete images from storage
        for (const image of images || []) {
            if (image.publicId) {
                try {
                    await deleteStoredFile(image.publicId);
                } catch (_) {}
            }
        }

        // Delete product (cascade will handle related records)
        await executeQuery('DELETE FROM Product WHERE id = ?', [id]);
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

        // Check if product exists
        const products = await executeQuery('SELECT * FROM Product WHERE id = ?', [productId]);
        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        try {
            await deleteStoredFile(publicId);
        } catch (_) {}

        await executeQuery(
            'DELETE FROM ProductImage WHERE productId = ? AND publicId = ?',
            [productId, publicId]
        );

        res.json({ message: 'Image removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to get product with all relations
async function getProductWithRelations(productId) {
    const products = await executeQuery(`
        SELECT 
            p.*,
            pi.id as imageId,
            pi.url as imageUrl,
            pi.publicId as imagePublicId,
            pi.sortOrder as imageSortOrder,
            ps.id as specId,
            ps.specKey,
            ps.value as specValue
        FROM Product p
        LEFT JOIN ProductImage pi ON p.id = pi.productId
        LEFT JOIN ProductSpec ps ON p.id = ps.productId
        WHERE p.id = ?
    `, [productId]);

    if (products.length === 0) return null;

    const product = {
        ...products[0],
        images: [],
        specifications: []
    };

    const imageMap = new Map();
    products.forEach(row => {
        if (row.imageId && !imageMap.has(row.imageId)) {
            imageMap.set(row.imageId, {
                id: row.imageId,
                url: row.imageUrl,
                publicId: row.imagePublicId,
                sortOrder: row.imageSortOrder
            });
        }
        if (row.specId && row.specKey) {
            const exists = product.specifications.find(s => s.id === row.specId);
            if (!exists) {
                product.specifications.push({
                    id: row.specId,
                    specKey: row.specKey,
                    value: row.specValue
                });
            }
        }
    });

    product.images = Array.from(imageMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);
    return product;
}
