import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const PROMO_LINES = [
    { top: 'FLASH SALE', bottom: 'Hot deals daily' },
    { top: 'MEGA SPLASH', bottom: 'Premium electronics' },
    { top: 'BUNDLE SAVINGS', bottom: 'Shop smart packages' },
    { top: 'NEW ARRIVALS', bottom: 'Fresh stock in Kenya' },
    { top: 'FAST DELIVERY', bottom: 'Order online today' },
];

const ROTATE_MS = 4200;

const phoneDisplay =
    (typeof import.meta.env.VITE_PROMO_PHONE === 'string' && import.meta.env.VITE_PROMO_PHONE.trim()) ||
    '0711 011 011';

function whatsAppHref(display) {
    const digits = display.replace(/\D/g, '');
    if (digits.length === 10 && digits.startsWith('0')) return `https://wa.me/254${digits.slice(1)}`;
    if (digits.length === 9) return `https://wa.me/254${digits}`;
    if (digits.startsWith('254')) return `https://wa.me/${digits}`;
    return `https://wa.me/${digits}`;
}

export default function TopPromoBanner() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const id = window.setInterval(() => {
            setIndex((i) => (i + 1) % PROMO_LINES.length);
        }, ROTATE_MS);
        return () => window.clearInterval(id);
    }, []);

    const slideUp = index % 2 === 0;
    const line = PROMO_LINES[index];

    return (
        <div
            className="relative w-full overflow-hidden text-white shadow-[var(--shadow-md)]"
            style={{
                background: 'linear-gradient(100deg, var(--color-primary) 0%, var(--color-primary-dark) 55%, var(--color-primary-dark) 100%)',
            }}
        >
            {/* Themed accent wedge (replaces fixed teal) */}
            <div
                className="pointer-events-none absolute inset-y-0 right-0 w-[min(42%,220px)] sm:w-[min(38%,260px)]"
                style={{
                    clipPath: 'polygon(32% 0, 100% 0, 100% 100%, 0 100%)',
                    background:
                        'linear-gradient(145deg, color-mix(in srgb, var(--color-surface) 28%, transparent), color-mix(in srgb, var(--color-text-tertiary) 22%, transparent))',
                }}
                aria-hidden
            />

            <div className="relative z-10 mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 sm:gap-x-4 sm:px-4 sm:py-2.5 lg:px-8">
                {/* Brand — high contrast on primary gradient */}
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                    <span className="text-sm font-black uppercase tracking-wide sm:text-base text-white drop-shadow-sm">WEMAX</span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white/90 bg-white/10 sm:h-7 sm:w-7">
                        <FaStar className="text-[11px] text-white sm:text-xs" />
                    </span>
                </div>

                {/* Animated headline — theme colors (primary + surface from ThemeProvider) */}
                <div className="relative min-h-[2.75rem] min-w-0 flex-1 overflow-hidden rounded-md border border-[var(--color-primary)] bg-[var(--color-surface)] px-2 py-0.5 shadow-[var(--shadow-sm)] sm:min-h-[3rem] sm:max-w-[220px] sm:px-2.5 sm:py-1 md:max-w-xs lg:max-w-md">
                    <div
                        key={index}
                        className={slideUp ? 'animate-promo-march-up' : 'animate-promo-march-down'}
                    >
                        <p
                            className="text-sm font-black uppercase leading-tight tracking-tight sm:text-base"
                            style={{ color: 'var(--color-primary)' }}
                        >
                            {line.top}
                        </p>
                        <p
                            className="text-[10px] font-semibold uppercase tracking-wide sm:text-xs"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            {line.bottom}
                        </p>
                    </div>
                </div>

                {/* Discount pill — surface + primary text */}
                <div className="flex shrink-0 items-center rounded-full bg-[var(--color-surface)] px-2.5 py-1 shadow-[var(--shadow-sm)] sm:px-3 sm:py-1.5">
                    <span
                        className="text-[9px] font-bold uppercase sm:text-[10px]"
                        style={{ color: 'var(--color-primary)' }}
                    >
                        Up to
                    </span>
                    <span
                        className="ml-1 text-xs font-black sm:text-sm"
                        style={{ color: 'var(--color-primary)' }}
                    >
                        60% OFF
                    </span>
                </div>

                {/* Contact — hide on very small screens */}
                <p className="hidden text-[10px] font-medium text-white/95 sm:block sm:text-xs md:text-[13px]">
                    Call / WhatsApp{' '}
                    <a
                        href={whatsAppHref(phoneDisplay)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-white underline decoration-white/70 underline-offset-2 hover:decoration-white"
                    >
                        {phoneDisplay}
                    </a>{' '}
                    to order
                </p>

                <a
                    href={whatsAppHref(phoneDisplay)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="max-w-[7rem] truncate text-center text-[10px] font-semibold text-white/95 underline sm:hidden"
                >
                    WhatsApp
                </a>

                {/* CTA */}
                <div className="ml-auto flex shrink-0 items-center sm:ml-0">
                    <Link
                        to="/products"
                        className="promo-cta-bounce inline-block bg-[var(--color-surface)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide shadow-[var(--shadow-md)] sm:px-4 sm:py-2 sm:text-xs !text-[var(--color-primary)]"
                    >
                        SHOP NOW
                    </Link>
                </div>
            </div>
        </div>
    );
}
