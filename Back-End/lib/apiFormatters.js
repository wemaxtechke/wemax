import { discountPercentPackage, discountPercentProduct } from './apiShape.js';

export function formatProduct(p) {
    if (!p) return null;
    const loc = p.locationShipping;
    return {
        _id: String(p.id),
        name: p.name,
        description: p.description,
        category: p.category,
        subCategory: p.subCategory,
        brand: p.brand,
        newPrice: p.newPrice,
        oldPrice: p.oldPrice,
        freeShipping: p.freeShipping,
        stock: p.stock,
        locationShipping: loc && typeof loc === 'object' && !Array.isArray(loc) ? loc : {},
        images: (p.images || []).map((img) => ({
            _id: String(img.id),
            url: img.url,
            publicId: img.publicId,
        })),
        specifications: (p.specifications || []).map((s) => ({
            _id: String(s.id),
            key: s.key,
            value: s.value,
        })),
        averageRating: p.averageRating,
        reviewsCount: p.reviewsCount,
        isFeatured: p.isFeatured,
        isFlashDeal: p.isFlashDeal,
        createdBy: p.createdById != null ? String(p.createdById) : undefined,
        createdByEmail: p.createdByEmail || undefined,
        discountPercent: discountPercentProduct(p),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
    };
}

export function formatPackage(pkg) {
    if (!pkg) return null;
    return {
        _id: String(pkg.id),
        name: pkg.name,
        description: pkg.description,
        items: (pkg.items || []).map((row) => ({
            _id: String(row.id),
            product: formatProduct(row.product),
            quantity: row.quantity,
        })),
        totalPrice: pkg.totalPrice,
        oldTotalPrice: pkg.oldTotalPrice,
        freeShipping: pkg.freeShipping,
        category: pkg.category,
        tag: pkg.tag,
        images: (pkg.images || []).map((img) => ({
            _id: String(img.id),
            url: img.url,
            publicId: img.publicId,
        })),
        discountPercent: discountPercentPackage(pkg),
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt,
    };
}

export function formatUserBrief(u) {
    if (!u) return null;
    return {
        _id: String(u.id),
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
    };
}

export function formatUserPublic(u) {
    if (!u) return null;
    return {
        _id: String(u.id),
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        googleId: u.googleId,
        isActive: u.isActive,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
    };
}

export function formatOrder(order) {
    if (!order) return null;
    return {
        _id: String(order.id),
        customer: formatUserBrief(order.customer),
        items: (order.items || []).map((row) => ({
            _id: String(row.id),
            product: formatProduct(row.product),
            quantity: row.quantity,
            price: row.price,
        })),
        packages: (order.packages || []).map((row) => ({
            _id: String(row.id),
            package: formatPackage(row.package),
            quantity: row.quantity,
            price: row.price,
        })),
        shippingAddress: {
            name: order.shipName,
            phone: order.shipPhone,
            city: order.shipCity,
            region: order.shipRegion,
            addressLine: order.shipAddressLine,
        },
        shippingLocation: order.shippingLocation,
        shippingCarrier: order.shippingCarrier,
        shippingCost: order.shippingCost,
        subtotal: order.subtotal,
        total: order.total,
        payment: {
            method: order.paymentMethod,
            paybillNumber: order.paymentPaybill,
            accountNumber: order.paymentAccount,
            proofImage:
                order.paymentProofUrl
                    ? { url: order.paymentProofUrl, publicId: order.paymentProofPublicId }
                    : undefined,
            paidAt: order.paymentPaidAt,
            status: order.paymentStatus,
        },
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
    };
}

export async function formatCart(userId) {
    // Import executeQuery dynamically to avoid circular dependency
    const { executeQuery } = await import('./mysql.js');

    // Get cart product lines with product details
    const lines = await executeQuery(`
        SELECT cpl.*, p.*, pi.url as imageUrl, ps.specKey, ps.value as specValue
        FROM CartProductLine cpl
        JOIN Product p ON cpl.productId = p.id
        LEFT JOIN ProductImage pi ON p.id = pi.productId AND pi.sortOrder = 0
        LEFT JOIN ProductSpec ps ON p.id = ps.productId
        WHERE cpl.userId = ?
    `, [userId]);

    // Get cart package lines with package details
    const pkgLines = await executeQuery(`
        SELECT ckl.*, pkg.*, pi.url as imageUrl, pii.productId, pii.quantity as itemQty,
               p.name as itemProductName, p.newPrice as itemProductPrice
        FROM CartPackageLine ckl
        JOIN Package pkg ON ckl.packageId = pkg.id
        LEFT JOIN PackageImage pi ON pkg.id = pi.packageId AND pi.sortOrder = 0
        LEFT JOIN PackageItem pii ON pkg.id = pii.packageId
        LEFT JOIN Product p ON pii.productId = p.id
        WHERE ckl.userId = ?
    `, [userId]);

    // Group product lines by cart line id
    const productMap = new Map();
    lines.forEach(row => {
        if (!productMap.has(row.id)) {
            const product = {
                id: row.productId,
                name: row.name,
                description: row.description,
                category: row.category,
                subCategory: row.subCategory,
                brand: row.brand,
                newPrice: row.newPrice,
                oldPrice: row.oldPrice,
                freeShipping: row.freeShipping,
                stock: row.stock,
                averageRating: row.averageRating,
                reviewsCount: row.reviewsCount,
                isFeatured: row.isFeatured,
                isFlashDeal: row.isFlashDeal,
                images: row.imageUrl ? [{ url: row.imageUrl, sortOrder: 0 }] : [],
                specifications: []
            };
            productMap.set(row.id, { product, quantity: row.quantity, price: row.price, cartLineId: row.id });
        }
        if (row.specKey && row.specValue) {
            const entry = productMap.get(row.id);
            entry.product.specifications.push({ specKey: row.specKey, value: row.specValue });
        }
    });

    // Group package lines by cart line id
    const packageMap = new Map();
    pkgLines.forEach(row => {
        if (!packageMap.has(row.id)) {
            const pkg = {
                id: row.packageId,
                name: row.name,
                description: row.description,
                totalPrice: row.totalPrice,
                oldTotalPrice: row.oldTotalPrice,
                freeShipping: row.freeShipping,
                category: row.category,
                tag: row.tag,
                images: row.imageUrl ? [{ url: row.imageUrl, sortOrder: 0 }] : [],
                items: []
            };
            packageMap.set(row.id, { package: pkg, quantity: row.quantity, price: row.price, cartLineId: row.id });
        }
        if (row.productId) {
            const entry = packageMap.get(row.id);
            entry.package.items.push({
                productId: row.productId,
                productName: row.itemProductName,
                quantity: row.itemQty,
                price: row.itemProductPrice
            });
        }
    });

    let subtotal = 0;
    const items = [];
    const packages = [];

    for (const [, value] of productMap) {
        subtotal += value.price * value.quantity;
        items.push({
            _id: String(value.cartLineId),
            product: formatProduct(value.product),
            quantity: value.quantity,
            price: value.price,
        });
    }

    for (const [, value] of packageMap) {
        subtotal += value.price * value.quantity;
        packages.push({
            _id: String(value.cartLineId),
            package: formatPackage(value.package),
            quantity: value.quantity,
            price: value.price,
        });
    }

    return { items, packages, subtotal };
}

export function formatReview(r) {
    if (!r) return null;
    return {
        _id: String(r.id),
        product: r.productId != null ? String(r.productId) : undefined,
        user: r.user
            ? { _id: String(r.user.id), name: r.user.name }
            : r.userId != null
              ? String(r.userId)
              : undefined,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
    };
}

export function formatChat(c) {
    if (!c) return null;
    return {
        _id: String(c.id),
        user: c.user ? formatUserBrief(c.user) : String(c.userId),
        lastMessageAt: c.lastMessageAt,
        unreadForAdmin: c.unreadForAdmin,
        unreadForUser: c.unreadForUser,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
    };
}

export function formatMessage(m) {
    if (!m) return null;
    return {
        _id: String(m.id),
        chat: String(m.chatId),
        senderRole: m.senderRole,
        sender: m.sender ? { _id: String(m.sender.id), name: m.sender.name } : String(m.senderId),
        content: m.content,
        attachments: (m.attachments || []).map((a) => ({
            _id: String(a.id),
            url: a.url,
            publicId: a.publicId,
            type: a.type,
        })),
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
    };
}

export function formatShippingRate(r) {
    if (!r) return null;
    return {
        _id: String(r.id),
        carrier: r.carrier,
        locationName: r.locationName,
        regionCode: r.regionCode,
        price: r.price,
        isDefault: r.isDefault,
        allowCashOnDelivery: r.allowCashOnDelivery,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
    };
}

export function formatFlashSale(s) {
    if (!s) return null;
    return {
        _id: String(s.id),
        hours: s.hours,
        minutes: s.minutes,
        seconds: s.seconds,
        isActive: s.isActive,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
    };
}

export function parseSort(sortParam, defaultField = 'createdAt') {
    const s = sortParam || `-${defaultField}`;
    const desc = s.startsWith('-');
    const field = desc ? s.slice(1) : s;
    return { [field]: desc ? 'desc' : 'asc' };
}

export function parseSortForSQL(sortParam, defaultField = 'createdAt') {
    const s = sortParam || `-${defaultField}`;
    const desc = s.startsWith('-');
    const field = desc ? s.slice(1) : s;
    return `${field} ${desc ? 'DESC' : 'ASC'}`;
}
