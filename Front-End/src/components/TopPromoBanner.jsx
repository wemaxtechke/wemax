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
        <div className="relative w-full overflow-hidden bg-[#FF9900] text-white shadow-[0_2px_12px_rgba(0,0,0,0.12)]">
            <div
                className="pointer-events-none absolute inset-y-0 right-0 w-[min(42%,220px)] bg-[#99D6D1] sm:w-[min(38%,260px)]"
                style={{
                    clipPath: 'polygon(32% 0, 100% 0, 100% 100%, 0 100%)',
                }}
                aria-hidden
            />

            <div className="relative z-10 mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 sm:gap-x-4 sm:px-4 sm:py-2.5 lg:px-8">
                {/* Brand */}
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                    <span className="text-sm font-black uppercase tracking-wide sm:text-base">WEMAX</span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white/90 bg-white/10 sm:h-7 sm:w-7">
                        <FaStar className="text-[11px] text-white sm:text-xs" />
                    </span>
                </div>

                {/* Animated headline — scroll up / down + bounce settle */}
                <div className="relative min-h-[2.75rem] min-w-0 flex-1 overflow-hidden sm:min-h-[3rem] sm:max-w-[220px] md:max-w-xs lg:max-w-md">
                    <div
                        key={index}
                        className={slideUp ? 'animate-promo-march-up' : 'animate-promo-march-down'}
                    >
                        <p className="text-sm font-black uppercase leading-tight tracking-tight sm:text-base">
                            {line.top}
                        </p>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-white/90 sm:text-xs">
                            {line.bottom}
                        </p>
                    </div>
                </div>

                {/* Discount pill */}
                <div className="flex shrink-0 items-center rounded-full bg-white px-2.5 py-1 shadow-sm sm:px-3 sm:py-1.5">
                    <span className="text-[9px] font-bold uppercase text-[#FF9900] sm:text-[10px]">Up to</span>
                    <span className="ml-1 text-xs font-black text-[#FF9900] sm:text-sm">60% OFF</span>
                </div>

                {/* Contact — hide on very small screens */}
                <p className="hidden text-[10px] font-medium text-white/95 sm:block sm:text-xs md:text-[13px]">
                    Call / WhatsApp{' '}
                    <a
                        href={whatsAppHref(phoneDisplay)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold underline decoration-white/70 underline-offset-2 hover:decoration-white"
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
                        className="promo-cta-bounce inline-block bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide !text-[#FF6600] shadow-md sm:px-4 sm:py-2 sm:text-xs"
                    >
                        SHOP NOW
                    </Link>
                </div>
            </div>
        </div>
    );
}
