import { executeQuery } from '../lib/mysql.js';
import { formatOrder, formatProduct } from '../lib/apiFormatters.js';

export const getDashboardStats = async (req, res) => {
    try {
        // Get total orders count
        const totalOrdersResult = await executeQuery('SELECT COUNT(*) as count FROM `Order`');
        const totalOrders = totalOrdersResult[0].count;

        // Get total revenue (excluding cancelled orders)
        const revenueResult = await executeQuery(
            'SELECT COALESCE(SUM(total), 0) as total FROM `Order` WHERE status != ?',
            ['Cancelled']
        );
        const totalRevenue = revenueResult[0].total;

        // Get total customers (distinct customer IDs)
        const customersResult = await executeQuery('SELECT COUNT(DISTINCT customerId) as count FROM `Order`');
        const totalCustomers = customersResult[0].count;

        // Get pending payments count
        const pendingResult = await executeQuery(
            'SELECT COUNT(*) as count FROM `Order` WHERE paymentStatus = ?',
            ['Pending']
        );
        const pendingPayments = pendingResult[0].count;

        // Get recent orders with details
        const recentOrdersData = await executeQuery(`
            SELECT o.*, 
                   u.name as customerName, u.email as customerEmail
            FROM \`Order\` o
            LEFT JOIN User u ON o.customerId = u.id
            ORDER BY o.createdAt DESC
            LIMIT 10
        `);
        const recentOrders = recentOrdersData.map(formatOrder);

        // Get top selling products
        const topProductsData = await executeQuery(`
            SELECT productId, SUM(quantity) as totalSold
            FROM OrderItem
            GROUP BY productId
            ORDER BY totalSold DESC
            LIMIT 5
        `);

        // Get product details for top products
        const productIds = topProductsData.map(p => p.productId);
        let products = [];
        if (productIds.length > 0) {
            const productsData = await executeQuery(`
                SELECT p.*, 
                       (SELECT GROUP_CONCAT(url ORDER BY sortOrder) as images
                        FROM ProductImage WHERE productId = p.id) as images,
                       (SELECT JSON_ARRAYAGG(JSON_OBJECT('key', specKey, 'value', value)) as specifications
                        FROM ProductSpec WHERE productId = p.id) as specifications
                FROM Product p
                WHERE p.id IN (${productIds.map(() => '?').join(',')})
            `, productIds);
            products = productsData;
        }

        const topProductsWithDetails = topProductsData.map((tp) => {
            const product = products.find((p) => p.id === tp.productId);
            return {
                product: product ? formatProduct(product) : null,
                totalSold: tp.totalSold || 0,
            };
        });

        res.json({
            totalOrders,
            totalRevenue,
            totalCustomers,
            pendingPayments,
            recentOrders,
            topProducts: topProductsWithDetails,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
