import { prisma } from '../lib/prisma.js';
import { parseIntId } from '../lib/parseId.js';
import { formatProduct, productDetailInclude } from '../lib/apiFormatters.js';

export const getWishlist = async (req, res) => {
    try {
        const rows = await prisma.wishlistItem.findMany({
            where: { userId: req.user.id },
            include: { product: { include: productDetailInclude } },
        });
        res.json(rows.map((r) => formatProduct(r.product)));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addToWishlist = async (req, res) => {
    try {
        const productId = parseIntId(req.body.productId);
        if (!productId) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        try {
            await prisma.wishlistItem.create({
                data: { userId: req.user.id, productId },
            });
        } catch (e) {
            if (e.code === 'P2002') {
                return res.status(400).json({ message: 'Product already in wishlist' });
            }
            throw e;
        }

        const rows = await prisma.wishlistItem.findMany({
            where: { userId: req.user.id },
            include: { product: { include: productDetailInclude } },
        });
        res.json(rows.map((r) => formatProduct(r.product)));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const productId = parseIntId(req.params.productId);
        if (!productId) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        await prisma.wishlistItem.deleteMany({
            where: { userId: req.user.id, productId },
        });

        const rows = await prisma.wishlistItem.findMany({
            where: { userId: req.user.id },
            include: { product: { include: productDetailInclude } },
        });
        res.json(rows.map((r) => formatProduct(r.product)));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
