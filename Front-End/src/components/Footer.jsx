import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Footer() {
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });

    return (
        <footer
            className={`border-t transition-colors duration-300 ${
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
