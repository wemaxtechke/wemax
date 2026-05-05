import { executeQuery } from '../lib/mysql.js';

export async function refreshProductReviewStats(productId) {
    const agg = await executeQuery(
        'SELECT AVG(rating) as avgRating, COUNT(*) as reviewCount FROM Review WHERE productId = ?',
        [productId]
    );
    const avg = agg[0].avgRating ?? 0;
    const reviewCount = agg[0].reviewCount;
    
    await executeQuery(
        'UPDATE Product SET averageRating = ?, reviewsCount = ? WHERE id = ?',
        [Math.round(avg * 10) / 10, reviewCount, productId]
    );
}
