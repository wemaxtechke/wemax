import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import { parseSpecifications, shopAssistant } from '../controllers/aiController.js';

const router = express.Router();

/** Simple sliding-window rate limit per IP for public Shop AI */
const SHOP_AI_WINDOW_MS = 15 * 60 * 1000;
const SHOP_AI_MAX = 20;
const shopAiBuckets = new Map();

function rateLimitShopAssistant(req, res, next) {
    const rawIp = req.ip || req.socket?.remoteAddress || 'unknown';
    const ip = typeof rawIp === 'string' ? rawIp : String(rawIp);
    const now = Date.now();
    let b = shopAiBuckets.get(ip);
    if (!b || now > b.resetAt) {
        b = { count: 0, resetAt: now + SHOP_AI_WINDOW_MS };
        shopAiBuckets.set(ip, b);
    }
    b.count += 1;
    if (b.count > SHOP_AI_MAX) {
        return res.status(429).json({
            message: 'Too many requests. Please try again in a few minutes.',
        });
    }
    next();
}

router.post('/shop-assistant', rateLimitShopAssistant, shopAssistant);
router.post('/parse-specs', requireAuth, requireAdmin, parseSpecifications);

export default router;
