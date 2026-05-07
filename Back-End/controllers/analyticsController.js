import { executeQuery } from '../lib/mysql.js';
import { formatProduct, formatOrderMysqlJoinRow } from '../lib/apiFormatters.js';

/** mysql2 may return BIGINT / DECIMAL as bigint or string — JSON.stringify throws on bigint. */
function num(v) {
    if (v == null) return 0;
    if (typeof v === 'bigint') return Number(v);
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

/** Recursively strip bigint from plain objects/arrays so Express res.json() never throws */
function jsonSafeDeep(value) {
    if (typeof value === 'bigint') return Number(value);
    if (value === null || value === undefined) return value;
    if (typeof value !== 'object') return value;
    if (value instanceof Date) return value;
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) {
        return value.toString('utf8');
    }
    if (Array.isArray(value)) {
        return value.map((x) => jsonSafeDeep(x));
    }
    if (value.constructor !== Object) {
        /** Keep class instances (e.g. Date already returned) as-is if not plain object */
        return value;
    }
    const out = {};
    for (const key of Object.keys(value)) {
        out[key] = jsonSafeDeep(value[key]);
    }
    return out;
}

export const getDashboardStats = async (req, res) => {
    let totalOrders = 0;
    let totalRevenue = 0;
    let totalCustomers = 0;
    let pendingPayments = 0;

    try {
        const totalOrdersResult = await executeQuery('SELECT COUNT(*) as count FROM `Order`');
        totalOrders = num(totalOrdersResult[0]?.count);

        const revenueResult = await executeQuery(
            'SELECT COALESCE(SUM(total), 0) as total FROM `Order` WHERE status != ?',
            ['Cancelled']
        );
        totalRevenue = num(revenueResult[0]?.total);

        const customersResult = await executeQuery('SELECT COUNT(DISTINCT customerId) as count FROM `Order`');
        totalCustomers = num(customersResult[0]?.count);

        const pendingResult = await executeQuery(
            'SELECT COUNT(*) as count FROM `Order` WHERE paymentStatus = ?',
            ['Pending']
        );
        pendingPayments = num(pendingResult[0]?.count);
    } catch (e) {
        console.error('[analytics/dashboard] KPI queries', e);
        return res.status(500).json({ message: e.message || 'Analytics error' });
    }

    /** Admin dashboard tiles only need KPIs — never fail if extras break */
    let recentOrders = [];
    try {
        const recentOrdersData = await executeQuery(`
            SELECT o.*,
                   u.name as customerName,
                   u.email as customerEmail
            FROM \`Order\` o
            LEFT JOIN User u ON o.customerId = u.id
            ORDER BY o.createdAt DESC
            LIMIT 10
        `);
        recentOrders = recentOrdersData.map((row) => {
            try {
                return formatOrderMysqlJoinRow(row);
            } catch (e) {
                console.error('[analytics/dashboard] formatOrderMysqlJoinRow', row?.id, e.message);
                return {
                    _id: String(row.id),
                    customer: null,
                    items: [],
                    packages: [],
                    total: num(row.total),
                    status: row.status,
                    createdAt: row.createdAt,
                };
            }
        });
    } catch (e) {
        console.error('[analytics/dashboard] recentOrders', e);
    }

    let topProductsWithDetails = [];
    try {
        const topProductsData = await executeQuery(`
            SELECT productId, SUM(quantity) as totalSold
            FROM OrderItem
            GROUP BY productId
            ORDER BY totalSold DESC
            LIMIT 5
        `);

        const productIds = topProductsData.map((p) => p.productId).filter((id) => id != null);
        let products = [];
        if (productIds.length > 0) {
            const placeholders = productIds.map(() => '?').join(',');
            products = await executeQuery(
                `SELECT * FROM Product WHERE id IN (${placeholders})`,
                productIds
            );
        }

        topProductsWithDetails = topProductsData.map((tp) => {
            const product = products.find((p) => Number(p.id) === Number(tp.productId));
            let formatted = null;
            if (product) {
                try {
                    formatted = formatProduct(product);
                } catch (e) {
                    console.error('[analytics/dashboard] formatProduct', product?.id, e.message);
                    formatted = {
                        _id: String(product.id),
                        name: product.name,
                        newPrice: num(product.newPrice),
                        category: product.category,
                        subCategory: product.subCategory,
                    };
                }
            }
            return {
                product: formatted,
                totalSold: num(tp.totalSold),
            };
        });
    } catch (e) {
        console.error('[analytics/dashboard] topProducts', e);
    }

    try {
        res.json(
            jsonSafeDeep({
                totalOrders,
                totalRevenue,
                totalCustomers,
                pendingPayments,
                recentOrders,
                topProducts: topProductsWithDetails,
            })
        );
    } catch (e) {
        console.error('[analytics/dashboard] JSON response', e);
        /** Last resort: KPI-only payload */
        res.json({
            totalOrders,
            totalRevenue,
            totalCustomers,
            pendingPayments,
            recentOrders: [],
            topProducts: [],
        });
    }
};
