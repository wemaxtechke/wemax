import { discountPercentPackage, discountPercentProduct } from './apiShape.js';

export const productDetailInclude = {
    images: { orderBy: { sortOrder: 'asc' } },
    specifications: true,
};

export const packageDetailInclude = {
    items: { include: { product: { include: productDetailInclude } } },
    images: { orderBy: { sortOrder: 'asc' } },
};

export const prismaOrderInclude = {
    customer: { select: { id: true, name: true, email: true, phone: true } },
    items: {
        include: {
            product: { include: productDetailInclude },
        },
    },
    packages: {
        include: {
            package: { include: packageDetailInclude },
        },
    },
};

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

export async function formatCart(prisma, userId) {
    const [lines, pkgLines] = await Promise.all([
        prisma.cartProductLine.findMany({
            where: { userId },
            include: { product: { include: productDetailInclude } },
        }),
        prisma.cartPackageLine.findMany({
            where: { userId },
            include: {
                package: {
                    include: {
                        items: { include: { product: { include: productDetailInclude } } },
                        images: { orderBy: { sortOrder: 'asc' } },
                    },
                },
            },
        }),
    ]);

    let subtotal = 0;
    const items = lines.map((l) => {
        subtotal += l.price * l.quantity;
        return {
            _id: String(l.id),
            product: formatProduct(l.product),
            quantity: l.quantity,
            price: l.price,
        };
    });
    const packages = pkgLines.map((l) => {
        subtotal += l.price * l.quantity;
        return {
            _id: String(l.id),
            package: formatPackage(l.package),
            quantity: l.quantity,
            price: l.price,
        };
    });

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
