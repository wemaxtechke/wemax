import { prisma } from '../lib/prisma.js';
import { formatOrder, formatProduct, prismaOrderInclude, productDetailInclude } from '../lib/apiFormatters.js';

export const getDashboardStats = async (req, res) => {
    try {
        const totalOrders = await prisma.order.count();

        const revenueAgg = await prisma.order.aggregate({
            where: { status: { not: 'Cancelled' } },
            _sum: { total: true },
        });

        const distinctCustomers = await prisma.order.groupBy({
            by: ['customerId'],
            _count: { _all: true },
        });
        const totalCustomers = distinctCustomers.length;

        const pendingPayments = await prisma.order.count({
            where: { paymentStatus: 'Pending' },
        });

        const recentOrderRows = await prisma.order.findMany({
            include: prismaOrderInclude,
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        const recentOrders = recentOrderRows.map(formatOrder);

        const topProductGroups = await prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5,
        });

        const productIds = topProductGroups.map((p) => p.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            include: productDetailInclude,
        });

        const topProductsWithDetails = topProductGroups.map((tp) => {
            const product = products.find((p) => p.id === tp.productId);
            return {
                product: product ? formatProduct(product) : null,
                totalSold: tp._sum.quantity || 0,
            };
        });

        res.json({
            totalOrders,
            totalRevenue: revenueAgg._sum.total || 0,
            totalCustomers,
            pendingPayments,
            recentOrders,
            topProducts: topProductsWithDetails,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
