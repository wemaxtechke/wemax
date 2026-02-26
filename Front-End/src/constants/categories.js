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

/** Laptop brands - used when adding laptops (subCategory: Laptops) */
export const LAPTOP_BRANDS = [
    'HP',
    'Dell',
    'Lenovo',
    'Apple',
    'Acer',
    'ASUS',
    'MSI',
    'Toshiba',
    'Samsung',
    'Microsoft Surface',
    'Huawei',
    'Razer',
];

/**
 * Product categories and sub-categories. Used for:
 * - Admin product creation (category + subCategory)
 * - Home page category section (browse by sub-category)
 */
export const CATEGORIES = {
    Electronics: [
        'Phones',
        'Laptops',
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
    'Kitchen Appliances': [
        'Fridge',
        'Cooker',
        'Water Dispenser',
        'Blender',
        'Microwave',
        'Air Fryer',
        'Electric Kettle',
        'Toaster',
        'Coffee Maker',
        'Rice Cooker',
        'Oven',
        'Kitchen Hood',
    ],
    Instruments: [
        'Keyboard',
        'Acoustic Guitar',
        'Bass Guitar',
        'Drum Set',
        'Electric Guitar',
        'Violin',
        'Saxophone',
        'Piano',
        'Microphone',
        'Amplifier',
        'DJ Controller',
        'Cymbals',
        'Ukulele',
    ],
};

/** All sub-categories as a flat list for the home page browse section */
export const SUB_CATEGORIES = [
    ...CATEGORIES.Electronics,
    ...CATEGORIES.Furniture,
    ...CATEGORIES['Kitchen Appliances'],
    ...CATEGORIES.Instruments,
];
