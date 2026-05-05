import { executeQuery } from '../lib/mysql.js';
import { parseIntId } from '../lib/parseId.js';
import { formatProduct } from '../lib/apiFormatters.js';

async function getWishlistProducts(userId) {
    const rows = await executeQuery(`
        SELECT p.*, pi.url as imageUrl, ps.specKey, ps.value as specValue
        FROM WishlistItem wi
        JOIN Product p ON wi.productId = p.id
        LEFT JOIN ProductImage pi ON p.id = pi.productId AND pi.sortOrder = 0
        LEFT JOIN ProductSpec ps ON p.id = ps.productId
        WHERE wi.userId = ?
    `, [userId]);

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
            product.specifications.push({ specKey: row.specKey, value: row.specValue });
        }
    });

    return Array.from(productsMap.values());
}

export const getWishlist = async (req, res) => {
    try {
        const products = await getWishlistProducts(req.user.id);
        res.json(products.map(formatProduct));
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

        const productCheck = await executeQuery('SELECT * FROM Product WHERE id = ?', [productId]);
        if (productCheck.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        try {
            await executeQuery(
                'INSERT INTO WishlistItem (userId, productId) VALUES (?, ?)',
                [req.user.id, productId]
            );
        } catch (e) {
            if (e.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Product already in wishlist' });
            }
            throw e;
        }

        const products = await getWishlistProducts(req.user.id);
        res.json(products.map(formatProduct));
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

        await executeQuery(
            'DELETE FROM WishlistItem WHERE userId = ? AND productId = ?',
            [req.user.id, productId]
        );

        const products = await getWishlistProducts(req.user.id);
        res.json(products.map(formatProduct));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
