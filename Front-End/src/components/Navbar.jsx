import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/slices/uiSlice.js';
import { logout } from '../redux/slices/authSlice.js';
import { FaShoppingCart, FaUser, FaSearch, FaMoon, FaSun, FaBars, FaTimes } from 'react-icons/fa';
import wemaxLogo from '../assets/wemax-logo.jpg';

export default function Navbar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });
    const { isAuthenticated = false, user = null } = useSelector((state) => state?.auth || {});
    const { items = [], packages = [] } = useSelector((state) => state?.cart || {});
    const cartCount = (items?.length || 0) + (packages?.length || 0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (e) => {
        e?.preventDefault();
        const q = searchQuery?.trim();
        if (q) {
            navigate(`/products?search=${encodeURIComponent(q)}`);
            setSearchQuery('');
            setMobileMenuOpen(false);
        } else {
            navigate('/products');
            setMobileMenuOpen(false);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        setMobileMenuOpen(false);
    };

    return (
        <nav
            className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
                theme === 'dark'
                    ? 'bg-gray-950/80 border-gray-800 text-gray-100'
                    : 'bg-white/80 border-gray-200 text-gray-900'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
                    >
                        <img
                            src={wemaxLogo}
                            alt="Wemax"
                            className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl"
                        />
                        <span
                            style={{ fontFamily: '"Space Grotesk", Inter, system-ui, sans-serif' }}
                            className={`wemax-brand font-bold text-base sm:text-xl tracking-[0.16em] uppercase ${
                                theme === 'dark' ? 'text-gray-50' : 'text-gray-900'
                            }`}
                        >
                            WEMAX
                        </span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-6">
                        {[
                            { to: '/', label: 'Home' },
                            { to: '/products', label: 'Shop' },
                            { to: '/packages', label: 'Packages' },
                            { to: '/about', label: 'About' },
                            { to: '/contact', label: 'Contact' },
                        ].map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`text-sm font-medium transition-colors ${
                                    theme === 'dark'
                                        ? 'text-gray-300 hover:text-white'
                                        : 'text-gray-700 hover:text-gray-900'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={() => dispatch(toggleTheme())}
                            className={`p-2 rounded-full border text-sm ${
                                theme === 'dark'
                                    ? 'border-gray-700 hover:bg-gray-900'
                                    : 'border-gray-200 hover:bg-gray-100'
                            } transition-colors`}
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <FaSun className="text-lg text-yellow-400" /> : <FaMoon className="text-lg text-blue-600" />}
                        </button>

                        {isAuthenticated ? (
                            <>
                                {/* Cart Link */}
                                <Link 
                                    to="/cart" 
                                    className={`relative p-2 rounded-full border ${
                                        theme === 'dark'
                                            ? 'border-gray-700 hover:bg-gray-900'
                                            : 'border-gray-200 hover:bg-gray-100'
                                    } transition-colors`}
                                >
                                    <FaShoppingCart className="text-lg" />
                                    {cartCount > 0 && (
                                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>

                                {/* User Menu Dropdown - Desktop */}
                                <div className="hidden md:block relative group">
                                    <button
                                        className={`p-2 rounded-full border ${
                                            theme === 'dark'
                                                ? 'border-gray-700 group-hover:bg-gray-900'
                                                : 'border-gray-200 group-hover:bg-gray-100'
                                        } transition-colors`}
                                    >
                                        <FaUser className="text-lg" />
                                    </button>
                                    <div className={`absolute right-0 mt-0 w-48 rounded-lg shadow-lg py-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300`}>
                                        <Link 
                                            to="/orders" 
                                            className={`block px-4 py-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                                        >
                                            My Orders
                                        </Link>
                                        <Link 
                                            to="/wishlist" 
                                            className={`block px-4 py-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                                        >
                                            Wishlist
                                        </Link>
                                        {user?.role === 'admin' && (
                                            <Link 
                                                to="/admin" 
                                                className={`block px-4 py-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                                            >
                                                Admin Dashboard
                                            </Link>
                                        )}
                                        <button 
                                            onClick={handleLogout}
                                            className={`w-full text-left px-4 py-2 ${theme === 'dark' ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'} transition-colors`}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Login Button - Desktop Only */}
                                <Link 
                                    to="/login" 
                                    className={`hidden md:block px-4 py-2 rounded-lg font-medium transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                                >
                                    Login
                                </Link>

                                {/* Register Button - Desktop Only */}
                                <Link 
                                    to="/register" 
                                    className="hidden md:block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-grey-600 rounded-lg font-medium transition-colors"
                                >
                                    Register
                                </Link>
                            </>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={`md:hidden p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
                        </button>
                    </div>
                </div>

                {/* Search bar - full width below nav, responsive */}
                <form onSubmit={handleSearchSubmit} className="pb-3 sm:pb-4">
                    <div className="flex rounded-lg sm:rounded-xl overflow-hidden border border-blue-500 shadow-sm min-w-0">
                        <div className={`flex-1 flex items-center gap-2 pl-3 pr-2 py-2 sm:pl-4 sm:pr-3 sm:py-3 min-w-0 ${
                            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                        }`}>
                            <FaSearch className={`shrink-0 text-base sm:text-lg ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search products, brands and categories"
                                className={`flex-1 min-w-0 bg-transparent text-sm outline-none ${
                                    theme === 'dark'
                                        ? 'text-gray-100 placeholder-gray-500'
                                        : 'text-gray-900 placeholder-gray-400'
                                }`}
                                aria-label="Search products, brands and categories"
                            />
                        </div>
                        <button
                            type="submit"
                            className={`px-4 py-2 sm:px-6 sm:py-3 font-semibold text-xs sm:text-sm transition-colors shadow-md shrink-0 ${
                                theme === 'dark'
                                    ? 'bg-gray-700 hover:bg-gray-600 text-white border-l border-gray-600'
                                    : 'bg-gray-800 hover:bg-gray-700 text-white border-l border-gray-200'
                            }`}
                        >
                            Search
                        </button>
                    </div>
                </form>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className={`md:hidden pb-4 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                        {/* Mobile Navigation Links */}
                        <div className="space-y-2 py-4">
                            <Link 
                                to="/" 
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors font-medium`}
                            >
                                Home
                            </Link>
                            <Link 
                                to="/products" 
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors font-medium`}
                            >
                                Shop
                            </Link>
                            <Link 
                                to="/packages" 
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors font-medium`}
                            >
                                Packages
                            </Link>
                            <Link 
                                to="/about" 
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors font-medium`}
                            >
                                About
                            </Link>
                            <Link 
                                to="/contact" 
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors font-medium`}
                            >
                                Contact
                            </Link>
                        </div>

                        {/* Mobile User Menu */}
                        {isAuthenticated && (
                            <>
                                <div className={`border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} my-4 py-4 space-y-2`}>
                                    <Link 
                                        to="/orders" 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`block px-4 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                                    >
                                        My Orders
                                    </Link>
                                    <Link 
                                        to="/wishlist" 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`block px-4 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                                    >
                                        Wishlist
                                    </Link>
                                    {user?.role === 'admin' && (
                                        <Link 
                                            to="/admin" 
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`block px-4 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                                        >
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <button 
                                        onClick={handleLogout}
                                        className={`w-full text-left px-4 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800 text-red-400' : 'hover:bg-gray-100 text-red-600'} transition-colors`}
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Mobile Auth Buttons */}
                        {!isAuthenticated && (
                            <div className={`border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} my-4 py-4 space-y-2`}>
                                <Link 
                                    to="/login" 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-4 py-2 rounded-lg text-center font-medium ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/register" 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-center"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
