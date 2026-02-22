/**
 * Africa's Talking SMS service.
 * Sends order confirmation SMS to customers when they place an order.
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/**
 * Normalize phone number to international format (+254XXXXXXXXX for Kenya).
 * Handles: 0712345678, 254712345678, +254 712 345 678, etc.
 */
function normalizePhone(phone) {
    if (!phone || typeof phone !== 'string') return null;
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('254')) {
        return `+${cleaned}`;
    }
    if (cleaned.startsWith('0') && cleaned.length === 10) {
        return `+254${cleaned.slice(1)}`;
    }
    if (cleaned.length === 9) {
        return `+254${cleaned}`;
    }
    return `+${cleaned}`;
}

function getFirstName(fullName) {
    if (!fullName || typeof fullName !== 'string') return 'Customer';
    const trimmed = fullName.trim();
    if (!trimmed) return 'Customer';
    return trimmed.split(/\s+/)[0];
}

/**
 * Send an SMS via Africa's Talking.
 * @param {string} to - Recipient phone number (will be normalized)
 * @param {string} message - SMS content
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function sendSMS(to, message) {
    const apiKey = process.env.AT_API_KEY;
    const username = process.env.AT_USERNAME || 'sandbox';

    if (!apiKey) {
        console.warn('[SMS] AT_API_KEY not set - skipping SMS');
        return { success: false, error: 'SMS not configured' };
    }

    const normalizedPhone = normalizePhone(to);
    if (!normalizedPhone) {
        console.warn('[SMS] Invalid phone number:', to);
        return { success: false, error: 'Invalid phone number' };
    }

    try {
        const AfricasTalking = require('africastalking')({ apiKey, username });
        const sms = AfricasTalking.SMS;

        await sms.send({
            to: [normalizedPhone],
            message: message.trim(),
        });

        console.log('[SMS] Order confirmation sent to', normalizedPhone);
        return { success: true };
    } catch (err) {
        console.error('[SMS] Failed to send:', err.message);
        if (err.response) console.error('[SMS] API response:', err.response);
        return { success: false, error: err.message };
    }
}

/**
 * Build and send order confirmation SMS (SMS 1).
 * @param {Object} order - Populated order with customer, items.product, packages.package
 * @param {string} quotationLink - Link to download PDF quotation
 */
export async function sendOrderConfirmationSMS(order, quotationLink) {
    const phone = order.shippingAddress?.phone || order.customer?.phone;
    console.log('[SMS] Attempting to send order confirmation. Phone from order:', phone || '(none)');
    if (!phone) {
        console.warn('[SMS] No phone number for order confirmation - check shippingAddress.phone');
        return { success: false, error: 'No phone number' };
    }

    const fullName = order.shippingAddress?.name || order.customer?.name;
    const customerName = getFirstName(fullName);
    const orderId = String(order._id).slice(-8).toUpperCase();
    const paybillNumber = process.env.BANK_PAYBILL_NUMBER || '123456';
    const accountNumber = process.env.BANK_ACCOUNT_NUMBER || 'WEMAX001';

    // Build products list
    const productDetails = [];
    for (const item of order.items || []) {
        const name = item.product?.name || 'Product';
        const qty = item.quantity || 1;
        const price = item.price || 0;
        const total = price * qty;
        productDetails.push(`${name} (x${qty}) - KES ${total.toLocaleString()}`);
    }
    for (const pkg of order.packages || []) {
        const name = pkg.package?.name || 'Package';
        const qty = pkg.quantity || 1;
        const price = pkg.price || 0;
        const total = price * qty;
        productDetails.push(`${name} (x${qty}) - KES ${total.toLocaleString()}`);
    }

    const productsList = productDetails.length > 0 ? productDetails.join(', ') : 'Your order';
    const total = order.total != null ? Number(order.total).toLocaleString() : '0';

    const message = `WEMAX TECH\nHello ${customerName},\nThank you for your order!\nOrder ID: ${orderId}\nProducts:\n${productsList}\nTotal Amount: KES ${total}\nPayment Details:\nPaybill: ${paybillNumber}\nAccount: ${accountNumber}\nQuotation: ${quotationLink}\nThank you for choosing Wemax Tech!\nSmart Tech. Smart Living.`;

    return sendSMS(phone, message);
}

/**
 * Send order processing confirmation SMS (SMS 2).
 * @param {Object} order - Populated order with customer
 * @param {string} trackingLink - Link to track the order
 */
export async function sendOrderProcessingSMS(order, trackingLink) {
    const phone = order.shippingAddress?.phone || order.customer?.phone;
    if (!phone) {
        console.warn('[SMS] No phone number for processing SMS');
        return { success: false, error: 'No phone number' };
    }

    const fullName = order.shippingAddress?.name || order.customer?.name;
    const customerName = getFirstName(fullName);
    const orderId = String(order._id).slice(-8).toUpperCase();

    const message = `Hello ${customerName},\n\nYour Wemax Tech order (${orderId}) has been successfully confirmed and is now being processed.\n\nYou can track your parcel using the link below:\n${trackingLink}\n\nThank you for choosing Wemax Tech - Smart Tech. Smart Living.`;

    return sendSMS(phone, message);
}

/**
 * Send delivery notification SMS (SMS 3).
 * @param {Object} order - Populated order with customer and shipping details
 * @param {string} courierLocation - Location where parcel is ready for collection
 */
export async function sendDeliverySMS(order, courierLocation) {
    const phone = order.shippingAddress?.phone || order.customer?.phone;
    if (!phone) {
        console.warn('[SMS] No phone number for delivery SMS');
        return { success: false, error: 'No phone number' };
    }

    const message = `Your parcel is ready for collection at ${courierLocation || 'the courier location'}.\n\nPlease collect it within 48 hours to avoid return or storage fees.\n\nThank you for choosing Wemax Tech!`;

    return sendSMS(phone, message);
}
