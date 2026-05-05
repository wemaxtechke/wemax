import fetch from 'node-fetch';
import { executeQuery } from '../lib/mysql.js';
import { formatProduct } from '../lib/apiFormatters.js';

/** Prisma Client enum names for ProductCategory */
const PRODUCT_CATEGORIES = [
    'Electronics',
    'Furniture',
    'HomeAppliances',
    'KitchenAppliances',
    'Instruments',
];

function normalizeCategory(input) {
    if (!input || typeof input !== 'string') return null;
    const s = input.trim();
    const compact = s.replace(/\s+/g, '').toLowerCase();
    const alias = {
        electronics: 'Electronics',
        furniture: 'Furniture',
        homeappliances: 'HomeAppliances',
        kitchenappliances: 'KitchenAppliances',
        instruments: 'Instruments',
        homeappliance: 'HomeAppliances',
    };
    let fromAlias = alias[compact];
    if (!fromAlias && s.toLowerCase() === 'home appliances') fromAlias = 'HomeAppliances';
    if (!fromAlias && s.toLowerCase() === 'kitchen appliances') fromAlias = 'KitchenAppliances';
    if (fromAlias && PRODUCT_CATEGORIES.includes(fromAlias)) return fromAlias;
    const exact = PRODUCT_CATEGORIES.find((c) => c.toLowerCase() === s.toLowerCase());
    return exact || null;
}

function extractJsonObject(content) {
    let text = content?.trim() || '';
    const fenceMatch = text.match(/```(?:json)?([\s\S]*?)```/i);
    if (fenceMatch) text = fenceMatch[1].trim();
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        text = text.slice(startIdx, endIdx + 1).trim();
    }
    try {
        return JSON.parse(text);
    } catch (e) {
        // If JSON parsing fails, the AI returned plain text
        // Return a fallback structure
        return {
            assistantText: text,
            quickReplies: [],
            readyToSearch: false,
            filters: {
                search: null,
                category: null,
                subCategory: null,
                brand: null,
                minPrice: null,
                maxPrice: null
            }
        };
    }
}

// Common typo autocorrections
const TYPO_FIXES = {
    mornitor: 'monitor',
    mornitors: 'monitors',
    studiio: 'studio',
    speeker: 'speaker',
    speekers: 'speakers',
    headfone: 'headphone',
    headfones: 'headphones',
    laptoop: 'laptop',
    laptoops: 'laptops',
    desktopp: 'desktop',
    desktops: 'desktops',
    mobille: 'mobile',
    mobilles: 'mobiles',
    cammera: 'camera',
    cammeras: 'cameras',
    printter: 'printer',
    printters: 'printers',
    keybord: 'keyboard',
    keybords: 'keyboards',
    mouuse: 'mouse',
    mouce: 'mouse',
    tabblet: 'tablet',
    tabblets: 'tablets',
    televiision: 'television',
    tvv: 'tv',
    woofeer: 'woofer',
    woofers: 'woofers',
    subwoofeer: 'subwoofer',
    amplifiier: 'amplifier',
    amplifi: 'amp',
    ampli: 'amp',
    mikrophone: 'microphone',
    mic: 'microphone',
    mixer: 'mixer',
    controlller: 'controller',
    dj: 'dj',
    consolle: 'console',
    djcontroller: 'dj controller',
};

function autocorrectSearchTerm(search) {
    if (!search) return search;
    const words = search.toLowerCase().split(/\s+/);
    const corrected = words.map(word => TYPO_FIXES[word] || word);
    return corrected.join(' ');
}

function buildProductWhereSQL(filters) {
    const conditions = [];
    const params = [];

    let search = filters.search && String(filters.search).trim();
    if (search) {
        // Apply typo autocorrection
        search = autocorrectSearchTerm(search);
        const q = `%${search}%`;
        conditions.push('(p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)');
        params.push(q, q, q);
    }

    const category = normalizeCategory(filters.category);
    if (category) {
        conditions.push('p.category = ?');
        params.push(category);
    }

    if (filters.subCategory && String(filters.subCategory).trim()) {
        conditions.push('p.subCategory = ?');
        params.push(String(filters.subCategory).trim());
    }

    if (filters.brand && String(filters.brand).trim()) {
        conditions.push('p.brand = ?');
        params.push(String(filters.brand).trim());
    }

    const minPrice =
        filters.minPrice != null && filters.minPrice !== ''
            ? Number(filters.minPrice)
            : null;
    const maxPrice =
        filters.maxPrice != null && filters.maxPrice !== ''
            ? Number(filters.maxPrice)
            : null;

    if (minPrice != null && !Number.isNaN(minPrice)) {
        conditions.push('p.newPrice >= ?');
        params.push(minPrice);
    }
    if (maxPrice != null && !Number.isNaN(maxPrice)) {
        conditions.push('p.newPrice <= ?');
        params.push(maxPrice);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, params };
}

function hasConcreteFilters(filters) {
    const search = filters.search && String(filters.search).trim();
    if (search) return true;
    if (normalizeCategory(filters.category)) return true;
    if (filters.subCategory && String(filters.subCategory).trim()) return true;
    if (filters.brand && String(filters.brand).trim()) return true;
    const minPrice =
        filters.minPrice != null && filters.minPrice !== ''
            ? Number(filters.minPrice)
            : null;
    const maxPrice =
        filters.maxPrice != null && filters.maxPrice !== ''
            ? Number(filters.maxPrice)
            : null;
    if (minPrice != null && !Number.isNaN(minPrice)) return true;
    if (maxPrice != null && !Number.isNaN(maxPrice)) return true;
    return false;
}

export const shopAssistant = async (req, res) => {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: 'OPENAI_API_KEY is not configured on the server' });
        }

        let { messages } = req.body || {};
        if (!Array.isArray(messages)) {
            return res.status(400).json({ message: 'messages array is required' });
        }

        messages = messages
            .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
            .map((m) => ({
                role: m.role,
                content: String(m.content).slice(0, 500),
            }));

        if (messages.length === 0) {
            return res.status(400).json({ message: 'At least one message is required' });
        }

        const lastUser = [...messages].reverse().find((m) => m.role === 'user');
        if (!lastUser?.content?.trim()) {
            return res.status(400).json({ message: 'A user message is required' });
        }

        const trimmedHistory = messages.slice(-20);

        const systemPrompt = `You help shoppers find products in an online store (Wemax). Reply concisely.

RULES:
- assistantText: max 2–3 short sentences. Friendly, no fluff.
- CRITICAL: NEVER say "Searching...", "Looking for...", "Finding..." or similar. Just return JSON. The system searches automatically.
- If product type OR budget is unclear, set readyToSearch to false and ask ONE focused question in assistantText.
- quickReplies: 2–4 very short chip labels (e.g. "Under 10k", "Sound systems", "Phones") to guide the user; empty array if none.
- filters: extract search keywords (e.g. woofer, TV), optional category, subCategory, brand, minPrice, maxPrice (numbers in KES).
- readyToSearch: true only when you have enough to run a product search (product type or clear search terms AND usually a budget or narrow category). If user gave both product idea and price range, readyToSearch true.
- Valid category values ONLY one of: Electronics, Furniture, Home Appliances, Kitchen Appliances, Instruments (use exact spelling for JSON; we map them server-side).
- Never invent product IDs or stock. Only JSON output.

OUTPUT: a single JSON object ONLY:
{
  "assistantText": string,
  "quickReplies": string[],
  "readyToSearch": boolean,
  "filters": {
    "search": string | null,
    "category": string | null,
    "subCategory": string | null,
    "brand": string | null,
    "minPrice": number | null,
    "maxPrice": number | null
  }
}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...trimmedHistory.map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                ],
                temperature: 0.3,
                max_tokens: 500,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI shopAssistant error:', errorText);
            return res.status(502).json({ message: 'Shop assistant is temporarily unavailable' });
        }

        const data = await response.json();
        let rawContent = data?.choices?.[0]?.message?.content?.trim();
        if (!rawContent) {
            return res.status(502).json({ message: 'Empty response from AI' });
        }

        const parsed = extractJsonObject(rawContent);

        let assistantText =
            typeof parsed.assistantText === 'string' ? parsed.assistantText.trim() : 'How can I help you find something?';
        let quickReplies = Array.isArray(parsed.quickReplies)
            ? parsed.quickReplies.filter((x) => typeof x === 'string').map((x) => x.trim()).slice(0, 4)
            : [];

        const filters = parsed.filters && typeof parsed.filters === 'object' ? parsed.filters : {};

        const normalizedFilters = {
            search: filters.search != null ? String(filters.search) : '',
            category: filters.category != null ? String(filters.category) : '',
            subCategory: filters.subCategory != null ? String(filters.subCategory) : '',
            brand: filters.brand != null ? String(filters.brand) : '',
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
        };

        let products = [];

        const canQuery = hasConcreteFilters(normalizedFilters);

        if (canQuery) {
            const { whereClause, params } = buildProductWhereSQL(normalizedFilters);

            // Get products with images and specs
            const productsQuery = `
                SELECT
                    p.*,
                    pi.id as imageId,
                    pi.url as imageUrl,
                    pi.publicId as imagePublicId,
                    pi.sortOrder as imageSortOrder,
                    ps.id as specId,
                    ps.specKey,
                    ps.value as specValue
                FROM Product p
                LEFT JOIN ProductImage pi ON p.id = pi.productId
                LEFT JOIN ProductSpec ps ON p.id = ps.productId
                ${whereClause}
                ORDER BY p.isFeatured DESC, p.createdAt DESC
                LIMIT 8
            `;
            const rows = await executeQuery(productsQuery, params);

            // Group product data
            const productsMap = new Map();
            rows.forEach(row => {
                if (!productsMap.has(row.id)) {
                    productsMap.set(row.id, {
                        ...row,
                        images: [],
                        specifications: []
                    });
                }
                const product = productsMap.get(row.id);
                if (row.imageId && !product.images.find(img => img.id === row.imageId)) {
                    product.images.push({
                        id: row.imageId,
                        url: row.imageUrl,
                        publicId: row.imagePublicId,
                        sortOrder: row.imageSortOrder
                    });
                }
                if (row.specId && !product.specifications.find(s => s.id === row.specId)) {
                    product.specifications.push({
                        id: row.specId,
                        specKey: row.specKey,
                        value: row.specValue
                    });
                }
            });

            products = Array.from(productsMap.values()).map(formatProduct);

            if (products.length === 0 && parsed.readyToSearch) {
                assistantText =
                    assistantText +
                    (assistantText.endsWith('.') ? ' ' : '. ') +
                    'No exact matches — try widening budget or different keywords.';
                if (quickReplies.length === 0) {
                    quickReplies = ['Higher budget', 'Different brand', 'Browse Electronics'];
                }
            }
        }

        return res.json({
            assistantText,
            quickReplies,
            products,
        });
    } catch (error) {
        console.error('shopAssistant error:', error);
        return res.status(500).json({ message: 'Shop assistant failed' });
    }
};

export const parseSpecifications = async (req, res) => {
    try {
        const { text } = req.body || {};

        if (!text || typeof text !== 'string' || !text.trim()) {
            return res.status(400).json({ message: 'Text with specifications is required' });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: 'OPENAI_API_KEY is not configured on the server' });
        }

        const prompt = `
You are a strict JSON generator that understands common electronics specifications.

INPUT:
- A block of text that may contain:
  - Explicit spec lines like:
    Front Camera\t5MP
    Back Camera\t8MP
    Display  5.0″ inch
  - Label/value pairs that are split across multiple lines, e.g.:
    Type
    Brand New
    Condition
    Used
  - A long free‑form description that may also contain hidden specs.
- The separator between label and value can be a tab, multiple spaces, a dash (-), or a colon (:).

TASK:
- Parse ALL useful specs from the entire text (including description lines) into an array of objects:
  { "key": string, "value": string }.
- Use your judgment to pair labels with the correct values:
  - Example: if you see
      DJ Controllers
      Type
      Brand New
    treat **"Brand New"** as the value for **"Condition"** (not "Type"), because "Brand New" is a condition.
  - Example: if you see a brand name like "Numark" or "Samsung" near words like "Brand", map it to key "Brand".
- Prefer sensible keys like "Condition", "Brand", "Model", etc., when the text clearly indicates them.
- Do NOT invent specs that are not present in the text.
- Ignore completely empty lines and meaningless tokens like "Menu".
- Preserve the original wording for values as much as possible.

OUTPUT FORMAT (VERY IMPORTANT):
- Return ONLY valid JSON, with this exact shape:
[
  { "key": "Front Camera", "value": "5MP" },
  { "key": "Back Camera", "value": "8MP" }
]
- No markdown, no backticks, no comments, no trailing commas.

Here is the raw input text to parse:
---
${text}
---`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
                messages: [
                    { role: 'system', content: 'You are a strict JSON generator that only outputs JSON.' },
                    { role: 'user', content: prompt },
                ],
                temperature: 0,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API error:', errorText);
            return res.status(502).json({ message: 'Failed to parse specifications with AI' });
        }

        const data = await response.json();
        let content = data?.choices?.[0]?.message?.content?.trim();

        if (!content) {
            return res.status(502).json({ message: 'Empty response from AI' });
        }

        // Some models may wrap the JSON in ```json fences or add extra text.
        // Try to robustly extract the JSON array.
        const fenceMatch = content.match(/```(?:json)?([\s\S]*?)```/i);
        if (fenceMatch) {
            content = fenceMatch[1].trim();
        }

        // Extract between the first "[" and the last "]"
        const startIdx = content.indexOf('[');
        const endIdx = content.lastIndexOf(']');
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            content = content.slice(startIdx, endIdx + 1).trim();
        }

        let specs;
        try {
            specs = JSON.parse(content);
        } catch (e) {
            console.error('Failed to parse AI JSON content:', content);
            return res.status(502).json({ message: 'AI returned invalid JSON' });
        }

        if (!Array.isArray(specs)) {
            return res.status(502).json({ message: 'AI response is not an array' });
        }

        const normalized = specs
            .filter((item) => item && typeof item.key === 'string' && typeof item.value === 'string')
            .map((item) => ({
                key: item.key.trim(),
                value: item.value.trim(),
            }))
            .filter((item) => item.key || item.value);

        return res.json({ specifications: normalized });
    } catch (error) {
        console.error('parseSpecifications error:', error);
        return res.status(500).json({ message: 'Failed to parse specifications' });
    }
};
