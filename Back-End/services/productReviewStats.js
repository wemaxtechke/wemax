import { prisma } from '../lib/prisma.js';

export async function refreshProductReviewStats(productId) {
    const agg = await prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { _all: true },
    });
    const avg = agg._avg.rating ?? 0;
    await prisma.product.update({
        where: { id: productId },
        data: {
            averageRating: Math.round(avg * 10) / 10,
            reviewsCount: agg._count._all,
        },
    });
}
