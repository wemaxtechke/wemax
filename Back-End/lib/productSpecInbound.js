/** Merge client shapes (label/specKey/key, value, etc.) → { key, value } with trim. */

export function normalizeIncomingSpec(raw) {
    if (raw == null || typeof raw !== 'object') return null;

    const lower = {};
    for (const [k, v] of Object.entries(raw)) {
        lower[String(k).toLowerCase()] = v;
    }

    // Prefer `label` / `name` first: some hosts strip JSON fields named "key" from multipart bodies.
    const keyRaw =
        lower.label ??
        lower.name ??
        lower.speckey ??
        lower.spec_key ??
        lower.key ??
        lower.title ??
        '';

    let valueRaw = lower.value ?? lower.specvalue ?? lower.val ?? lower.detail ?? '';
    if (valueRaw !== null && typeof valueRaw === 'object') {
        try {
            valueRaw = JSON.stringify(valueRaw);
        } catch {
            valueRaw = String(valueRaw);
        }
    }

    const key =
        keyRaw !== undefined && keyRaw !== null && keyRaw !== ''
            ? String(keyRaw).replace(/\u00a0/g, ' ').trim()
            : '';
    const value =
        valueRaw !== undefined && valueRaw !== null && valueRaw !== ''
            ? String(valueRaw).replace(/\u00a0/g, ' ').trim()
            : '';

    if (!key && !value) return null;

    return { key, value };
}

export function normalizeIncomingSpecifications(list) {
    if (!Array.isArray(list)) return [];
    return list.map(normalizeIncomingSpec).filter(Boolean);
}
