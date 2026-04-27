import { useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { WEMAX_FACEBOOK_PAGE, WEMAX_INSTAGRAM_PAGE, getStoreWhatsAppHref } from '../constants/social.js';

/** Slim fixed bar so social links stay visible while browsing (storefront only). Portaled to body so page layers (blur, z-index) never cover it. */
export default function StickySocialStrip() {
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });

    const bar = (
        <div
            className={`pointer-events-auto fixed inset-x-0 bottom-0 z-[90] flex items-center justify-center gap-2 border-t px-2 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow-[0_-2px_12px_rgba(0,0,0,0.08)] backdrop-blur-md sm:gap-6 sm:px-4 sm:pt-2 sm:pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:shadow-[0_-4px_20px_rgba(0,0,0,0.12)] ${
                theme === 'dark'
                    ? 'border-gray-800 bg-gray-950/95 text-gray-100'
                    : 'border-gray-200 bg-white/95 text-gray-900'
            }`}
            role="region"
            aria-label="Connect with us on social media"
        >
            <span
                className={`hidden shrink-0 text-[10px] font-bold uppercase tracking-wider sm:inline sm:text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
            >
                Connect with us
            </span>
            <div className="flex items-center gap-3 sm:gap-5">
                <a
                    href={WEMAX_FACEBOOK_PAGE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-sm transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2] focus-visible:ring-offset-1 sm:h-9 sm:w-9 sm:shadow-md sm:focus-visible:ring-offset-2"
                    aria-label="Facebook"
                >
                    <FaFacebook className="text-sm sm:text-lg" />
                </a>
                <a
                    href={WEMAX_INSTAGRAM_PAGE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] text-white shadow-sm transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-1 sm:h-9 sm:w-9 sm:shadow-md sm:focus-visible:ring-offset-2"
                    aria-label="Instagram"
                >
                    <FaInstagram className="text-sm sm:text-lg" />
                </a>
                <a
                    href={getStoreWhatsAppHref()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-1 sm:h-9 sm:w-9 sm:shadow-md sm:focus-visible:ring-offset-2"
                    aria-label="WhatsApp"
                >
                    <FaWhatsapp className="text-sm sm:text-lg" />
                </a>
            </div>
        </div>
    );

    if (typeof document === 'undefined') return null;
    return createPortal(bar, document.body);
}
