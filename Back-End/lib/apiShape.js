export function discountPercentProduct(p) {
    const oldP = p.oldPrice;
    const newP = p.newPrice;
    if (oldP == null || oldP <= newP) return 0;
    return Math.round(((oldP - newP) / oldP) * 100);
}

export function discountPercentPackage(p) {
    const oldP = p.oldTotalPrice;
    const newP = p.totalPrice;
    if (oldP == null || oldP <= newP) return 0;
    return Math.round(((oldP - newP) / oldP) * 100);
}

export function mongoShape(value) {
    if (value === null || value === undefined) return value;
    if (value instanceof Date) return value;
    if (Array.isArray(value)) return value.map(mongoShape);
    if (typeof value !== 'object') return value;
    const out = {};
    for (const [k, v] of Object.entries(value)) {
        if (k === 'id') {
            out._id = String(v);
        } else {
            out[k] = mongoShape(v);
        }
    }
    return out;
}
