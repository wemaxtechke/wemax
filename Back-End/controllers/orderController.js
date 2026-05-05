import { executeQuery, executeTransaction } from '../lib/mysql.js';
import { parseIntId } from '../lib/parseId.js';
import { formatOrder } from '../lib/apiFormatters.js';
import { saveRemoteOrDataUrl } from '../config/storage.js';
import {
    sendOrderConfirmationSMS,
    sendOrderProcessingSMS,
    sendDeliverySMS,
} from '../services/smsService.js';
import { generateQuotationPDF } from '../services/pdfService.js';
import { sendQuotationEmail } from '../services/emailService.js';

async function resolveShippingCost(shippingLocation, shippingCarrier) {
    const loc = String(shippingLocation || '').trim();
    const locPattern = `%${loc}%`;

    // Try to find matching shipping rate
    let match;
    if (shippingCarrier) {
        match = await executeQuery(
            `SELECT * FROM ShippingRate WHERE carrier = ? AND (locationName LIKE ? OR regionCode LIKE ?) LIMIT 1`,
            [shippingCarrier, locPattern, locPattern]
        );
    } else {
        match = await executeQuery(
            `SELECT * FROM ShippingRate WHERE locationName LIKE ? OR regionCode LIKE ? LIMIT 1`,
            [locPattern, locPattern]
        );
    }

    if (match && match.length > 0) return match[0].price;

    // Find default rate
    let defaultRate;
    if (shippingCarrier) {
        defaultRate = await executeQuery(
            `SELECT * FROM ShippingRate WHERE carrier = ? AND isDefault = true LIMIT 1`,
            [shippingCarrier]
        );
    } else {
        defaultRate = await executeQuery(
            `SELECT * FROM ShippingRate WHERE isDefault = true LIMIT 1`,
            []
        );
    }
    return (defaultRate && defaultRate.length > 0) ? defaultRate[0].price : 0;
}

export const createOrder = async (req, res) => {
    try {
        const {
            shippingAddress,
            shippingLocation,
            shippingCarrier,
            paymentMethod,
            items,
            packages,
            proofOfPayment,
        } = req.body;
        const userId = req.user.id;

        let orderItems = items;
        let orderPackages = packages;

        if ((!orderItems || orderItems.length === 0) && (!orderPackages || orderPackages.length === 0)) {
            const cpl = await executeQuery(
                `SELECT cpl.*, p.newPrice as productPrice FROM CartProductLine cpl
                 JOIN Product p ON cpl.productId = p.id WHERE cpl.userId = ?`,
                [userId]
            );
            const ckl = await executeQuery(
                `SELECT ckl.*, pkg.totalPrice as packagePrice FROM CartPackageLine ckl
                 JOIN Package pkg ON ckl.packageId = pkg.id WHERE ckl.userId = ?`,
                [userId]
            );
            orderItems = cpl.map((l) => ({
                productId: l.productId,
                quantity: l.quantity,
                price: l.price,
            }));
            orderPackages = ckl.map((l) => ({
                packageId: l.packageId,
                quantity: l.quantity,
                price: l.price,
            }));
        }

        if (orderItems.length === 0 && orderPackages.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        let subtotal = 0;
        const processedItems = [];
        const processedPackages = [];

        for (const item of orderItems) {
            const pid = parseIntId(item.product ?? item.productId);
            if (!pid) continue;
            const products = await executeQuery('SELECT * FROM Product WHERE id = ?', [pid]);
            if (products.length === 0) continue;
            const product = products[0];
            const price = product.newPrice;
            const quantity = item.quantity || 1;
            subtotal += price * quantity;
            processedItems.push({ productId: pid, quantity, price });
        }

        for (const pkg of orderPackages) {
            const pkgId = parseIntId(pkg.package ?? pkg.packageId);
            if (!pkgId) continue;
            const packages = await executeQuery('SELECT * FROM Package WHERE id = ?', [pkgId]);
            if (packages.length === 0) continue;
            const packageDoc = packages[0];
            const price = pkg.price != null ? pkg.price : packageDoc.totalPrice;
            const quantity = pkg.quantity || 1;
            subtotal += price * quantity;
            processedPackages.push({ packageId: pkgId, quantity, price });
        }

        if (processedItems.length === 0 && processedPackages.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        let shippingCost = await resolveShippingCost(shippingLocation, shippingCarrier);

        let hasFreeShipping = false;
        for (const item of processedItems) {
            const products = await executeQuery('SELECT freeShipping FROM Product WHERE id = ?', [item.productId]);
            if (products.length > 0 && products[0].freeShipping) {
                hasFreeShipping = true;
                break;
            }
        }
        if (!hasFreeShipping) {
            for (const pkg of processedPackages) {
                const packages = await executeQuery('SELECT freeShipping FROM Package WHERE id = ?', [pkg.packageId]);
                if (packages.length > 0 && packages[0].freeShipping) {
                    hasFreeShipping = true;
                    break;
                }
            }
        }

        if (hasFreeShipping) {
            shippingCost = 0;
        }

        let paymentProofUrl = null;
        let paymentProofPublicId = null;
        if (proofOfPayment) {
            const result = await saveRemoteOrDataUrl(proofOfPayment, 'wemax/payments');
            if (result) {
                paymentProofUrl = result.secure_url;
                paymentProofPublicId = result.public_id;
            }
        }

        // Create order and related data using transaction
        const queries = [];

        // Insert order
        queries.push({
            query: `INSERT INTO \`Order\` (
                customerId, shipName, shipPhone, shipCity, shipRegion, shipAddressLine,
                shippingLocation, shippingCarrier, shippingCost, subtotal, total,
                paymentMethod, paymentPaybill, paymentAccount, paymentProofUrl, paymentProofPublicId,
                paymentStatus, status, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'Pending', NOW(), NOW())`,
            params: [
                userId, shippingAddress.name, shippingAddress.phone, shippingAddress.city,
                shippingAddress.region, shippingAddress.addressLine, shippingLocation,
                shippingCarrier || null, shippingCost, subtotal, subtotal + shippingCost,
                paymentMethod || 'bank', process.env.BANK_PAYBILL_NUMBER || '123456',
                process.env.BANK_ACCOUNT_NUMBER || 'WEMAX001', paymentProofUrl, paymentProofPublicId
            ]
        });

        // Get the order ID first
        const orderResult = await executeQuery(
            `INSERT INTO \`Order\` (
                customerId, shipName, shipPhone, shipCity, shipRegion, shipAddressLine,
                shippingLocation, shippingCarrier, shippingCost, subtotal, total,
                paymentMethod, paymentPaybill, paymentAccount, paymentProofUrl, paymentProofPublicId,
                paymentStatus, status, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'Pending', NOW(), NOW())`,
            [
                userId, shippingAddress.name, shippingAddress.phone, shippingAddress.city,
                shippingAddress.region, shippingAddress.addressLine, shippingLocation,
                shippingCarrier || null, shippingCost, subtotal, subtotal + shippingCost,
                paymentMethod || 'bank', process.env.BANK_PAYBILL_NUMBER || '123456',
                process.env.BANK_ACCOUNT_NUMBER || 'WEMAX001', paymentProofUrl, paymentProofPublicId
            ]
        );
        const orderId = orderResult.insertId;

        // Insert order items
        for (const item of processedItems) {
            await executeQuery(
                'INSERT INTO OrderItem (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.productId, item.quantity, item.price]
            );
        }

        // Insert order packages
        for (const pkg of processedPackages) {
            await executeQuery(
                'INSERT INTO OrderPackageLine (orderId, packageId, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, pkg.packageId, pkg.quantity, pkg.price]
            );
        }

        // Clear cart
        await executeQuery('DELETE FROM CartProductLine WHERE userId = ?', [userId]);
        await executeQuery('DELETE FROM CartPackageLine WHERE userId = ?', [userId]);

        // Fetch populated order
        const populatedOrder = await getOrderWithRelations(orderId);

        const orderApi = formatOrder(populatedOrder);

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const quotationLink = `${clientUrl}/orders/${orderId}/quotation`;

        (async () => {
            try {
                const pdfBuffer = await generateQuotationPDF(orderApi);
                const customerEmail = populatedOrder.customer?.email;
                const customerName = populatedOrder.customer?.name || shippingAddress?.name || 'Customer';

                if (customerEmail) {
                    await sendQuotationEmail(customerEmail, customerName, pdfBuffer, orderId);
                    console.log('[Order] Quotation email sent to', customerEmail);
                } else {
                    console.warn('[Order] No customer email found for quotation');
                }
            } catch (err) {
                console.error('[Order] PDF/Email generation failed:', err?.message || err);
            }
        })();

        console.log('[Order] Sending SMS to:', orderApi.shippingAddress?.phone || orderApi.customer?.phone);
        sendOrderConfirmationSMS(orderApi, quotationLink).catch((err) => {
            console.error('[Order] SMS send failed:', err?.message || err);
        });

        res.status(201).json({
            order: orderApi,
            quotationLink,
            paymentInstructions: {
                paybillNumber: process.env.BANK_PAYBILL_NUMBER || '123456',
                accountNumber: process.env.BANK_ACCOUNT_NUMBER || 'WEMAX001',
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const conditions = [];
        const params = [];

        if (req.user.role === 'customer') {
            conditions.push('o.customerId = ?');
            params.push(req.user.id);
        }

        if (status) {
            conditions.push('o.status = ?');
            params.push(status);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const skip = (Number(page) - 1) * Number(limit);

        // Count total
        const countResult = await executeQuery(
            `SELECT COUNT(*) as total FROM \`Order\` o ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        // Get orders with basic info
        const orders = await executeQuery(
            `SELECT o.*, u.name as customerName, u.email as customerEmail
             FROM \`Order\` o
             LEFT JOIN User u ON o.customerId = u.id
             ${whereClause}
             ORDER BY o.createdAt DESC
             LIMIT ? OFFSET ?`,
            [...params, Number(limit), skip]
        );

        // Get order items and packages for each order
        const ordersWithDetails = await Promise.all(
            orders.map(async (order) => {
                const items = await executeQuery(
                    `SELECT oi.*, p.name as productName FROM OrderItem oi
                     JOIN Product p ON oi.productId = p.id
                     WHERE oi.orderId = ?`,
                    [order.id]
                );
                const packages = await executeQuery(
                    `SELECT opl.*, pkg.name as packageName FROM OrderPackageLine opl
                     JOIN Package pkg ON opl.packageId = pkg.id
                     WHERE opl.orderId = ?`,
                    [order.id]
                );
                return { ...order, items, packages };
            })
        );

        res.json({
            orders: ordersWithDetails.map(formatOrder),
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            total,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const id = parseIntId(req.params.id);
        if (!id) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = await getOrderWithRelations(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (req.user.role === 'customer' && order.customerId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(formatOrder(order));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const id = parseIntId(req.params.id);
        if (!id) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const { status } = req.body;
        const existing = await executeQuery('SELECT * FROM `Order` WHERE id = ?', [id]);

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const previousStatus = existing[0].status;

        await executeQuery(
            'UPDATE `Order` SET status = ?, updatedAt = NOW() WHERE id = ?',
            [status, id]
        );

        const populatedOrder = await getOrderWithRelations(id);
        const orderApi = formatOrder(populatedOrder);

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const trackingLink = `${clientUrl}/orders/${id}/track`;

        if (status === 'Processing' && previousStatus !== 'Processing') {
            sendOrderProcessingSMS(orderApi, trackingLink).catch((err) => {
                console.error('[Order] Processing SMS failed:', err?.message || err);
            });
        }

        if (status === 'Delivered' && previousStatus !== 'Delivered') {
            const courierLocation = existing[0].shippingLocation || existing[0].shipCity || 'the courier location';
            sendDeliverySMS(orderApi, courierLocation).catch((err) => {
                console.error('[Order] Delivery SMS failed:', err?.message || err);
            });
        }

        res.json(orderApi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const confirmPayment = async (req, res) => {
    try {
        const id = parseIntId(req.params.id);
        if (!id) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = await executeQuery('SELECT * FROM `Order` WHERE id = ?', [id]);
        if (order.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await executeQuery(
            'UPDATE `Order` SET paymentPaidAt = NOW(), paymentStatus = ?, updatedAt = NOW() WHERE id = ?',
            ['Paid', id]
        );

        const populatedOrder = await getOrderWithRelations(id);

        res.json(formatOrder(populatedOrder));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getQuotationPDF = async (req, res) => {
    try {
        const id = parseIntId(req.params.id);
        if (!id) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = await getOrderWithRelations(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (req.user.role === 'customer' && order.customerId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const orderApi = formatOrder(order);
        const pdfBuffer = await generateQuotationPDF(orderApi);
        const quotationNumber = `QT-${String(orderApi._id).slice(-8).toUpperCase()}`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="quotation-${quotationNumber}.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('[Order] PDF generation error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Helper function to get order with all relations
async function getOrderWithRelations(orderId) {
    const orders = await executeQuery(`
        SELECT o.*, u.name as customerName, u.email as customerEmail, u.phone as customerPhone
        FROM \`Order\` o
        LEFT JOIN User u ON o.customerId = u.id
        WHERE o.id = ?
    `, [orderId]);

    if (orders.length === 0) return null;

    const order = orders[0];

    // Get order items
    const items = await executeQuery(`
        SELECT oi.*, p.name as productName, p.newPrice as productPrice
        FROM OrderItem oi
        JOIN Product p ON oi.productId = p.id
        WHERE oi.orderId = ?
    `, [orderId]);

    // Get order packages
    const packages = await executeQuery(`
        SELECT opl.*, pkg.name as packageName, pkg.totalPrice as packagePrice
        FROM OrderPackageLine opl
        JOIN Package pkg ON opl.packageId = pkg.id
        WHERE opl.orderId = ?
    `, [orderId]);

    return {
        ...order,
        items,
        packages,
        customer: order.customerId ? {
            id: order.customerId,
            name: order.customerName,
            email: order.customerEmail,
            phone: order.customerPhone
        } : null
    };
}
