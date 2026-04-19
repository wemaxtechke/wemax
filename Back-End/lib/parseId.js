export function parseIntId(param) {
    if (param === undefined || param === null || param === '') return null;
    const n = Number(param);
    if (!Number.isInteger(n) || n < 1) return null;
    return n;
}
