/** Phone brands - used when adding phones (subCategory: Phones) */
export const PHONE_BRANDS = [
    'Tecno',
    'Infinix',
    'Oppo',
    'Nokia',
    'Xiaomi',
    'Apple',
    'Itel',
    'Huawei',
    'realme',
    'Samsung',
    'vivo',
    'Google Pixel',
];

/**
 * Product categories and sub-categories. Used for:
 * - Admin product creation (category + subCategory)
 * - Home page category section (browse by sub-category)
 */
export const CATEGORIES = {
    Electronics: [
        'Phones',
        'TVs',
        'Woofers',
        'Sound Systems',
        'Mixers',
        'Speakers',
        'Power Amplifiers',
        'Generators',
        'Streaming Equipment',
        'Accessories',
    ],
    Furniture: [
        'Chairs',
        'Beds',
        'Mattresses',
        'Sofa Sets',
        'Compressed Sofas',
        'Dining Sets',
        'Coffee Tables',
        'Wardrobes',
        'Office Furniture',
    ],
};

/** All sub-categories as a flat list for the home page browse section */
export const SUB_CATEGORIES = [
    ...CATEGORIES.Electronics,
    ...CATEGORIES.Furniture,
];
