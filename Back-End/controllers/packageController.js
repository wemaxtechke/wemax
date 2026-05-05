import { executeQuery, executeTransaction } from '../lib/mysql.js';
import { parseIntId } from '../lib/parseId.js';
import { formatPackage, parseSortForSQL } from '../lib/apiFormatters.js';
import { saveUploadBuffer, deleteStoredFile } from '../config/storage.js';

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

        // Build WHERE clause
        const whereConditions = [];
        const params = [];

        if (search) {
            const q = String(search);
            whereConditions.push(`(name LIKE ? OR description LIKE ?)`);
            params.push(`%${q}%`, `%${q}%`);
        }
        if (category) {
            whereConditions.push('category = ?');
            params.push(category);
        }
        if (tag) {
            whereConditions.push('tag = ?');
            params.push(tag);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.max(1, Math.min(50, Number(limit) || 20));
        const skip = (pageNum - 1) * limitNum;
        const orderBy = parseSortForSQL(sort) || 'createdAt DESC';
        const orderClause = `ORDER BY ${orderBy}`;

        // Execute queries sequentially
        const packages = await executeQuery(
            `SELECT * FROM Package ${whereClause} ${orderClause} LIMIT ? OFFSET ?`,
            [...params, limitNum, skip]
        );
        
        const totalResult = await executeQuery(`SELECT COUNT(*) as total FROM Package ${whereClause}`, params);
        const total = totalResult[0].total;

        res.json({
            packages: packages.map(formatPackage),
            totalPages: Math.ceil(total / limitNum),
            currentPage: Number(page),
            total,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPackageById = async (req, res) => {
    try {
        const id = parseIntId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'Invalid package ID' });
        }

        const packages = await executeQuery('SELECT * FROM Package WHERE id = ?', [id]);
        if (packages.length === 0) {
            return res.status(404).json({ message: 'Package not found' });
        }

        const packageDoc = packages[0];

        // Get images and specifications sequentially
        const images = await executeQuery(
            'SELECT url, publicId FROM PackageImage WHERE packageId = ? ORDER BY sortOrder ASC',
            [id]
        );

        const specifications = await executeQuery(
            'SELECT specKey as key, value FROM PackageSpec WHERE packageId = ?',
            [id]
        );

        // Format the package with images and specifications
        const formattedPackage = formatPackage({
            ...packageDoc,
            images: images.map(img => ({
                url: img.url,
                publicId: img.publicId,
            })),
            specifications: specifications.map(spec => ({
                _id: String(spec.id),
                key: spec.key,
                value: spec.value,
            })),
        });

        res.json(formattedPackage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createPackage = async (req, res) => {
    try {
        const images = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const result = await saveUploadBuffer(file.buffer, 'wemax/packages', file.originalname);
                    images.push({ url: result.secure_url, publicId: result.public_id });
                } catch (err) {
                    return res.status(400).json({ message: `Image upload failed: ${err.message}` });
                }
            }
        }

        const data = parsePackageBody(req.body);

        // Use transaction for package creation
        const queries = [];
        
        // Insert package
        queries.push({
            query: `INSERT INTO Package (name, description, totalPrice, oldTotalPrice, freeShipping, category, tag, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            params: [
                data.name,
                data.description,
                data.totalPrice,
                data.oldTotalPrice,
                data.freeShipping,
                data.category,
                data.tag
            ]
        });

        // Insert package items
        const validItems = data.items
            .filter((it) => it && it.product)
            .map((it) => ({
                productId: Number(it.product),
                quantity: Number(it.quantity) || 1,
            }));

        for (const item of validItems) {
            queries.push({
                query: 'INSERT INTO PackageItem (packageId, productId, quantity) VALUES (LAST_INSERT_ID(), ?, ?)',
                params: [item.productId, item.quantity]
            });
        }

        // Insert package images
        for (const [im, i] of images.entries()) {
            queries.push({
                query: 'INSERT INTO PackageImage (packageId, url, publicId, sortOrder) VALUES (LAST_INSERT_ID(), ?, ?, ?)',
                params: [im.url, im.publicId, i]
            });
        }

        await executeTransaction(queries);

        // Get the created package with all details
        const packages = await executeQuery('SELECT * FROM Package WHERE id = LAST_INSERT_ID()');
        const packageDoc = packages[0];

        res.status(201).json(formatPackage(packageDoc));
    } catch (error) {
        console.error('Create package error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const updatePackage = async (req, res) => {
    try {
        const id = parseIntId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'Invalid package ID' });
        }

        // Check if package exists
        const packages = await executeQuery('SELECT * FROM Package WHERE id = ?', [id]);
        if (packages.length === 0) {
            return res.status(404).json({ message: 'Package not found' });
        }

        const packageDoc = packages[0];

        // Handle new image uploads
        const newUploads = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const result = await saveUploadBuffer(file.buffer, 'wemax/packages', file.originalname);
                    newUploads.push({ url: result.secure_url, publicId: result.public_id });
                } catch (err) {
                    return res.status(400).json({ message: `Image upload failed: ${err.message}` });
                }
            }
        }

        const data = parsePackageBody(req.body);

        // Use transaction for update
        const queries = [];
        
        // Delete existing items and images
        queries.push({
            query: 'DELETE FROM PackageItem WHERE packageId = ?',
            params: [id]
        });
        queries.push({
            query: 'DELETE FROM PackageImage WHERE packageId = ?',
            params: [id]
        });

        // Update package
        queries.push({
            query: `UPDATE Package SET name = ?, description = ?, totalPrice = ?, oldTotalPrice = ?, freeShipping = ?, category = ?, tag = ?, updatedAt = NOW() WHERE id = ?`,
            params: [
                data.name,
                data.description,
                data.totalPrice,
                data.oldTotalPrice,
                data.freeShipping,
                data.category,
                data.tag,
                id
            ]
        });

        // Insert new package items
        const validItems = data.items
            .filter((it) => it && it.product)
            .map((it) => ({
                productId: Number(it.product),
                quantity: Number(it.quantity) || 1,
            }));

        for (const item of validItems) {
            queries.push({
                query: 'INSERT INTO PackageItem (packageId, productId, quantity) VALUES (?, ?, ?)',
                params: [id, item.productId, item.quantity]
            });
        }

        // Insert new images
        const mergedImages = [...(packageDoc.images || []).map((i) => ({ url: i.url, publicId: i.publicId })), ...newUploads];
        for (const [im, i] of mergedImages.entries()) {
            queries.push({
                query: 'INSERT INTO PackageImage (packageId, url, publicId, sortOrder) VALUES (?, ?, ?, ?)',
                params: [id, im.url, im.publicId, i]
            });
        }

        await executeTransaction(queries);

        // Get updated package
        const updatedPackages = await executeQuery('SELECT * FROM Package WHERE id = ?', [id]);
        const updatedPackage = updatedPackages[0];

        res.json(formatPackage(updatedPackage));
    } catch (error) {
        console.error('Update package error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const deletePackage = async (req, res) => {
    try {
        const id = parseIntId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'Invalid package ID' });
        }

        // Get package with images for cleanup
        const packages = await executeQuery(`
            SELECT p.*, pi.url, pi.publicId 
            FROM Package p 
            LEFT JOIN PackageImage pi ON p.id = pi.packageId 
            WHERE p.id = ?
        `, [id]);

        if (packages.length === 0) {
            return res.status(404).json({ message: 'Package not found' });
        }

        const packageDoc = packages[0];

        // Delete associated images from storage
        for (const image of packageDoc.images || []) {
            if (image.publicId) {
                try {
                    await deleteStoredFile(image.publicId);
                } catch (_) {}
            }
        }

        // Delete package (cascade will handle items and images)
        await executeQuery('DELETE FROM Package WHERE id = ?', [id]);

        res.json({ message: 'Package deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
