import { executeQuery } from './mysql.js';

/** @type {null | Promise<'specKey' | 'key'>} */
let detectPromise;

/**
 * Resolve whether ProductSpec uses `specKey` (database-schema.sql) or `` `key` `` (Prisma migration).
 */
export async function getProductSpecKeyColumnName() {
    if (!detectPromise) {
        detectPromise = (async () => {
            try {
                const rows = await executeQuery(
                    `SELECT COLUMN_NAME AS col FROM INFORMATION_SCHEMA.COLUMNS
                     WHERE TABLE_SCHEMA = DATABASE()
                       AND LOWER(TABLE_NAME) = 'productspec'
                       AND COLUMN_NAME IN ('key', 'specKey')`
                );
                const set = new Set(
                    rows.map((r) => String(r.col ?? r.COLUMN_NAME ?? '').toLowerCase())
                );
                if (set.has('speckey')) return 'specKey';
                if (set.has('key')) return 'key';
            } catch (e) {
                console.warn('productSpecColumn: INFO_SCHEMA detect failed:', e.message);
            }
            return 'specKey';
        })();
    }
    const col = await detectPromise;
    return col;
}

/** SQL fragment `ps.specKey` or `` ps.`key` `` plus alias AS specKey (for unified row handling). */
export async function sqlSpecKeySelect(alias = 'ps') {
    const col = await getProductSpecKeyColumnName();
    if (col === 'key') return `${alias}.\`key\` AS specKey`;
    return `${alias}.specKey AS specKey`;
}

/** Column list for INSERT, e.g. specKey or `key`. */
export async function sqlSpecKeyInsertColumnRef() {
    const col = await getProductSpecKeyColumnName();
    return col === 'key' ? '`key`' : 'specKey';
}
