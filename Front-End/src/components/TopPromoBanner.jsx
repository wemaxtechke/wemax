import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaStar, FaWhatsapp } from 'react-icons/fa';
import { cn } from '../lib/utils.js';

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
    const { theme } = useSelector((state) => state?.ui || { theme: 'light' });
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

            <div className="relative z-10 mx-auto flex w-full min-h-[2.25rem] items-center px-2 py-1 sm:min-h-[3.25rem] sm:px-4 sm:py-2.5 lg:px-8">
                {/* One row on mobile; sm+ can wrap like before */}
                <div className="flex w-full flex-row flex-nowrap items-center gap-1.5 sm:flex-wrap sm:gap-x-4 sm:gap-y-2">
                    {/* Brand — hidden on small screens (navbar already shows WEMAX) */}
                    <div className="hidden shrink-0 items-center gap-1 sm:flex sm:gap-2">
                        <span className="text-xs font-black uppercase tracking-wide text-white drop-shadow-sm sm:text-sm md:text-base">
                            WEMAX
                        </span>
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/90 bg-white/10 sm:h-7 sm:w-7 sm:border-2">
                            <FaStar className="text-[10px] text-white sm:text-xs" />
                        </span>
                    </div>

                    {/* Animated headline — flex-1 + truncate on narrow screens */}
                    <div className="relative flex min-h-0 min-w-0 flex-1 items-center justify-start overflow-hidden sm:min-h-[3rem] sm:max-w-[220px] md:max-w-xs lg:max-w-md">
                        <div
                            key={index}
                            className={`min-w-0 max-w-full sm:max-w-none ${slideUp ? 'animate-promo-march-up' : 'animate-promo-march-down'}`}
                        >
                            <p className="truncate text-left text-[10px] font-black uppercase leading-none tracking-tight text-white drop-shadow-sm sm:w-auto sm:truncate-none sm:text-left sm:text-sm md:text-base">
                                {line.top}
                            </p>
                            <p className="hidden text-[10px] font-semibold uppercase tracking-wide text-white/85 sm:block sm:text-xs">
                                {line.bottom}
                            </p>
                        </div>
                    </div>

                    {/* Discount pill */}
                    <div className="flex shrink-0 items-center rounded-full bg-[var(--color-surface)] px-1.5 py-0.5 shadow-[var(--shadow-sm)] sm:px-3 sm:py-1.5">
                        <span
                            className={cn(
                                'text-[7px] font-bold uppercase sm:text-[10px]',
                                theme === 'dark' ? 'text-white' : 'text-[var(--color-primary)]'
                            )}
                        >
                            Up to
                        </span>
                        <span
                            className={cn(
                                'ml-0.5 text-[9px] font-black sm:text-sm',
                                theme === 'dark' ? 'text-white' : 'text-[var(--color-primary)]'
                            )}
                        >
                            60% OFF
                        </span>
                    </div>

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
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 sm:hidden"
                        aria-label={`WhatsApp ${phoneDisplay}`}
                    >
                        <FaWhatsapp className="text-sm" />
                    </a>
                    <Link
                        to="/products"
                        className={cn(
                            'promo-cta-bounce inline-block shrink-0 bg-[var(--color-surface)] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide shadow-[var(--shadow-md)] sm:ml-auto sm:px-4 sm:py-2 sm:text-xs',
                            theme === 'dark' ? '!text-white' : '!text-[var(--color-primary)]'
                        )}
                    >
                        SHOP NOW
                    </Link>
                </div>
            </div>
        </div>
    );
}
