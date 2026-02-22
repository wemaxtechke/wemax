import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Package from '../models/Package.js';

export const getDashboardStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$total' } } },
        ]);
        const totalCustomers = await Order.distinct('customer').then(ids => ids.length);
        const pendingPayments = await Order.countDocuments({ status: 'PendingPayment' });

        const recentOrders = await Order.find()
            .populate('customer', 'name email')
            .sort('-createdAt')
            .limit(10);

        const topProducts = await Order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    totalSold: { $sum: '$items.quantity' },
                },
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
        ]);

        const productIds = topProducts.map(p => p._id);
        const products = await Product.find({ _id: { $in: productIds } });

        const topProductsWithDetails = topProducts.map(tp => {
            const product = products.find(p => p._id.toString() === tp._id.toString());
            return {
                product: product || null,
                totalSold: tp.totalSold,
            };
        });

        res.json({
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalCustomers,
            pendingPayments,
            recentOrders,
            topProducts: topProductsWithDetails,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
