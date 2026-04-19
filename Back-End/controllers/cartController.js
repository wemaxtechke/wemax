import { prisma } from '../lib/prisma.js';
import { parseIntId } from '../lib/parseId.js';
import { formatCart } from '../lib/apiFormatters.js';

export const getCart = async (req, res) => {
    try {
        const cart = await formatCart(prisma, req.user.id);
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addToCart = async (req, res) => {
    try {
        const { productId, packageId, quantity = 1 } = req.body;
        const userId = req.user.id;

        if (productId) {
            const pid = parseIntId(productId);
            if (!pid) {
                return res.status(400).json({ message: 'Invalid product ID' });
            }
            const product = await prisma.product.findUnique({ where: { id: pid } });
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            const existing = await prisma.cartProductLine.findFirst({
                where: { userId, productId: pid },
            });

            if (existing) {
                await prisma.cartProductLine.update({
                    where: { id: existing.id },
                    data: { quantity: existing.quantity + Number(quantity) },
                });
            } else {
                await prisma.cartProductLine.create({
                    data: {
                        userId,
                        productId: pid,
                        quantity: Number(quantity),
                        price: product.newPrice,
                    },
                });
            }
        }

        if (packageId) {
            const pkgId = parseIntId(packageId);
            if (!pkgId) {
                return res.status(400).json({ message: 'Invalid package ID' });
            }
            const packageDoc = await prisma.package.findUnique({ where: { id: pkgId } });
            if (!packageDoc) {
                return res.status(404).json({ message: 'Package not found' });
            }

            const existing = await prisma.cartPackageLine.findFirst({
                where: { userId, packageId: pkgId },
            });

            if (existing) {
                await prisma.cartPackageLine.update({
                    where: { id: existing.id },
                    data: { quantity: existing.quantity + Number(quantity) },
                });
            } else {
                await prisma.cartPackageLine.create({
                    data: {
                        userId,
                        packageId: pkgId,
                        quantity: Number(quantity),
                        price: packageDoc.totalPrice,
                    },
                });
            }
        }

        const cart = await formatCart(prisma, userId);
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        const lineId = parseIntId(req.params.itemId);
        if (!lineId) {
            return res.status(404).json({ message: 'Item not found' });
        }
        const { quantity, type } = req.body;
        const userId = req.user.id;

        if (type === 'product') {
            const item = await prisma.cartProductLine.findFirst({
                where: { id: lineId, userId },
            });
            if (!item) {
                return res.status(404).json({ message: 'Item not found' });
            }
            await prisma.cartProductLine.update({
                where: { id: lineId },
                data: { quantity: Number(quantity) },
            });
        } else if (type === 'package') {
            const pkg = await prisma.cartPackageLine.findFirst({
                where: { id: lineId, userId },
            });
            if (!pkg) {
                return res.status(404).json({ message: 'Package not found' });
            }
            await prisma.cartPackageLine.update({
                where: { id: lineId },
                data: { quantity: Number(quantity) },
            });
        }

        const cart = await formatCart(prisma, userId);
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const lineId = parseIntId(req.params.itemId);
        if (!lineId) {
            return res.status(404).json({ message: 'Item not found' });
        }
        const { type } = req.body;
        const userId = req.user.id;

        if (type === 'product') {
            await prisma.cartProductLine.deleteMany({ where: { id: lineId, userId } });
        } else if (type === 'package') {
            await prisma.cartPackageLine.deleteMany({ where: { id: lineId, userId } });
        }

        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        await prisma.$transaction([
            prisma.cartProductLine.deleteMany({ where: { userId } }),
            prisma.cartPackageLine.deleteMany({ where: { userId } }),
        ]);
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
