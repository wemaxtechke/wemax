import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import fetch from 'node-fetch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif']);

const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

export function getUploadsRoot() {
    const raw = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');
    return path.isAbsolute(raw) ? raw : path.resolve(path.join(__dirname, '..'), raw);
}

export function getPublicBaseUrl() {
    const base = process.env.API_PUBLIC_URL || process.env.SERVER_URL || 'http://localhost:5000';
    return String(base).replace(/\/+$/, '');
}

export async function ensureUploadsDir() {
    const root = getUploadsRoot();
    await fs.mkdir(path.join(root, 'wemax', 'products'), { recursive: true });
    await fs.mkdir(path.join(root, 'wemax', 'packages'), { recursive: true });
    await fs.mkdir(path.join(root, 'wemax', 'payments'), { recursive: true });
}

function extFromOriginalName(originalname) {
    const ext = path.extname(originalname || '').toLowerCase();
    if (ALLOWED_EXT.has(ext)) return ext;
    return '.jpg';
}

function normalizeRelativeKey(folder, filename) {
    const parts = folder.split('/').filter(Boolean).concat(filename);
    return parts.join('/');
}

export async function saveUploadBuffer(buffer, folder, originalName) {
    if (!buffer?.length) {
        throw new Error('Empty file');
    }
    await ensureUploadsDir();
    const ext = extFromOriginalName(originalName);
    const filename = `${randomUUID()}${ext}`;
    const relativeKey = normalizeRelativeKey(folder, filename);
    const fullDir = path.join(getUploadsRoot(), folder);
    await fs.mkdir(fullDir, { recursive: true });
    const fullPath = path.join(fullDir, filename);
    await fs.writeFile(fullPath, buffer);
    const url = `${getPublicBaseUrl()}/uploads/${relativeKey}`;
    return { secure_url: url, public_id: relativeKey };
}

export async function deleteStoredFile(publicId) {
    if (!publicId || typeof publicId !== 'string') return;
    const root = path.resolve(getUploadsRoot());
    const segments = publicId.split('/').filter((s) => s && s !== '.' && s !== '..');
    const target = path.join(root, ...segments);
    const resolved = path.resolve(target);
    if (!resolved.startsWith(root)) {
        console.warn('[storage] Refusing to delete outside uploads root:', publicId);
        return;
    }
    try {
        await fs.unlink(resolved);
    } catch (e) {
        if (e.code !== 'ENOENT') {
            throw e;
        }
    }
}

export async function saveRemoteOrDataUrl(input, folder) {
    if (!input || typeof input !== 'string') {
        return null;
    }

    const trimmed = input.trim();
    const dataMatch = trimmed.match(/^data:([^;]+);base64,([\s\S]+)$/i);
    if (dataMatch) {
        const mime = dataMatch[1];
        let ext = '.jpg';
        if (mime.includes('png')) ext = '.png';
        else if (mime.includes('gif')) ext = '.gif';
        else if (mime.includes('webp')) ext = '.webp';
        else if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';

        const buffer = Buffer.from(dataMatch[2].replace(/\s/g, ''), 'base64');
        await ensureUploadsDir();
        const filename = `${randomUUID()}${ext}`;
        const relativeKey = normalizeRelativeKey(folder, filename);
        const fullDir = path.join(getUploadsRoot(), folder);
        await fs.mkdir(fullDir, { recursive: true });
        const fullPath = path.join(fullDir, filename);
        await fs.writeFile(fullPath, buffer);
        const url = `${getPublicBaseUrl()}/uploads/${relativeKey}`;
        return { secure_url: url, public_id: relativeKey };
    }

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        const res = await fetch(trimmed);
        if (!res.ok) {
            throw new Error(`Failed to fetch proof image: ${res.status}`);
        }
        const buf = Buffer.from(await res.arrayBuffer());
        const ct = res.headers.get('content-type') || '';
        let ext = '.jpg';
        if (ct.includes('png')) ext = '.png';
        else if (ct.includes('gif')) ext = '.gif';
        else if (ct.includes('webp')) ext = '.webp';

        await ensureUploadsDir();
        const filename = `${randomUUID()}${ext}`;
        const relativeKey = normalizeRelativeKey(folder, filename);
        const fullDir = path.join(getUploadsRoot(), folder);
        await fs.mkdir(fullDir, { recursive: true });
        const fullPath = path.join(fullDir, filename);
        await fs.writeFile(fullPath, buf);
        const url = `${getPublicBaseUrl()}/uploads/${relativeKey}`;
        return { secure_url: url, public_id: relativeKey };
    }

    return null;
}
