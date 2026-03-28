import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/slices/uiSlice.js';
import { logout } from '../redux/slices/authSlice.js';
import { FaShoppingCart, FaUser, FaSearch, FaMoon, FaSun, FaBars, FaTimes } from 'react-icons/fa';
import wemaxLogo from '../assets/wemax-logo.jpg';

const SEARCH_SUGGESTIONS = [
    'Smart TV',
    'Phones',
    'Laptops',
    'Sound systems',
    'Woofers',
    'Furniture',
    'Packages',
];

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
                {/* Logo (left) + search + suggestions + actions — Kilimall-style row on desktop */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 py-3 md:py-4">
                    <div className="flex items-center justify-between gap-3 md:contents">
                        <Link
                            to="/"
                            className="flex items-center gap-2.5 shrink-0 hover:opacity-90 transition-opacity md:mr-1"
                        >
                            <img
                                src={wemaxLogo}
                                alt="Wemax"
                                className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl object-cover"
                            />
                            <div className="flex flex-col leading-tight">
                                <span
                                    style={{ fontFamily: '"Space Grotesk", Inter, system-ui, sans-serif' }}
                                    className={`wemax-brand font-bold text-lg sm:text-xl tracking-[0.12em] uppercase ${
                                        theme === 'dark' ? 'text-gray-50' : 'text-gray-900'
                                    }`}
                                >
                                    WEMAX
                                </span>
                                <span
                                    className={`text-[11px] sm:text-xs font-normal normal-case tracking-normal ${
                                        theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                                    }`}
                                >
                                    Premium online shopping
                                </span>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2 md:hidden">
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
                            {isAuthenticated && (
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
                                        <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            )}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <form onSubmit={handleSearchSubmit} className="min-w-0">
                            <div
                                className={`flex min-w-0 overflow-hidden rounded-md border-2 shadow-sm ${
                                    theme === 'dark' ? 'border-red-500/90 bg-gray-900/80' : 'border-red-600 bg-white'
                                }`}
                            >
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="I'm looking for..."
                                    className={`min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm outline-none sm:px-4 sm:py-3 ${
                                        theme === 'dark'
                                            ? 'text-gray-100 placeholder:text-gray-500'
                                            : 'text-gray-900 placeholder:text-gray-400'
                                    }`}
                                    aria-label="Search products"
                                />
                                <button
                                    type="submit"
                                    className="flex shrink-0 items-center justify-center bg-red-600 px-4 py-2.5 text-white transition-colors hover:bg-red-700 sm:px-5 sm:py-3"
                                    aria-label="Search"
                                >
                                    <FaSearch className="text-base sm:text-lg" />
                                </button>
                            </div>
                        </form>
                        <div
                            className={`hidden flex-wrap gap-x-4 gap-y-1 text-xs sm:flex ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}
                        >
                            {SEARCH_SUGGESTIONS.map((label) => (
                                <Link
                                    key={label}
                                    to={`/products?search=${encodeURIComponent(label)}`}
                                    className={`transition-colors hover:underline ${
                                        theme === 'dark' ? 'hover:text-gray-300' : 'hover:text-gray-800'
                                    }`}
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                        <div
                            className={`flex flex-wrap gap-x-3 gap-y-1 text-[11px] sm:hidden ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}
                        >
                            {SEARCH_SUGGESTIONS.slice(0, 4).map((label) => (
                                <Link
                                    key={label}
                                    to={`/products?search=${encodeURIComponent(label)}`}
                                    className="hover:underline"
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="hidden items-center gap-3 shrink-0 md:flex">
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
                                        <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>

                                <div className="relative group">
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
                                <Link
                                    to="/login"
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Desktop nav links — below logo/search row */}
                <div
                    className={`hidden border-t pb-3 pt-2 md:flex md:flex-wrap md:items-center md:gap-6 ${
                        theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
                    }`}
                >
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
