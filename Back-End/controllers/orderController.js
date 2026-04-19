import { prisma } from '../lib/prisma.js';
import { parseIntId } from '../lib/parseId.js';
import { formatOrder, prismaOrderInclude } from '../lib/apiFormatters.js';
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
    const carrierFilter = shippingCarrier ? { carrier: shippingCarrier } : {};

    const match = await prisma.shippingRate.findFirst({
        where: {
            ...carrierFilter,
            OR: [{ locationName: { contains: loc } }, { regionCode: { contains: loc } }],
        },
    });
    if (match) return match.price;

    const defaultRate = await prisma.shippingRate.findFirst({
        where: shippingCarrier ? { carrier: shippingCarrier, isDefault: true } : { isDefault: true },
    });
    return defaultRate ? defaultRate.price : 0;
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
            const [cpl, ckl] = await Promise.all([
                prisma.cartProductLine.findMany({ where: { userId }, include: { product: true } }),
                prisma.cartPackageLine.findMany({ where: { userId }, include: { package: true } }),
            ]);
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
            const product = await prisma.product.findUnique({ where: { id: pid } });
            if (!product) continue;
            const price = product.newPrice;
            const quantity = item.quantity || 1;
            subtotal += price * quantity;
            processedItems.push({ productId: pid, quantity, price });
        }

        for (const pkg of orderPackages) {
            const pkgId = parseIntId(pkg.package ?? pkg.packageId);
            if (!pkgId) continue;
            const packageDoc = await prisma.package.findUnique({ where: { id: pkgId } });
            if (!packageDoc) continue;
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
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (product?.freeShipping) {
                hasFreeShipping = true;
                break;
            }
        }
        if (!hasFreeShipping) {
            for (const pkg of processedPackages) {
                const packageDoc = await prisma.package.findUnique({ where: { id: pkg.packageId } });
                if (packageDoc?.freeShipping) {
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

        const order = await prisma.$transaction(async (tx) => {
            const o = await tx.order.create({
                data: {
                    customerId: userId,
                    shipName: shippingAddress.name,
                    shipPhone: shippingAddress.phone,
                    shipCity: shippingAddress.city,
                    shipRegion: shippingAddress.region,
                    shipAddressLine: shippingAddress.addressLine,
                    shippingLocation,
                    shippingCarrier: shippingCarrier || null,
                    shippingCost,
                    subtotal,
                    total: subtotal + shippingCost,
                    paymentMethod: paymentMethod || 'bank',
                    paymentPaybill: process.env.BANK_PAYBILL_NUMBER || '123456',
                    paymentAccount: process.env.BANK_ACCOUNT_NUMBER || 'WEMAX001',
                    paymentProofUrl,
                    paymentProofPublicId,
                    paymentStatus: 'Pending',
                    status: 'Pending',
                    items: {
                        create: processedItems.map((i) => ({
                            productId: i.productId,
                            quantity: i.quantity,
                            price: i.price,
                        })),
                    },
                    packages: {
                        create: processedPackages.map((p) => ({
                            packageId: p.packageId,
                            quantity: p.quantity,
                            price: p.price,
                        })),
                    },
                },
            });

            await tx.cartProductLine.deleteMany({ where: { userId } });
            await tx.cartPackageLine.deleteMany({ where: { userId } });

            return o;
        });

        const populatedOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: prismaOrderInclude,
        });

        const orderApi = formatOrder(populatedOrder);

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const quotationLink = `${clientUrl}/orders/${order.id}/quotation`;

        (async () => {
            try {
                const pdfBuffer = await generateQuotationPDF(orderApi);
                const customerEmail = populatedOrder.customer?.email;
                const customerName = populatedOrder.customer?.name || shippingAddress?.name || 'Customer';

                if (customerEmail) {
                    await sendQuotationEmail(customerEmail, customerName, pdfBuffer, order.id);
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
        const where = {};

        if (req.user.role === 'customer') {
            where.customerId = req.user.id;
        }

        if (status) {
            where.status = status;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: prismaOrderInclude,
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            prisma.order.count({ where }),
        ]);

        res.json({
            orders: orders.map(formatOrder),
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

        const order = await prisma.order.findUnique({
            where: { id },
            include: prismaOrderInclude,
        });

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
        const existing = await prisma.order.findUnique({ where: { id } });

        if (!existing) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const previousStatus = existing.status;

        await prisma.order.update({
            where: { id },
            data: { status },
        });

        const populatedOrder = await prisma.order.findUnique({
            where: { id },
            include: prismaOrderInclude,
        });
        const orderApi = formatOrder(populatedOrder);

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const trackingLink = `${clientUrl}/orders/${id}/track`;

        if (status === 'Processing' && previousStatus !== 'Processing') {
            sendOrderProcessingSMS(orderApi, trackingLink).catch((err) => {
                console.error('[Order] Processing SMS failed:', err?.message || err);
            });
        }

        if (status === 'Delivered' && previousStatus !== 'Delivered') {
            const courierLocation = existing.shippingLocation || existing.shipCity || 'the courier location';
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

        const order = await prisma.order.findUnique({ where: { id } });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await prisma.order.update({
            where: { id },
            data: {
                paymentPaidAt: new Date(),
                paymentStatus: 'Paid',
            },
        });

        const populatedOrder = await prisma.order.findUnique({
            where: { id },
            include: prismaOrderInclude,
        });

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

        const order = await prisma.order.findUnique({
            where: { id },
            include: prismaOrderInclude,
        });

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
