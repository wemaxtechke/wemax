import { executeQuery, executeTransaction } from '../lib/mysql.js';
import { parseIntId } from '../lib/parseId.js';
import { formatCart } from '../lib/apiFormatters.js';

export const getCart = async (req, res) => {
    try {
        const cart = await formatCart(req.user.id);
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
            const products = await executeQuery('SELECT * FROM Product WHERE id = ?', [pid]);
            if (products.length === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }
            const product = products[0];

            const existing = await executeQuery(
                'SELECT * FROM CartProductLine WHERE userId = ? AND productId = ?',
                [userId, pid]
            );

            if (existing.length > 0) {
                await executeQuery(
                    'UPDATE CartProductLine SET quantity = ? WHERE id = ?',
                    [existing[0].quantity + Number(quantity), existing[0].id]
                );
            } else {
                await executeQuery(
                    'INSERT INTO CartProductLine (userId, productId, quantity, price) VALUES (?, ?, ?, ?)',
                    [userId, pid, Number(quantity), product.newPrice]
                );
            }
        }

        if (packageId) {
            const pkgId = parseIntId(packageId);
            if (!pkgId) {
                return res.status(400).json({ message: 'Invalid package ID' });
            }
            const packages = await executeQuery('SELECT * FROM Package WHERE id = ?', [pkgId]);
            if (packages.length === 0) {
                return res.status(404).json({ message: 'Package not found' });
            }
            const packageDoc = packages[0];

            const existing = await executeQuery(
                'SELECT * FROM CartPackageLine WHERE userId = ? AND packageId = ?',
                [userId, pkgId]
            );

            if (existing.length > 0) {
                await executeQuery(
                    'UPDATE CartPackageLine SET quantity = ? WHERE id = ?',
                    [existing[0].quantity + Number(quantity), existing[0].id]
                );
            } else {
                await executeQuery(
                    'INSERT INTO CartPackageLine (userId, packageId, quantity, price) VALUES (?, ?, ?, ?)',
                    [userId, pkgId, Number(quantity), packageDoc.totalPrice]
                );
            }
        }

        const cart = await formatCart(userId);
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
            const items = await executeQuery(
                'SELECT * FROM CartProductLine WHERE id = ? AND userId = ?',
                [lineId, userId]
            );
            if (items.length === 0) {
                return res.status(404).json({ message: 'Item not found' });
            }
            await executeQuery(
                'UPDATE CartProductLine SET quantity = ? WHERE id = ?',
                [Number(quantity), lineId]
            );
        } else if (type === 'package') {
            const pkgs = await executeQuery(
                'SELECT * FROM CartPackageLine WHERE id = ? AND userId = ?',
                [lineId, userId]
            );
            if (pkgs.length === 0) {
                return res.status(404).json({ message: 'Package not found' });
            }
            await executeQuery(
                'UPDATE CartPackageLine SET quantity = ? WHERE id = ?',
                [Number(quantity), lineId]
            );
        }

        const cart = await formatCart(userId);
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
            await executeQuery('DELETE FROM CartProductLine WHERE id = ? AND userId = ?', [lineId, userId]);
        } else if (type === 'package') {
            await executeQuery('DELETE FROM CartPackageLine WHERE id = ? AND userId = ?', [lineId, userId]);
        }

        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        await executeTransaction([
            { query: 'DELETE FROM CartProductLine WHERE userId = ?', params: [userId] },
            { query: 'DELETE FROM CartPackageLine WHERE userId = ?', params: [userId] }
        ]);
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
