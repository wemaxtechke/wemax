/** Official WEMAX social profiles (footer, “connect with us”) */
export const WEMAX_FACEBOOK_PAGE = 'https://www.facebook.com/profile.php?id=61575476489474';
export const WEMAX_INSTAGRAM_PAGE = 'https://www.instagram.com/wemax_tech';

const phoneDisplay =
    (typeof import.meta.env.VITE_PROMO_PHONE === 'string' && import.meta.env.VITE_PROMO_PHONE.trim()) ||
    '0711 011 011';

function whatsAppDigits(display) {
    const digits = display.replace(/\D/g, '');
    if (digits.length === 10 && digits.startsWith('0')) return `254${digits.slice(1)}`;
    if (digits.length === 9) return `254${digits}`;
    if (digits.startsWith('254')) return digits;
    return digits;
}

/** Customer care / store WhatsApp (same as promo banner when env is set) */
export function getStoreWhatsAppHref() {
    return `https://wa.me/${whatsAppDigits(phoneDisplay)}`;
}
