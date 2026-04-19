import { prisma } from '../lib/prisma.js';
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

        const reviews = await prisma.review.findMany({
            where: { productId },
            include: reviewInclude,
            orderBy: { createdAt: 'desc' },
        });

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

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const existingReview = await prisma.review.findUnique({
            where: { productId_userId: { productId, userId: req.user.id } },
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        const review = await prisma.review.create({
            data: {
                productId,
                userId: req.user.id,
                rating,
                title,
                comment,
            },
            include: reviewInclude,
        });

        await refreshProductReviewStats(productId);

        res.status(201).json(formatReview(review));
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

        const review = await prisma.review.findUnique({ where: { id } });
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.userId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { rating, title, comment } = req.body;
        const data = {};
        if (rating !== undefined) data.rating = rating;
        if (title !== undefined) data.title = title;
        if (comment !== undefined) data.comment = comment;

        const updatedReview = await prisma.review.update({
            where: { id },
            data,
            include: reviewInclude,
        });

        await refreshProductReviewStats(review.productId);

        res.json(formatReview(updatedReview));
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

        const review = await prisma.review.findUnique({ where: { id } });
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const productId = review.productId;
        await prisma.review.delete({ where: { id } });
        await refreshProductReviewStats(productId);

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
