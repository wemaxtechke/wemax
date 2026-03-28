import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { WEMAX_FACEBOOK_PAGE, WEMAX_INSTAGRAM_PAGE, getStoreWhatsAppHref } from '../constants/social.js';

export default function Footer() {
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });

    return (
        <footer
            className={`border-t pb-[calc(3.25rem+env(safe-area-inset-bottom,0px))] transition-colors duration-300 ${
                theme === 'dark'
                    ? 'bg-gray-950 text-gray-100 border-gray-800'
                    : 'bg-white text-gray-900 border-gray-200'
            }`}
        >
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                    {/* Company Info */}
                    <div className="space-y-3">
                        <h3
                            className={`text-sm sm:text-base md:text-lg font-semibold tracking-tight ${
                                theme === 'dark' ? 'text-gray-50' : 'text-gray-900'
                            }`}
                        >
                            WEMAX TECH
                        </h3>
                        <p
                            className={`${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            } leading-relaxed text-[11px] sm:text-xs`}
                        >
                            Premium electronics and furniture for a smarter life.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-3">
                        <h4
                            className={`text-xs sm:text-sm md:text-base font-semibold ${
                                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                            }`}
                        >
                            Quick Links
                        </h4>
                        <nav className="space-y-2">
                            <Link
                                to="/"
                                className={`block ${
                                    theme === 'dark'
                                        ? 'text-gray-400 hover:text-blue-400'
                                        : 'text-gray-600 hover:text-blue-600'
                                } transition-colors font-medium text-[11px] sm:text-xs md:text-sm`}
                            >
                                Home
                            </Link>
                            <Link
                                to="/products"
                                className={`block ${
                                    theme === 'dark'
                                        ? 'text-gray-400 hover:text-blue-400'
                                        : 'text-gray-600 hover:text-blue-600'
                                } transition-colors font-medium text-[11px] sm:text-xs md:text-sm`}
                            >
                                Products
                            </Link>
                            <Link
                                to="/packages"
                                className={`block ${
                                    theme === 'dark'
                                        ? 'text-gray-400 hover:text-blue-400'
                                        : 'text-gray-600 hover:text-blue-600'
                                } transition-colors font-medium text-[11px] sm:text-xs md:text-sm`}
                            >
                                Packages
                            </Link>
                            <Link
                                to="/about"
                                className={`block ${
                                    theme === 'dark'
                                        ? 'text-gray-400 hover:text-blue-400'
                                        : 'text-gray-600 hover:text-blue-600'
                                } transition-colors font-medium text-[11px] sm:text-xs md:text-sm`}
                            >
                                About
                            </Link>
                        </nav>
                    </div>

                    {/* Support */}
                    <div className="space-y-3">
                        <h4
                            className={`text-xs sm:text-sm md:text-base font-semibold ${
                                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                            }`}
                        >
                            Support
                        </h4>
                        <nav className="space-y-2">
                            <Link
                                to="/contact"
                                className={`block ${
                                    theme === 'dark'
                                        ? 'text-gray-400 hover:text-blue-400'
                                        : 'text-gray-600 hover:text-blue-600'
                                } transition-colors font-medium text-[11px] sm:text-xs md:text-sm`}
                            >
                                Contact
                            </Link>
                            <Link
                                to="/shipping"
                                className={`block ${
                                    theme === 'dark'
                                        ? 'text-gray-400 hover:text-blue-400'
                                        : 'text-gray-600 hover:text-blue-600'
                                } transition-colors font-medium text-[11px] sm:text-xs md:text-sm`}
                            >
                                Shipping
                            </Link>
                            <Link
                                to="/returns"
                                className={`block ${
                                    theme === 'dark'
                                        ? 'text-gray-400 hover:text-blue-400'
                                        : 'text-gray-600 hover:text-blue-600'
                                } transition-colors font-medium text-[11px] sm:text-xs md:text-sm`}
                            >
                                Returns
                            </Link>
                        </nav>
                    </div>

                    {/* Legal */}
                    <div className="space-y-3">
                        <h4
                            className={`text-xs sm:text-sm md:text-base font-semibold ${
                                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                            }`}
                        >
                            Legal
                        </h4>
                        <nav className="space-y-2">
                            <Link
                                to="/privacy"
                                className={`block ${
                                    theme === 'dark'
                                        ? 'text-gray-400 hover:text-blue-400'
                                        : 'text-gray-600 hover:text-blue-600'
                                } transition-colors font-medium text-[11px] sm:text-xs md:text-sm`}
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                to="/terms"
                                className={`block ${
                                    theme === 'dark'
                                        ? 'text-gray-400 hover:text-blue-400'
                                        : 'text-gray-600 hover:text-blue-600'
                                } transition-colors font-medium text-[11px] sm:text-xs md:text-sm`}
                            >
                                Terms of Service
                            </Link>
                        </nav>
                    </div>
                </div>

                {/* Join us on — visible on every page (storefront footer) */}
                <div
                    className={`mb-6 rounded-2xl border px-4 py-6 sm:px-6 sm:py-8 ${
                        theme === 'dark'
                            ? 'border-gray-800 bg-gray-900/80'
                            : 'border-gray-200 bg-gray-50'
                    }`}
                >
                    <h2
                        className={`text-center text-sm font-bold uppercase tracking-[0.14em] sm:text-base ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                    >
                        Join us on
                    </h2>
                    <p
                        className={`mx-auto mt-1 max-w-md text-center text-[11px] sm:text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}
                    >
                        Follow WEMAX on Facebook and Instagram. Message us on WhatsApp.
                    </p>
                    <div className="mt-5 flex flex-wrap items-start justify-center gap-8 sm:gap-10">
                        <a
                            href={WEMAX_FACEBOOK_PAGE}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2] focus-visible:ring-offset-2 rounded-xl"
                            aria-label="WEMAX on Facebook"
                        >
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-lg ring-2 ring-[#1877F2]/30 transition group-hover:scale-105 sm:h-14 sm:w-14">
                                <FaFacebook className="text-2xl sm:text-[1.75rem]" />
                            </span>
                            <span
                                className={`text-xs font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                            >
                                Facebook
                            </span>
                        </a>
                        <a
                            href={WEMAX_INSTAGRAM_PAGE}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 rounded-xl"
                            aria-label="WEMAX on Instagram"
                        >
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] text-white shadow-lg ring-2 ring-pink-500/25 transition group-hover:scale-105 sm:h-14 sm:w-14">
                                <FaInstagram className="text-2xl sm:text-[1.75rem]" />
                            </span>
                            <span
                                className={`text-xs font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                            >
                                Instagram
                            </span>
                        </a>
                        <a
                            href={getStoreWhatsAppHref()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 rounded-xl"
                            aria-label="Chat on WhatsApp"
                        >
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-2 ring-[#25D366]/30 transition group-hover:scale-105 sm:h-14 sm:w-14">
                                <FaWhatsapp className="text-2xl sm:text-[1.75rem]" />
                            </span>
                            <span
                                className={`text-xs font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                            >
                                WhatsApp
                            </span>
                        </a>
                    </div>
                </div>

                {/* Divider */}
                <div className={`border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}></div>

                {/* Bottom Section */}
                <div className="pt-4">
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs text-center`}>
                        &copy; {new Date().getFullYear()} Wemax Tech. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
