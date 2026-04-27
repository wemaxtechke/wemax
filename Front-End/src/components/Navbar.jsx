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
            className={`relative z-10 backdrop-blur-md border-b transition-colors duration-300 ${
                theme === 'dark'
                    ? 'bg-gray-950/80 border-gray-800 text-gray-100'
                    : 'bg-white/80 border-gray-200 text-gray-900'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Logo (left) + search + suggestions + actions — Kilimall-style row on desktop */}
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-4 py-3 md:py-4">
                    <div className="flex items-center justify-between gap-2.5 md:contents">
                        <Link
                            to="/"
                            className="flex items-center gap-0 sm:gap-2.5 shrink-0 hover:opacity-90 transition-opacity md:mr-1"
                        >
                            <img
                                src={wemaxLogo}
                                alt="Wemax"
                                className="block h-[1.875rem] w-auto max-w-[8.25rem] shrink-0 object-contain sm:h-[5.25rem] sm:max-w-[15rem] rounded-lg sm:rounded-xl"
                            />
                            <div className="hidden flex-col leading-tight sm:flex">
                                <span
                                    style={{ fontFamily: '"Space Grotesk", Inter, system-ui, sans-serif' }}
                                    className={`wemax-brand font-bold text-base sm:text-lg tracking-[0.12em] uppercase ${
                                        theme === 'dark' ? 'text-gray-50' : 'text-gray-900'
                                    }`}
                                >
                                    WEMAX
                                </span>
                                <span
                                    className={`text-[9px] sm:text-[11px] font-normal normal-case tracking-normal ${
                                        theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                                    }`}
                                >
                                    Premium online shopping
                                </span>
                            </div>
                        </Link>

                        <div className="flex items-center gap-1.5 md:hidden">
                            <button
                                onClick={() => dispatch(toggleTheme())}
                                className={`rounded-full border p-1.5 text-sm ${
                                    theme === 'dark'
                                        ? 'border-gray-700 hover:bg-gray-900'
                                        : 'border-gray-200 hover:bg-gray-100'
                                } transition-colors`}
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? (
                                    <FaSun className="text-[0.84375rem] text-white" />
                                ) : (
                                    <FaMoon className="text-[0.84375rem] text-black" />
                                )}
                            </button>
                            {isAuthenticated && (
                                <Link
                                    to="/cart"
                                    className={`relative rounded-full border p-1.5 ${
                                        theme === 'dark'
                                            ? 'border-gray-700 hover:bg-gray-900'
                                            : 'border-gray-200 hover:bg-gray-100'
                                    } transition-colors`}
                                >
                                    <FaShoppingCart className="text-[0.84375rem]" />
                                    {cartCount > 0 && (
                                        <span className="absolute right-0 top-0 flex h-2.5 min-w-2.5 items-center justify-center rounded-full bg-red-600 px-[2px] text-[7px] font-bold leading-none text-white">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            )}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className={`rounded-lg p-1.5 ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? (
                                    <FaTimes className="text-[0.84375rem]" />
                                ) : (
                                    <FaBars className="text-[0.84375rem]" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                        {/* Search + desktop utilities share one row so icons align with the input bar */}
                        <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:gap-3">
                            <form onSubmit={handleSearchSubmit} className="min-w-0 w-full md:flex-1">
                                <div
                                    className={`flex min-w-0 overflow-hidden rounded-[0.28125rem] border-[1.5px] shadow-sm ${
                                        theme === 'dark' ? 'border-red-500/90 bg-gray-900/80' : 'border-red-600 bg-white'
                                    }`}
                                >
                                    <input
                                        type="search"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="I'm looking for..."
                                        className={`min-w-0 flex-1 border-0 bg-transparent px-[0.5625rem] py-[0.46875rem] text-[0.65625rem] leading-snug outline-none sm:px-3 sm:py-[0.5625rem] ${
                                            theme === 'dark'
                                                ? 'text-gray-100 placeholder:text-gray-500'
                                                : 'text-gray-900 placeholder:text-gray-400'
                                        }`}
                                        aria-label="Search products"
                                    />
                                    <button
                                        type="submit"
                                        className="flex shrink-0 items-center justify-center self-stretch bg-red-600 px-3 py-[0.46875rem] text-white transition-colors hover:bg-red-700 sm:px-[0.9375rem] sm:py-[0.5625rem]"
                                        aria-label="Search"
                                    >
                                        <FaSearch className="text-xs sm:text-[0.84375rem]" />
                                    </button>
                                </div>
                            </form>

                            <div className="hidden shrink-0 items-center gap-3 md:flex">
                                <button
                                    onClick={() => dispatch(toggleTheme())}
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm ${
                                        theme === 'dark'
                                            ? 'border-gray-700 hover:bg-gray-900'
                                            : 'border-gray-200 hover:bg-gray-100'
                                    } transition-colors`}
                                    aria-label="Toggle theme"
                                >
                                    {theme === 'dark' ? <FaSun className="text-lg text-white" /> : <FaMoon className="text-lg text-black" />}
                                </button>

                                {isAuthenticated ? (
                                    <>
                                        <Link
                                            to="/cart"
                                            className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                                                theme === 'dark'
                                                    ? 'border-gray-700 hover:bg-gray-900'
                                                    : 'border-gray-200 hover:bg-gray-100'
                                            } transition-colors`}
                                        >
                                            <FaShoppingCart className="text-lg" />
                                            {cartCount > 0 && (
                                                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                                                    {cartCount}
                                                </span>
                                            )}
                                        </Link>

                                        <div className="relative group">
                                            <button
                                                type="button"
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
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
                                            className={`flex h-[1.875rem] shrink-0 items-center rounded-lg px-2.5 text-[0.8125rem] font-medium transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="flex h-[1.875rem] shrink-0 items-center rounded-lg bg-blue-600 px-2.5 text-[0.8125rem] font-medium text-white transition-colors hover:bg-blue-700"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                        <div
                            className={`hidden w-full flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] sm:flex ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}
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
                            className={`flex w-full flex-wrap justify-center gap-x-2.5 gap-y-1 text-[9px] sm:hidden ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}
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

                {/* Mobile Menu — compact (~50% smaller footprint: type + padding) */}
                {mobileMenuOpen && (
                    <div className={`md:hidden border-t pb-2 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                        {/* Mobile Navigation Links */}
                        <div className="space-y-1 py-2">
                            <Link 
                                to="/" 
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block rounded-md px-2 py-1 text-[10px] font-medium leading-tight ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                            >
                                Home
                            </Link>
                            <Link 
                                to="/products" 
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block rounded-md px-2 py-1 text-[10px] font-medium leading-tight ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                            >
                                Shop
                            </Link>
                            <Link 
                                to="/packages" 
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block rounded-md px-2 py-1 text-[10px] font-medium leading-tight ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                            >
                                Packages
                            </Link>
                            <Link 
                                to="/about" 
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block rounded-md px-2 py-1 text-[10px] font-medium leading-tight ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                            >
                                About
                            </Link>
                            <Link 
                                to="/contact" 
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block rounded-md px-2 py-1 text-[10px] font-medium leading-tight ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                            >
                                Contact
                            </Link>
                        </div>

                        {/* Mobile User Menu */}
                        {isAuthenticated && (
                            <>
                                <div className={`space-y-1 border-t py-2 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                                    <Link 
                                        to="/orders" 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`block rounded-md px-2 py-1 text-[10px] font-medium leading-tight ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                                    >
                                        My Orders
                                    </Link>
                                    <Link 
                                        to="/wishlist" 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`block rounded-md px-2 py-1 text-[10px] font-medium leading-tight ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                                    >
                                        Wishlist
                                    </Link>
                                    {user?.role === 'admin' && (
                                        <Link 
                                            to="/admin" 
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`block rounded-md px-2 py-1 text-[10px] font-medium leading-tight ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                                        >
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <button 
                                        onClick={handleLogout}
                                        className={`w-full rounded-md px-2 py-1 text-left text-[10px] font-medium leading-tight ${theme === 'dark' ? 'hover:bg-gray-800 text-red-400' : 'hover:bg-gray-100 text-red-600'} transition-colors`}
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Mobile Auth Buttons */}
                        {!isAuthenticated && (
                            <div className={`space-y-1 border-t py-2 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                                <Link 
                                    to="/login" 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block rounded-md px-2 py-1 text-center text-[10px] font-medium leading-tight ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/register" 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block rounded-md bg-blue-600 px-2 py-1 text-center text-[10px] font-medium leading-tight text-white transition-colors hover:bg-blue-700"
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
