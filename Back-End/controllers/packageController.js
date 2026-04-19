import { prisma } from '../lib/prisma.js';
import { parseIntId } from '../lib/parseId.js';
import { formatPackage, packageDetailInclude, parseSort } from '../lib/apiFormatters.js';
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

        const where = { AND: [] };

        if (search) {
            const q = String(search);
            where.AND.push({
                OR: [{ name: { contains: q } }, { description: { contains: q } }],
            });
        }

        if (category) where.AND.push({ category });
        if (tag) where.AND.push({ tag });

        const whereFinal = where.AND.length ? where : {};
        const skip = (Number(page) - 1) * Number(limit);
        const orderBy = parseSort(sort);

        const [rows, total] = await Promise.all([
            prisma.package.findMany({
                where: whereFinal,
                orderBy,
                skip,
                take: Number(limit),
                include: packageDetailInclude,
            }),
            prisma.package.count({ where: whereFinal }),
        ]);

        res.json({
            packages: rows.map(formatPackage),
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
        const id = parseIntId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'Invalid package ID' });
        }

        const packageDoc = await prisma.package.findUnique({
            where: { id },
            include: packageDetailInclude,
        });
        if (!packageDoc) {
            return res.status(404).json({ message: 'Package not found' });
        }
        res.json(formatPackage(packageDoc));
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

        const packageDoc = await prisma.package.create({
            data: {
                name: data.name,
                description: data.description,
                totalPrice: data.totalPrice,
                oldTotalPrice: data.oldTotalPrice,
                freeShipping: data.freeShipping,
                category: data.category,
                tag: data.tag,
                items: {
                    create: data.items
                        .filter((it) => it && it.product)
                        .map((it) => ({
                            productId: Number(it.product),
                            quantity: Number(it.quantity) || 1,
                        })),
                },
                images: {
                    create: images.map((im, i) => ({
                        url: im.url,
                        publicId: im.publicId,
                        sortOrder: i,
                    })),
                },
            },
            include: packageDetailInclude,
        });

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

        const packageDoc = await prisma.package.findUnique({
            where: { id },
            include: { images: true },
        });
        if (!packageDoc) {
            return res.status(404).json({ message: 'Package not found' });
        }

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
        const mergedImages = [...(packageDoc.images || []).map((i) => ({ url: i.url, publicId: i.publicId })), ...newUploads];

        await prisma.$transaction([
            prisma.packageItem.deleteMany({ where: { packageId: id } }),
            prisma.packageImage.deleteMany({ where: { packageId: id } }),
        ]);

        const updated = await prisma.package.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                totalPrice: data.totalPrice,
                oldTotalPrice: data.oldTotalPrice,
                freeShipping: data.freeShipping,
                category: data.category,
                tag: data.tag,
                items: {
                    create: data.items
                        .filter((it) => it && it.product)
                        .map((it) => ({
                            productId: Number(it.product),
                            quantity: Number(it.quantity) || 1,
                        })),
                },
                images: {
                    create: mergedImages.map((im, i) => ({
                        url: im.url,
                        publicId: im.publicId || null,
                        sortOrder: i,
                    })),
                },
            },
            include: packageDetailInclude,
        });

        res.json(formatPackage(updated));
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

        const packageDoc = await prisma.package.findUnique({
            where: { id },
            include: { images: true },
        });
        if (!packageDoc) {
            return res.status(404).json({ message: 'Package not found' });
        }

        for (const image of packageDoc.images || []) {
            if (image.publicId) {
                try {
                    await deleteStoredFile(image.publicId);
                } catch (_) {}
            }
        }

        await prisma.package.delete({ where: { id } });
        res.json({ message: 'Package deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
