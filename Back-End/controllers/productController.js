/** Deploy with these peers on the server (FTP/cPanel uploads): ../lib/productSpecColumn.js + ../lib/productSpecInbound.js.
 * Uploading only this file causes ERR_MODULE_NOT_FOUND and the proxy may return 503 + a misleading browser CORS error. */
import { executeQuery, executeTransaction } from '../lib/mysql.js';
import { parseIntId } from '../lib/parseId.js';
import { formatProduct, parseSortForSQL } from '../lib/apiFormatters.js';
import { saveUploadBuffer, deleteStoredFile } from '../config/storage.js';
import { sqlSpecKeySelect, sqlSpecKeyInsertColumnRef } from '../lib/productSpecColumn.js';
import { normalizeIncomingSpecifications, normalizeIncomingSpec } from '../lib/productSpecInbound.js';
import { rowProductSpecLabel, rowProductSpecValue } from '../lib/productSpecRow.js';

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

        // ProductSpec label column may be specKey or `key` (Prisma migration)
        const specKeySel = await sqlSpecKeySelect('ps');
        const productsQuery = `
            SELECT 
                p.*,
                pi.url as imageUrl,
                ps.id as specJoinSpecId,
                ${specKeySel},
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
            if (row.specJoinSpecId) {
                const product = productsMap.get(row.id);
                product.specifications.push({
                    specKey: rowProductSpecLabel(row),
                    value: rowProductSpecValue(row),
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

        const specKeySel = await sqlSpecKeySelect('ps');
        const products = await executeQuery(
            `
            SELECT 
                p.*,
                pi.id as imageId,
                pi.url as imageUrl,
                pi.publicId as imagePublicId,
                pi.sortOrder as imageSortOrder,
                ps.id as specId,
                ${specKeySel},
                ps.value as specValue
            FROM Product p
            LEFT JOIN ProductImage pi ON p.id = pi.productId
            LEFT JOIN ProductSpec ps ON p.id = ps.productId
            WHERE p.id = ?
        `,
            [id]
        );

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
            if (row.specId) {
                const exists = product.specifications.find((s) => s.id === row.specId);
                if (!exists) {
                    product.specifications.push({
                        id: row.specId,
                        specKey: rowProductSpecLabel(row),
                        value: rowProductSpecValue(row),
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

function ensureSpecificationsArray(specifications) {
    if (Array.isArray(specifications)) return specifications;
    if (specifications && typeof specifications === 'object') {
        const keys = Object.keys(specifications);
        if (keys.length && keys.every((k) => /^\d+$/.test(k))) {
            return keys.sort((a, b) => Number(a) - Number(b)).map((k) => specifications[k]);
        }
    }
    return [];
}

function shouldLogProductSpecs() {
    return process.env.NODE_ENV !== 'production' || process.env.LOG_PRODUCT_SPECS === '1';
}

/**
 * Multipart-safe parse for ProductSpec payloads.
 * Returns whether the field was present, whether JSON.parse failed, and normalized rows for persistence.
 */
function parseSpecificationsFromBody(body) {
    const fieldPresent = Object.prototype.hasOwnProperty.call(body, 'specifications');
    let specRaw = body.specifications;
    if (Buffer.isBuffer(specRaw)) {
        specRaw = specRaw.toString('utf8');
    }
    if (typeof specRaw === 'string') {
        specRaw = specRaw.replace(/^\ufeff/, '').trim();
    }
    const rawLength =
        typeof specRaw === 'string' ? specRaw.length : specRaw != null ? String(specRaw).length : 0;

    let specifications = [];
    let parseFailed = false;

    if (specRaw != null && specRaw !== '') {
        try {
            specifications = typeof specRaw === 'string' ? JSON.parse(specRaw) : specRaw;
        } catch (err) {
            parseFailed = true;
            if (shouldLogProductSpecs()) {
                const preview =
                    typeof specRaw === 'string'
                        ? specRaw.slice(0, 280)
                        : JSON.stringify(specRaw)?.slice?.(0, 280);
                console.warn(
                    '[parseSpecificationsFromBody] JSON.parse failed:',
                    err?.message || err,
                    'preview:',
                    preview
                );
            }
        }
        while (!parseFailed && typeof specifications === 'string') {
            try {
                specifications = JSON.parse(specifications);
            } catch (err) {
                parseFailed = true;
                if (shouldLogProductSpecs()) {
                    console.warn('[parseSpecificationsFromBody] nested JSON.parse failed:', err?.message || err);
                }
                break;
            }
        }
    }

    if (parseFailed) {
        specifications = [];
    }
    specifications = ensureSpecificationsArray(specifications);
    const normalized = normalizeIncomingSpecifications(specifications);

    return {
        fieldPresent,
        parseFailed,
        rawLength,
        normalized,
    };
}

function parseProductBody(body) {
    const specParse = parseSpecificationsFromBody(body);
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
        specifications: specParse.normalized,
        specParseMeta: specParse,
        locationShipping: parseLocationShipping(body),
    };
}

/** Persist spec label + value; run full inbound normalization again (label/specKey/key), then value-only fallback. */
function prepareSpecsForStorage(rows) {
    return (Array.isArray(rows) ? rows : [])
        .map((s) => normalizeIncomingSpec(s))
        .filter(Boolean)
        .map((row) => {
            let key = String(row.key ?? '').replace(/\u00a0/g, ' ').trim();
            let value = String(row.value ?? '').replace(/\u00a0/g, ' ').trim();
            if (!key && value) key = 'Details';
            if (!key && !value) return null;
            return { key, value };
        })
        .filter(Boolean)
        .filter((s) => s.key.length > 0);
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
        const validSpecs = prepareSpecsForStorage(data.specifications);
        if (validSpecs.length > 0) {
            const specColSql = await sqlSpecKeyInsertColumnRef();
            const specQueries = validSpecs.map((s) => ({
                query: `INSERT INTO ProductSpec (productId, ${specColSql}, value) VALUES (?, ?, ?)`,
                params: [productId, s.key, s.value || ''],
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

        const specExplicit =
            req.body.specificationsExplicit === '1' || req.body.specificationsExplicit === 'true';
        const { fieldPresent: specFieldPresent, parseFailed: specParseFailed, rawLength: specRawLen } =
            data.specParseMeta || {};
        if (specExplicit && !specFieldPresent) {
            return res.status(400).json({
                message:
                    'Specifications were not received (blocked or stripped). Reload and try again, or contact support.',
            });
        }

        const shouldReplaceSpecs = specFieldPresent && !specParseFailed;
        const validSpecs = prepareSpecsForStorage(data.specifications);

        if (shouldLogProductSpecs()) {
            console.log('[updateProduct specs]', {
                productId: id,
                specFieldPresent,
                specExplicit,
                specParseFailed,
                specRawLen,
                normalizedIncomingCount: data.specifications?.length ?? 0,
                validSpecsCount: validSpecs.length,
                willReplaceSpecs: shouldReplaceSpecs,
            });
        }
        if (specParseFailed && shouldLogProductSpecs()) {
            console.warn('[updateProduct] Keeping existing ProductSpec rows — JSON parse failed.', {
                productId: id,
            });
        }

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

        await executeQuery('DELETE FROM ProductImage WHERE productId = ?', [id]);

        // Insert new images
        if (mergedImages.length > 0) {
            const imageQueries = mergedImages.map((im, i) => ({
                query: `INSERT INTO ProductImage (productId, url, publicId, sortOrder) VALUES (?, ?, ?, ?)`,
                params: [id, im.url, im.publicId || null, i]
            }));
            await executeTransaction(imageQueries);
        }

        if (shouldReplaceSpecs) {
            const specColSql = await sqlSpecKeyInsertColumnRef();
            const specQueries = [
                { query: 'DELETE FROM ProductSpec WHERE productId = ?', params: [id] },
                ...validSpecs.map((s) => ({
                    query: `INSERT INTO ProductSpec (productId, ${specColSql}, value) VALUES (?, ?, ?)`,
                    params: [id, s.key, s.value || ''],
                })),
            ];
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
    const specKeySel = await sqlSpecKeySelect('ps');
    const products = await executeQuery(
        `
        SELECT 
            p.*,
            pi.id as imageId,
            pi.url as imageUrl,
            pi.publicId as imagePublicId,
            pi.sortOrder as imageSortOrder,
            ps.id as specId,
            ${specKeySel},
            ps.value as specValue
        FROM Product p
        LEFT JOIN ProductImage pi ON p.id = pi.productId
        LEFT JOIN ProductSpec ps ON p.id = ps.productId
        WHERE p.id = ?
    `,
        [productId]
    );

    if (products.length === 0) return null;

    const product = {
        ...products[0],
        images: [],
        specifications: [],
    };

    const imageMap = new Map();
    products.forEach((row) => {
        if (row.imageId && !imageMap.has(row.imageId)) {
            imageMap.set(row.imageId, {
                id: row.imageId,
                url: row.imageUrl,
                publicId: row.imagePublicId,
                sortOrder: row.imageSortOrder,
            });
        }
        if (row.specId) {
            const exists = product.specifications.find((s) => s.id === row.specId);
            if (!exists) {
                product.specifications.push({
                    id: row.specId,
                    specKey: rowProductSpecLabel(row),
                    value: rowProductSpecValue(row),
                });
            }
        }
    });

    product.images = Array.from(imageMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);
    return product;
}
