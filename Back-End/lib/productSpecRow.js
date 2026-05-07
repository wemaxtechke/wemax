/**
 * Resolve ProductSpec columns from mysql2 RowDataPacket across hosts/drivers
 * (alias casing differs; Prisma uses column `key` while manual schema uses specKey).
 *
 * Sanity checks after deploy:
 * - GET /api/products/:id → specifications[].key non-empty when DB has labels.
 * - SELECT * FROM ProductSpec WHERE productId = ? → label column matches stored keys.
 */

export function rowProductSpecLabel(row) {
    if (!row || typeof row !== 'object') return '';
    const raw = row.specKey ?? row.speckey ?? row.SPECKEY ?? row.key ?? row.KEY;
    if (raw == null) return '';
    const s = String(raw).replace(/\u00a0/g, ' ').trim();
    return s;
}

export function rowProductSpecValue(row) {
    if (!row || typeof row !== 'object') return '';
    const raw = row.specValue ?? row.specvalue ?? row.SPECVALUE ?? row.value ?? row.VALUE;
    if (raw == null) return '';
    return String(raw);
}
