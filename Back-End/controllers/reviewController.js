import { executeQuery } from '../lib/mysql.js';
import { parseIntId } from '../lib/parseId.js';
import { formatReview } from '../lib/apiFormatters.js';
import { refreshProductReviewStats } from '../services/productReviewStats.js';

const reviewInclude = {
    user: { select: { id: true, name: true } },
};

export const getReviews = async (req, res) => {
    try {
        const productId = parseIntId(req.params.productId);
        if (!productId) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const reviews = await executeQuery(`
            SELECT r.*, 
                   u.id as userId, u.name as userName, u.email as userEmail
            FROM Review r
            LEFT JOIN User u ON r.userId = u.id
            WHERE r.productId = ?
            ORDER BY r.createdAt DESC
        `, [productId]);

        res.json(reviews.map((r) => formatReview(r)));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createReview = async (req, res) => {
    try {
        const productId = parseIntId(req.params.productId);
        if (!productId) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const { rating, title, comment } = req.body;

        // Check if product exists
        const products = await executeQuery('SELECT * FROM Product WHERE id = ?', [productId]);
        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user already reviewed this product
        const existingReviews = await executeQuery(
            'SELECT * FROM Review WHERE productId = ? AND userId = ?',
            [productId, req.user.id]
        );

        if (existingReviews.length > 0) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        // Create review
        const reviewResult = await executeQuery(
            'INSERT INTO Review (productId, userId, rating, title, comment, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
            [productId, req.user.id, rating, title, comment]
        );

        // Refresh product review stats
        await refreshProductReviewStats(productId);

        // Get the created review with user details
        const createdReviews = await executeQuery(`
            SELECT r.*, 
                   u.id as userId, u.name as userName, u.email as userEmail
            FROM Review r
            LEFT JOIN User u ON r.userId = u.id
            WHERE r.id = ?
        `, [reviewResult.insertId]);

        res.status(201).json(formatReview(createdReviews[0]));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateReview = async (req, res) => {
    try {
        const id = parseIntId(req.params.id);
        if (!id) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Get review with user details
        const reviews = await executeQuery(`
            SELECT r.*, 
                   u.id as userId, u.name as userName, u.email as userEmail
            FROM Review r
            LEFT JOIN User u ON r.userId = u.id
            WHERE r.id = ?
        `, [id]);

        if (reviews.length === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const review = reviews[0];

        if (review.userId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { rating, title, comment } = req.body;
        const data = {};
        if (rating !== undefined) data.rating = rating;
        if (title !== undefined) data.title = title;
        if (comment !== undefined) data.comment = comment;

        // Update review
        await executeQuery(
            'UPDATE Review SET rating = ?, title = ?, comment = ?, updatedAt = NOW() WHERE id = ?',
            [rating, title, comment, id]
        );

        // Refresh product review stats
        await refreshProductReviewStats(review.productId);

        // Get updated review with user details
        const updatedReviews = await executeQuery(`
            SELECT r.*, 
                   u.id as userId, u.name as userName, u.email as userEmail
            FROM Review r
            LEFT JOIN User u ON r.userId = u.id
            WHERE r.id = ?
        `, [id]);

        res.json(formatReview(updatedReviews[0]));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const id = parseIntId(req.params.id);
        if (!id) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Get review with product ID for stats refresh
        const reviews = await executeQuery(`
            SELECT r.*, 
                   u.id as userId, u.name as userName, u.email as userEmail
            FROM Review r
            LEFT JOIN User u ON r.userId = u.id
            WHERE r.id = ?
        `, [id]);

        if (reviews.length === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const review = reviews[0];

        if (review.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const productId = review.productId;
        
        // Delete review
        await executeQuery('DELETE FROM Review WHERE id = ?', [id]);
        
        // Refresh product review stats
        await refreshProductReviewStats(productId);

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
