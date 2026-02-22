import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Package from '../models/Package.js';
import ShippingRate from '../models/ShippingRate.js';
import cloudinary from '../config/cloudinary.js';
import {
    sendOrderConfirmationSMS,
    sendOrderProcessingSMS,
    sendDeliverySMS,
} from '../services/smsService.js';
import { generateQuotationPDF } from '../services/pdfService.js';
import { sendQuotationEmail } from '../services/emailService.js';

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
        const user = await User.findById(req.user._id).populate('cart.items.product').populate('cart.packages.package');

        const orderItems = items || user.cart.items || [];
        const orderPackages = packages || user.cart.packages || [];

        if (orderItems.length === 0 && orderPackages.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        let subtotal = 0;
        const processedItems = [];
        const processedPackages = [];

        for (const item of orderItems) {
            const product = await Product.findById(item.product || item.productId);
            if (!product) continue;
            const price = product.newPrice;
            const quantity = item.quantity || 1;
            subtotal += price * quantity;
            processedItems.push({
                product: product._id,
                quantity,
                price,
            });
        }

        for (const pkg of orderPackages) {
            const packageDoc = await Package.findById(pkg.package || pkg.packageId);
            if (!packageDoc) continue;
            const price = packageDoc.totalPrice;
            const quantity = pkg.quantity || 1;
            subtotal += price * quantity;
            processedPackages.push({
                package: packageDoc._id,
                quantity,
                price,
            });
        }

        let shippingCost = 0;
        const carrierFilter = shippingCarrier ? { carrier: shippingCarrier } : {};
        const shippingRate = await ShippingRate.findOne({
            ...carrierFilter,
            $or: [
                { locationName: { $regex: shippingLocation, $options: 'i' } },
                { regionCode: { $regex: shippingLocation, $options: 'i' } },
            ],
        });

        if (shippingRate) {
            shippingCost = shippingRate.price;
        } else {
            const defaultQuery = shippingCarrier ? { carrier: shippingCarrier, isDefault: true } : { isDefault: true };
            const defaultRate = await ShippingRate.findOne(defaultQuery);
            shippingCost = defaultRate ? defaultRate.price : 0;
        }

        let hasFreeShipping = false;
        for (const item of processedItems) {
            const product = await Product.findById(item.product);
            if (product && product.freeShipping) {
                hasFreeShipping = true;
                break;
            }
        }
        if (!hasFreeShipping) {
            for (const pkg of processedPackages) {
                const packageDoc = await Package.findById(pkg.package);
                if (packageDoc && packageDoc.freeShipping) {
                    hasFreeShipping = true;
                    break;
                }
            }
        }

        if (hasFreeShipping) {
            shippingCost = 0;
        }

        let proofImage = null;
        if (proofOfPayment) {
            const result = await cloudinary.uploader.upload(proofOfPayment, {
                folder: 'wemax/payments',
            });
            proofImage = {
                url: result.secure_url,
                publicId: result.public_id,
            };
        }

        const order = await Order.create({
            customer: user._id,
            items: processedItems,
            packages: processedPackages,
            shippingAddress,
            shippingLocation,
            shippingCarrier,
            shippingCost,
            subtotal,
            total: subtotal + shippingCost,
            payment: {
                method: paymentMethod || 'bank',
                paybillNumber: process.env.BANK_PAYBILL_NUMBER || '123456',
                accountNumber: process.env.BANK_ACCOUNT_NUMBER || 'WEMAX001',
                proofImage,
                status: 'Pending',
            },
            // status here represents delivery/tracking status, not payment
            // Start as "Pending" so admin can change to "Processing" to trigger SMS
            status: 'Pending',
        });

        user.cart = { items: [], packages: [], subtotal: 0 };
        await user.save();

        const populatedOrder = await Order.findById(order._id)
            .populate('customer', 'name email phone')
            .populate('items.product')
            .populate('packages.package');

        // Generate quotation link
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const quotationLink = `${clientUrl}/orders/${order._id}/quotation`;

        // Generate PDF quotation and send email (non-blocking)
        (async () => {
            try {
                const pdfBuffer = await generateQuotationPDF(populatedOrder);
                const customerEmail = populatedOrder.customer?.email;
                const customerName = populatedOrder.customer?.name || populatedOrder.shippingAddress?.name || 'Customer';

                if (customerEmail) {
                    await sendQuotationEmail(customerEmail, customerName, pdfBuffer, order._id);
                    console.log('[Order] Quotation email sent to', customerEmail);
                } else {
                    console.warn('[Order] No customer email found for quotation');
                }
            } catch (err) {
                console.error('[Order] PDF/Email generation failed:', err?.message || err);
            }
        })();

        // Send order confirmation SMS with quotation link (non-blocking)
        const orderForSms = populatedOrder.toObject ? populatedOrder.toObject() : populatedOrder;
        console.log('[Order] Sending SMS to:', orderForSms.shippingAddress?.phone || orderForSms.customer?.phone);
        sendOrderConfirmationSMS(orderForSms, quotationLink).catch((err) => {
            console.error('[Order] SMS send failed:', err?.message || err);
        });

        res.status(201).json({
            order: populatedOrder,
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
        const query = {};

        if (req.user.role === 'customer') {
            query.customer = req.user._id;
        }

        if (status) {
            query.status = status;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const orders = await Order.find(query)
            .populate('customer', 'name email phone')
            .populate('items.product')
            .populate('packages.package')
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit));

        const total = await Order.countDocuments(query);

        res.json({
            orders,
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
        const order = await Order.findById(req.params.id)
            .populate('customer', 'name email phone')
            .populate('items.product')
            .populate('packages.package');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const previousStatus = order.status;

        // status here is the delivery / tracking status only
        order.status = status;
        await order.save();

        const populatedOrder = await Order.findById(order._id)
            .populate('customer', 'name email phone')
            .populate('items.product')
            .populate('packages.package');

        // Trigger SMS based on status change
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const trackingLink = `${clientUrl}/orders/${order._id}/track`;

        // SMS 2: When status changes from Processing to Processing (or any status) - but only if it was "PendingPayment" before
        // Actually, we want to send processing SMS when admin changes status TO "Processing" from any other status
        if (status === 'Processing' && previousStatus !== 'Processing') {
            sendOrderProcessingSMS(populatedOrder, trackingLink).catch((err) => {
                console.error('[Order] Processing SMS failed:', err?.message || err);
            });
        }

        // SMS 3: When status changes to "Delivered"
        if (status === 'Delivered' && previousStatus !== 'Delivered') {
            const courierLocation = order.shippingLocation || order.shippingAddress?.city || 'the courier location';
            sendDeliverySMS(populatedOrder, courierLocation).catch((err) => {
                console.error('[Order] Delivery SMS failed:', err?.message || err);
            });
        }

        res.json(populatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const confirmPayment = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (!order.payment) {
            order.payment = {};
        }
        order.payment.paidAt = new Date();
        order.payment.status = 'Paid';
        await order.save();

        const populatedOrder = await Order.findById(order._id)
            .populate('customer', 'name email phone')
            .populate('items.product')
            .populate('packages.package');

        res.json(populatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getQuotationPDF = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'name email phone')
            .populate('items.product')
            .populate('packages.package');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user has access (customer can only access their own orders)
        if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const pdfBuffer = await generateQuotationPDF(order);
        const quotationNumber = `QT-${String(order._id).slice(-8).toUpperCase()}`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="quotation-${quotationNumber}.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('[Order] PDF generation error:', error);
        res.status(500).json({ message: error.message });
    }
};
