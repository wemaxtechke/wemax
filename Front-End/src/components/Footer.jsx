import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Footer() {
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });

    return (
        <footer
            className={`border-t pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] sm:pb-[calc(3.25rem+env(safe-area-inset-bottom,0px))] transition-colors duration-300 ${
                theme === 'dark'
                    ? 'bg-gray-950 text-gray-100 border-gray-800'
                    : 'bg-white text-gray-900 border-gray-200'
            }`}
        >
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-6 flex flex-col gap-6 lg:grid lg:grid-cols-4 lg:gap-6">
                    {/* Company Info — centered two rows below lg; left-aligned in grid column from lg */}
                    <div className="flex flex-col items-center gap-2 text-center sm:gap-2.5 lg:items-start lg:space-y-3 lg:text-left">
                        <h3
                            className={`text-sm font-semibold tracking-tight sm:text-base md:text-lg ${
                                theme === 'dark' ? 'text-gray-50' : 'text-gray-900'
                            }`}
                        >
                            WEMAX TECH
                        </h3>
                        <p
                            className={`max-w-md leading-snug sm:leading-relaxed ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            } text-[11px] sm:text-xs lg:max-w-none`}
                        >
                            Premium electronics and furniture for a smarter life.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:contents">
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
