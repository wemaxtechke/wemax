import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import wemaxLogo from '../assets/wemax-logo.jpg';
import { FaShoppingCart, FaStar, FaClock, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import api from '../utils/api.js';
import { SUB_CATEGORIES, PHONE_BRANDS } from '../constants/categories.js';

export default function Home() {
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [categoriesOpen, setCategoriesOpen] = useState(false);
    const [phonesExpanded, setPhonesExpanded] = useState(false);
    const [flashSaleProducts, setFlashSaleProducts] = useState([]);
    const [flashSaleLoading, setFlashSaleLoading] = useState(true);
    const [electronicsBundles, setElectronicsBundles] = useState([]);
    const [electronicsBundlesLoading, setElectronicsBundlesLoading] = useState(true);
    const [furnitureBundles, setFurnitureBundles] = useState([]);
    const [furnitureBundlesLoading, setFurnitureBundlesLoading] = useState(true);

    // Fetch flash sale products
    useEffect(() => {
        const loadFlashSaleProducts = async () => {
            setFlashSaleLoading(true);
            try {
                const response = await api.get('/products', { params: { flashDeal: 'true', limit: 8 } });
                setFlashSaleProducts(response.data.products || []);
            } catch (error) {
                console.error('Failed to load flash sale products:', error);
            } finally {
                setFlashSaleLoading(false);
            }
        };
        loadFlashSaleProducts();
    }, []);

    // Fetch electronics bundle packages (first section after flash sale)
    useEffect(() => {
        const loadElectronicsBundles = async () => {
            setElectronicsBundlesLoading(true);
            try {
                // Primary: match electronics-related category (aligns with sidebar naming)
                const primary = await api.get('/packages', {
                    params: { category: 'Premium Electronics', limit: 8, sort: '-createdAt' },
                });
                let packages = primary.data.packages || [];

                // Fallback: if none are categorized, try searching by keyword
                if (packages.length === 0) {
                    const fallback = await api.get('/packages', {
                        params: { search: 'electronics', limit: 8, sort: '-createdAt' },
                    });
                    packages = fallback.data.packages || [];
                }

                setElectronicsBundles(packages);
            } catch (error) {
                console.error('Failed to load electronics bundle packages:', error);
            } finally {
                setElectronicsBundlesLoading(false);
            }
        };
        loadElectronicsBundles();
    }, []);

    // Fetch furniture bundle packages (replaces "Just For You")
    useEffect(() => {
        const loadFurnitureBundles = async () => {
            setFurnitureBundlesLoading(true);
            try {
                // Primary: match your sidebar category name exactly
                const primary = await api.get('/packages', {
                    params: { category: 'Designer Furniture', limit: 8, sort: '-createdAt' },
                });
                let packages = primary.data.packages || [];

                // Fallback: if none are categorized, try searching by keyword
                if (packages.length === 0) {
                    const fallback = await api.get('/packages', {
                        params: { search: 'furniture', limit: 8, sort: '-createdAt' },
                    });
                    packages = fallback.data.packages || [];
                }

                setFurnitureBundles(packages);
            } catch (error) {
                console.error('Failed to load furniture bundle packages:', error);
            } finally {
                setFurnitureBundlesLoading(false);
            }
        };
        loadFurnitureBundles();
    }, []);

    // Fetch flash sale remaining time from backend
    useEffect(() => {
        const loadTimerSettings = async () => {
            try {
                const response = await api.get('/flash-sale/remaining');
                const settings = response.data;
                if (settings.isActive) {
                    setTimeLeft({
                        hours: settings.hours || 0,
                        minutes: settings.minutes || 0,
                        seconds: settings.seconds || 0,
                    });
                }
            } catch (error) {
                console.error('Failed to load flash sale timer:', error);
            }
        };
        loadTimerSettings();
    }, []);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                const { hours, minutes, seconds } = prev;

                // If already at zero, keep it there
                if (hours === 0 && minutes === 0 && seconds === 0) {
                    return prev;
                }

                let nextHours = hours;
                let nextMinutes = minutes;
                let nextSeconds = seconds - 1;

                if (nextSeconds < 0) {
                    nextSeconds = 59;
                    nextMinutes -= 1;
                }
                if (nextMinutes < 0) {
                    nextMinutes = 59;
                    nextHours -= 1;
                }

                if (nextHours < 0) {
                    // Clamp at zero instead of resetting
                    return { hours: 0, minutes: 0, seconds: 0 };
                }

                return { hours: nextHours, minutes: nextMinutes, seconds: nextSeconds };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const categories = SUB_CATEGORIES.map((name) => ({ name }));

    return (
        <div className={`w-full min-h-screen ${theme === 'dark' ? 'bg-gray-950/85' : 'bg-white/80'}`}>
            {/* Main Container */}
            <div className="max-w-7xl mx-auto">
                {/* Categories Section - Mobile Dropdown */}
                <div className="md:hidden px-3 py-3">
                    <button
                        onClick={() => setCategoriesOpen(!categoriesOpen)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-sm font-medium tracking-wide ${
                            theme === 'dark'
                                ? 'bg-gray-950/80 border-gray-800 text-gray-100'
                                : 'bg-white/80 border-gray-200 text-gray-900'
                        } shadow-[0_12px_30px_rgba(15,23,42,0.35)] backdrop-blur`}
                        aria-expanded={categoriesOpen}
                        aria-controls="mobile-categories"
                    >
                        <span className="flex flex-col items-start">
                            <span className="uppercase text-[10px] tracking-[0.18em] opacity-70">
                                Browse
                            </span>
                            <span>All Categories</span>
                        </span>
                        <FaChevronDown
                            className={`transition-transform duration-300 ${
                                categoriesOpen ? 'rotate-180' : ''
                            }`}
                        />
                    </button>

                    <div
                        id="mobile-categories"
                        className={`origin-top transition-all duration-300 ease-out overflow-hidden ${
                            categoriesOpen ? 'mt-2 max-h-[320px] opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-95'
                        }`}
                    >
                        <div
                            className={`rounded-2xl overflow-hidden border ${
                                theme === 'dark'
                                    ? 'bg-gray-950/95 border-gray-800 divide-gray-800'
                                    : 'bg-white border-gray-200 divide-gray-100'
                            } shadow-[0_18px_45px_rgba(15,23,42,0.45)] backdrop-blur divide-y max-h-[320px] overflow-y-auto`}
                        >
                            {categories.map((category) =>
                                category.name === 'Phones' ? (
                                    <div key={category.name}>
                                        <button
                                            type="button"
                                            onClick={() => setPhonesExpanded(!phonesExpanded)}
                                            className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                                                theme === 'dark'
                                                    ? 'hover:bg-gray-900/80 text-gray-100'
                                                    : 'hover:bg-gray-50 text-gray-900'
                                            }`}
                                        >
                                            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                                Phones
                                            </span>
                                            <FaChevronDown
                                                className={`text-[11px] transition-transform ${phonesExpanded ? 'rotate-180' : ''} ${
                                                    theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                                                }`}
                                            />
                                        </button>
                                        {phonesExpanded && (
                                            <div className={`border-l-2 ml-4 pl-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                                <Link
                                                    to="/products?subCategory=Phones"
                                                    onClick={() => { setCategoriesOpen(false); setPhonesExpanded(false); }}
                                                    className={`block px-4 py-2 text-sm font-medium ${
                                                        theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    All Phones
                                                </Link>
                                                {PHONE_BRANDS.map((brand) => (
                                                    <Link
                                                        key={brand}
                                                        to={`/products?subCategory=Phones&brand=${encodeURIComponent(brand)}`}
                                                        onClick={() => { setCategoriesOpen(false); setPhonesExpanded(false); }}
                                                        className={`block px-4 py-2 text-sm ${
                                                            theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {brand}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        key={category.name}
                                        to={`/products?subCategory=${encodeURIComponent(category.name)}`}
                                        onClick={() => setCategoriesOpen(false)}
                                        className={`flex items-center justify-between px-4 py-3 transition-colors ${
                                            theme === 'dark'
                                                ? 'hover:bg-gray-900/80 text-gray-100'
                                                : 'hover:bg-gray-50 text-gray-900'
                                        }`}
                                    >
                                        <span
                                            className={`text-sm font-medium ${
                                                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                                            }`}
                                        >
                                            {category.name}
                                        </span>
                                        <FaChevronRight
                                            className={`text-[11px] ${
                                                theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                                            }`}
                                        />
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid gap-2 grid-cols-1 md:grid-cols-4 gap-0 md:gap-6 px-3 md:px-6 py-4 md:py-8">
                    {/* Sidebar - Categories (Desktop Only) - height matches hero, scrollable list */}
                    <div className="hidden md:block md:col-span-1">
                        <div className={`rounded-2xl overflow-hidden border flex flex-col max-h-[460px] ${theme === 'dark' ? 'border-gray-800 bg-gray-950/60' : 'border-gray-200 bg-white/70'} shadow-[0_18px_45px_rgba(0,0,0,0.25)] backdrop-blur`}>
                            <div className={`shrink-0 ${theme === 'dark' ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-gradient-to-r from-slate-100 to-slate-200'} px-4 py-4 font-semibold flex items-center justify-between`}>
                                <span className="flex items-center gap-2 text-sm">
                                    <span className="uppercase text-[10px] tracking-[0.18em] opacity-70">
                                        Browse
                                    </span>
                                    <span>Premium Categories</span>
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.18em] opacity-70">
                                    Curated Picks
                                </span>
                            </div>
                            <div className={`divide-y min-h-0 flex-1 overflow-y-auto ${theme === 'dark' ? 'divide-gray-800' : 'divide-gray-100'}`}>
                                {categories.map((category) =>
                                    category.name === 'Phones' ? (
                                        <div
                                            key={category.name}
                                            className={`group relative ${theme === 'dark' ? 'hover:bg-gray-900/80' : 'hover:bg-gray-50'}`}
                                        >
                                            <div
                                                className={`flex items-center justify-between px-4 py-3 transition-colors cursor-pointer ${
                                                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                                                }`}
                                            >
                                                <span className="text-sm font-medium">Phones</span>
                                                <FaChevronRight
                                                    className={`text-xs shrink-0 transition-transform group-hover:translate-x-0.5 ${
                                                        theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                                                    }`}
                                                />
                                            </div>
                                            <div
                                                className={`absolute left-0 top-full mt-1 min-w-[180px] py-2 rounded-lg shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${
                                                    theme === 'dark'
                                                        ? 'bg-gray-900 border-gray-700'
                                                        : 'bg-white border-gray-200'
                                                }`}
                                            >
                                                <Link
                                                    to="/products?subCategory=Phones"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className={`block px-4 py-2 text-sm font-medium rounded-t-lg ${
                                                        theme === 'dark'
                                                            ? 'text-gray-200 hover:bg-gray-800'
                                                            : 'text-gray-900 hover:bg-blue-50'
                                                    }`}
                                                >
                                                    All Phones
                                                </Link>
                                                {PHONE_BRANDS.map((brand) => (
                                                    <Link
                                                        key={brand}
                                                        to={`/products?subCategory=Phones&brand=${encodeURIComponent(brand)}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className={`block px-4 py-2 text-sm last:rounded-b-lg ${
                                                            theme === 'dark'
                                                                ? 'text-gray-200 hover:bg-gray-700'
                                                                : 'text-gray-700 hover:bg-blue-50'
                                                        }`}
                                                    >
                                                        {brand}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <Link
                                            key={category.name}
                                            to={`/products?subCategory=${encodeURIComponent(category.name)}`}
                                            className={`flex items-center justify-between px-4 py-3 transition-colors ${
                                                theme === 'dark' ? 'hover:bg-gray-900/80' : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <span
                                                className={`text-sm font-medium ${
                                                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                                                }`}
                                            >
                                                {category.name}
                                            </span>
                                            <FaChevronRight
                                                className={`text-xs shrink-0 ${
                                                    theme === 'dark'
                                                        ? 'text-gray-600'
                                                        : 'text-gray-400'
                                                }`}
                                            />
                                        </Link>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="md:col-span-3 space-y-6 md:space-y-8">
                        {/* Hero Banner */}
                        <div className={`relative overflow-hidden rounded-3xl shadow-[0_28px_80px_rgba(15,23,42,0.6)] border min-h-[460px] ${theme === 'dark' ? 'border-slate-800 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900' : 'border-slate-200 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50'}`}>
                            {/* Glow Orbs */}
                            <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
                            <div className="pointer-events-none absolute right-0 -bottom-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

                            <div className="relative px-6 md:px-10 py-8 md:py-10">
                                {/* Copy */}
                                <div className="max-w-3xl space-y-4 md:space-y-5">
                                    <p
                                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] backdrop-blur ring-1 ${
                                            theme === 'dark'
                                                ? 'bg-black/20 text-white/80 ring-white/20'
                                                : 'bg-white/85 text-slate-900 ring-slate-200'
                                        }`}
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        Limited Time Event
                                        <span className="hidden sm:inline opacity-60">Premium Electronics & Furniture</span>
                                    </p>
                                    <h1
                                        className={`text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight ${
                                            theme === 'dark' ? 'text-white' : 'text-slate-900'
                                        }`}
                                    >
                                        Elevate your space with
                                        <span
                                            className={`block bg-gradient-to-r bg-clip-text text-transparent ${
                                                theme === 'dark'
                                                    ? 'from-amber-300 via-white to-sky-300'
                                                    : 'from-slate-900 via-slate-700 to-slate-900'
                                            }`}
                                        >
                                            curated, premium tech & comfort
                                        </span>
                                    </h1>
                                    <p
                                        className={`text-sm md:text-base max-w-lg ${
                                            theme === 'dark' ? 'text-slate-200/85' : 'text-slate-600'
                                        }`}
                                    >
                                        Discover expertly selected electronics and furniture sets designed to look and feel premium — whether you&apos;re building a dream workspace or a cinematic living room.
                                    </p>

                                    <div className="flex flex-wrap items-center gap-3 md:gap-4 pt-1">
                                        <Link
                                            to="/products"
                                            className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm md:text-base font-semibold text-slate-900 shadow-[0_18px_38px_rgba(251,191,36,0.35)] hover:bg-amber-300 hover:shadow-[0_18px_38px_rgba(251,191,36,0.55)] transition-all"
                                        >
                                            Shop Premium Deals
                                            <FaChevronRight className="text-xs" />
                                        </Link>
                                        <Link
                                            to="/packages"
                                            className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs md:text-sm font-medium border ${theme === 'dark' ? 'border-slate-600/80 bg-black/30 text-slate-100 hover:bg-black/50' : 'border-slate-300 bg-white/80 text-slate-900 hover:bg-white'} backdrop-blur transition-all`}
                                        >
                                            Explore Room Packages
                                        </Link>
                                    </div>

                                    {/* Hero Meta */}
                                    <div
                                        className={`flex flex-wrap items-center gap-4 pt-4 text-[11px] md:text-xs ${
                                            theme === 'dark' ? 'text-slate-200/80' : 'text-slate-500'
                                        }`}
                                    >
                                        <div className="inline-flex items-center gap-2">
                                            <span className="h-5 w-5 rounded-full bg-emerald-400/10 flex items-center justify-center text-[10px]">
                                                ✓
                                            </span>
                                            2-year warranty on select items
                                        </div>
                                        <div className="inline-flex items-center gap-2">
                                            <span className="h-5 w-5 rounded-full bg-sky-400/10 flex items-center justify-center text-[10px]">
                                                ⚡
                                            </span>
                                            Same-day delivery in Nairobi
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Flash Sales Section - full width so it starts where category starts */}
                    <div className="col-span-1 md:col-span-4">
                        <div className={`rounded-3xl overflow-hidden shadow-[0_18px_60px_rgba(190,24,93,0.45)] border ${theme === 'dark' ? 'bg-gray-950/80 border-rose-900/70' : 'bg-white/80 border-rose-100'}`}>
                            {/* Flash Sales Header */}
                            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 md:px-6 py-3 md:py-4 ${theme === 'dark' ? 'bg-gradient-to-r from-rose-700 via-red-600 to-orange-500' : 'bg-gradient-to-r from-rose-500 via-red-500 to-orange-400'}`}>
                                {/* First Row: Title and Description */}
                                <div className="flex items-center gap-3 text-white">
                                    <div>
                                        <p className="text-xs md:text-sm font-semibold tracking-wide uppercase">
                                            Flash Sale
                                        </p>
                                        <p className="text-xs opacity-85">
                                            Limited premium drops for today only
                                        </p>
                                    </div>
                                </div>
                                {/* Second Row: Clock Icon, Timer, and View All Link */}
                                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 text-white">
                                    <div className="relative flex items-center justify-center h-9 w-9 rounded-full bg-black/20 shrink-0">
                                        <div className="absolute inset-0 rounded-full border border-white/30 animate-ping opacity-50" />
                                        <FaClock className="relative text-base" />
                                    </div>
                                    <span className="hidden sm:inline text-[11px] uppercase tracking-[0.18em]">
                                        Time left
                                    </span>
                                    <span className={`text-sm md:text-base font-semibold px-3 py-1 rounded-full ${theme === 'dark' ? 'bg-black/40 text-white' : 'bg-white/90 text-red-600'} shadow-sm`}>
                                        {String(timeLeft.hours).padStart(2, '0')}h:{String(timeLeft.minutes).padStart(2, '0')}m:{String(timeLeft.seconds).padStart(2, '0')}s
                                    </span>
                                    <Link to="/products" className="text-[11px] md:text-xs font-semibold underline-offset-4 hover:underline whitespace-nowrap">
                                        View all deals →
                                    </Link>
                                </div>
                            </div>

                            {/* Flash Sales Products */}
                            {flashSaleLoading ? (
                                <div className="flex justify-center items-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                </div>
                            ) : flashSaleProducts.length === 0 ? (
                                <div className="flex justify-center items-center py-20">
                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        No flash sale products available at the moment.
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 md:p-5">
                                    <div className="flex flex-nowrap gap-3 overflow-x-auto overflow-y-hidden pb-2 snap-x snap-mandatory">
                                        {flashSaleProducts.map((product) => (
                                            <Link 
                                                key={product._id} 
                                                to={`/products/${product._id}`}
                                                className={`group flex-none w-[calc((100%-0.75rem)/2)] sm:w-[calc((100%-1.5rem)/3)] md:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-3rem)/5)] shrink-0 snap-start rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.45)] ${theme === 'dark' ? 'bg-gray-900/80 border border-gray-800' : 'bg-blue-50 border border-blue-100'}`}
                                            >
                                                {/* Product Image */}
                                                <div className={`relative overflow-hidden h-32 sm:h-40 md:h-44 ${theme === 'dark' ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-gradient-to-b from-blue-50 to-blue-100'}`}>
                                                    <img 
                                                        src={product.images?.[0]?.url || wemaxLogo} 
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                    {product.discountPercent > 0 && (
                                                        <div className="absolute top-2 right-2 rounded-full bg-black/70 px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-amber-300 border border-amber-400/40 backdrop-blur">
                                                            Save {product.discountPercent}%
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Info */}
                                                <div className="p-3 md:p-3.5">
                                                    <h3 className={`text-[10px] sm:text-sm font-medium line-clamp-2 mb-1 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                                                        {product.name}
                                                    </h3>

                                                    {/* Rating */}
                                                    {product.averageRating > 0 && (
                                                        <div className="flex items-center gap-1.5 mb-1.5">
                                                            <div className="flex text-yellow-400 text-[9px] sm:text-[10px]">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <FaStar
                                                                        key={i}
                                                                        className={i < Math.round(product.averageRating) ? 'fill-current' : 'text-gray-300'}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className={`text-[9px] sm:text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                {product.averageRating.toFixed(1)} {product.reviewsCount > 0 && `(${product.reviewsCount})`}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Price */}
                                                    <div className="mb-1.5">
                                                        <p className="text-[12px] sm:text-sm md:text-base font-semibold text-amber-400">
                                                            KES {product.newPrice?.toLocaleString() || '0'}
                                                        </p>
                                                        {product.oldPrice && product.oldPrice > product.newPrice && (
                                                            <p className={`text-[10px] sm:text-[11px] line-through ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                                                KES {product.oldPrice?.toLocaleString()}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Stock Info */}
                                                    {product.stock !== undefined && (
                                                        <div className={`text-[10px] sm:text-[11px] mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                            <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                                                                {product.stock > 0 ? (
                                                                    <div
                                                                        className={`h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500`}
                                                                        style={{
                                                                            width: `${Math.min(100, (product.stock / 50) * 100)}%`,
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-red-500" />
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] sm:text-[11px] mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                                                <span>
                                                                    {product.stock === 0
                                                                        ? 'Out of stock'
                                                                        : product.stock < 10
                                                                        ? `Only ${product.stock} left`
                                                                        : `${product.stock} in stock`}
                                                                </span>
                                                                {product.stock > 0 && product.stock < 20 && (
                                                                    <span className="inline-flex items-center gap-1">
                                                                        <FaShoppingCart className="text-[9px] sm:text-[10px]" />
                                                                        Fast moving
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Electronics bundle packages - first section after flash sale (full width) */}
                    <div className="col-span-1 md:col-span-4">
                        <div className={`rounded-3xl overflow-hidden shadow-[0_18px_60px_rgba(37,99,235,0.45)] border ${theme === 'dark' ? 'bg-gray-950/80 border-blue-900/70' : 'bg-white/80 border-blue-100'}`}>
                            <div
                                className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between relative overflow-hidden"
                                style={{
                                    background:
                                        theme === 'dark'
                                            ? [
                                                  'radial-gradient(600px 220px at 12% 10%, rgba(56,189,248,0.35), transparent 60%)',
                                                  'radial-gradient(520px 200px at 88% 30%, rgba(99,102,241,0.35), transparent 62%)',
                                                  'linear-gradient(90deg, rgba(2,6,23,1) 0%, rgba(15,23,42,1) 35%, rgba(2,6,23,1) 100%)',
                                                  'repeating-linear-gradient(90deg, rgba(56,189,248,0.12) 0px, rgba(56,189,248,0.12) 1px, transparent 1px, transparent 22px)',
                                                  'repeating-linear-gradient(0deg, rgba(99,102,241,0.10) 0px, rgba(99,102,241,0.10) 1px, transparent 1px, transparent 18px)',
                                              ].join(', ')
                                            : [
                                                  'radial-gradient(560px 220px at 10% 15%, rgba(56,189,248,0.45), transparent 62%)',
                                                  'radial-gradient(520px 220px at 90% 35%, rgba(99,102,241,0.40), transparent 62%)',
                                                  'linear-gradient(90deg, rgba(224,242,254,0.95) 0%, rgba(219,234,254,0.95) 35%, rgba(224,242,254,0.95) 100%)',
                                                  'repeating-linear-gradient(90deg, rgba(37,99,235,0.10) 0px, rgba(37,99,235,0.10) 1px, transparent 1px, transparent 22px)',
                                                  'repeating-linear-gradient(0deg, rgba(99,102,241,0.08) 0px, rgba(99,102,241,0.08) 1px, transparent 1px, transparent 18px)',
                                              ].join(', '),
                                }}
                            >
                                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08), transparent 60%)' }} />

                                <div className="relative z-10">
                                    <p className={`text-xs md:text-sm font-semibold flex items-center gap-2 ${theme === 'dark' ? 'text-cyan-100' : 'text-slate-900'}`}>
                                        <span className="text-lg"></span>
                                        Electronics Bundle Packages
                                    </p>
                                    <p className={`text-[11px] md:text-xs ${theme === 'dark' ? 'text-cyan-100/80' : 'text-slate-700'}`}>
                                        Smart TV, audio, and premium tech bundles in one click.
                                    </p>
                                </div>
                                <Link
                                    to="/packages"
                                    className={`hidden sm:inline-flex items-center gap-1 text-[11px] md:text-xs font-medium underline-offset-4 hover:underline relative z-10 ${
                                        theme === 'dark' ? 'text-cyan-200' : 'text-blue-700'
                                    }`}
                                >
                                    View all electronics
                                    <FaChevronRight className="text-[10px]" />
                                </Link>
                            </div>

                            {electronicsBundlesLoading ? (
                                <div className="flex justify-center items-center py-16">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                </div>
                            ) : electronicsBundles.length === 0 ? (
                                <div className="flex justify-center items-center py-16 px-4">
                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        No electronics bundle packages available right now.
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 md:p-5">
                                    <div className="flex flex-nowrap gap-3 overflow-x-auto overflow-y-hidden pb-2 snap-x snap-mandatory">
                                        {electronicsBundles.map((pkg) => (
                                            <Link
                                                key={pkg._id}
                                                to={`/packages/${pkg._id}`}
                                                className={`group flex-none w-[calc((100%-0.75rem)/2)] sm:w-[calc((100%-1.5rem)/3)] md:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-3rem)/5)] shrink-0 snap-start rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.45)] ${theme === 'dark' ? 'bg-gray-900/80 border border-gray-800' : 'bg-blue-50 border border-blue-100'}`}
                                            >
                                                {/* Package Image */}
                                                <div className={`relative overflow-hidden h-32 sm:h-40 md:h-44 ${theme === 'dark' ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-gradient-to-b from-blue-50 to-blue-100'}`}>
                                                    <img
                                                        src={pkg.images?.[0]?.url || wemaxLogo}
                                                        alt={pkg.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                    {pkg.discountPercent > 0 && (
                                                        <div className="absolute top-2 right-2 rounded-full bg-black/70 px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-amber-300 border border-amber-400/40 backdrop-blur">
                                                            Save {pkg.discountPercent}%
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Package Info */}
                                                <div className="p-3 md:p-3.5">
                                                    <h3 className={`text-[11px] sm:text-sm font-medium line-clamp-2 mb-1.5 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                                                        {pkg.name}
                                                    </h3>

                                                    <div className="mb-2">
                                                        <p className="text-sm md:text-base font-semibold text-amber-400">
                                                            KES {Number(pkg.totalPrice || 0).toLocaleString()}
                                                        </p>
                                                        {pkg.oldTotalPrice != null && pkg.oldTotalPrice > pkg.totalPrice && (
                                                            <p className={`text-[11px] line-through ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                                                KES {Number(pkg.oldTotalPrice).toLocaleString()}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <p className={`text-[11px] line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        {pkg.description || 'View details'}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Furniture bundle packages - full width like Flash Sale/Bundle */}
                    <div className="col-span-1 md:col-span-4">
                        <div className={`rounded-3xl overflow-hidden shadow-[0_16px_40px_rgba(15,23,42,0.45)] border ${theme === 'dark' ? 'bg-gray-950/80 border-gray-800' : 'bg-white/80 border-slate-200'}`}>
                            <div 
                                className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between relative overflow-hidden"
                                style={{
                                    background: theme === 'dark' 
                                        ? 'linear-gradient(90deg, #3e2723 0%, #4e342e 25%, #5d4037 50%, #4e342e 75%, #3e2723 100%), repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.05) 20px, rgba(0,0,0,0.05) 22px)'
                                        : 'linear-gradient(90deg, #d4a574 0%, #c19a6b 25%, #d4a574 50%, #c19a6b 75%, #d4a574 100%), repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139,69,19,0.1) 2px, rgba(139,69,19,0.1) 4px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(101,67,33,0.08) 20px, rgba(101,67,33,0.08) 22px)',
                                    backgroundBlendMode: 'multiply'
                                }}
                            >
                                <div className="relative z-10">
                                    <p className={`text-xs md:text-sm font-semibold flex items-center gap-2 ${theme === 'dark' ? 'text-amber-200' : 'text-amber-900'}`}>
                                        <span className="text-lg"></span>
                                        Furniture Bundle Packages
                                    </p>
                                    <p className={`text-[11px] md:text-xs ${theme === 'dark' ? 'text-amber-100/80' : 'text-amber-900/70'}`}>
                                        Curated furniture bundles to elevate your space.
                                    </p>
                                </div>
                                <Link
                                    to="/packages"
                                    className={`hidden sm:inline-flex items-center gap-1 text-[11px] md:text-xs font-medium underline-offset-4 hover:underline relative z-10 ${theme === 'dark' ? 'text-amber-300' : 'text-amber-800'}`}
                                >
                                    View all bundles
                                    <FaChevronRight className="text-[10px]" />
                                </Link>
                            </div>

                            {furnitureBundlesLoading ? (
                                <div className="flex justify-center items-center py-16">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                </div>
                            ) : furnitureBundles.length === 0 ? (
                                <div className="flex justify-center items-center py-16 px-4">
                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        No furniture bundle packages available right now.
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 md:p-5">
                                    <div className="flex flex-nowrap gap-3 overflow-x-auto overflow-y-hidden pb-2 snap-x snap-mandatory">
                                        {furnitureBundles.map((pkg) => (
                                            <Link
                                                key={pkg._id}
                                                to={`/packages/${pkg._id}`}
                                                className={`group flex-none w-[calc((100%-0.75rem)/2)] sm:w-[calc((100%-1.5rem)/3)] md:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-3rem)/5)] shrink-0 snap-start rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.45)] ${theme === 'dark' ? 'bg-gray-900/80 border border-gray-800' : 'bg-blue-50 border border-blue-100'}`}
                                            >
                                                {/* Package Image */}
                                                <div className={`relative overflow-hidden h-32 sm:h-40 md:h-44 ${theme === 'dark' ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-gradient-to-b from-blue-50 to-blue-100'}`}>
                                                    <img
                                                        src={pkg.images?.[0]?.url || wemaxLogo}
                                                        alt={pkg.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                    {pkg.discountPercent > 0 && (
                                                        <div className="absolute top-2 right-2 rounded-full bg-black/70 px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-amber-300 border border-amber-400/40 backdrop-blur">
                                                            Save {pkg.discountPercent}%
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Package Info */}
                                                <div className="p-3 md:p-3.5">
                                                    <h3 className={`text-[11px] sm:text-sm font-medium line-clamp-2 mb-1.5 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                                                        {pkg.name}
                                                    </h3>

                                                    <div className="mb-2">
                                                        <p className="text-sm md:text-base font-semibold text-amber-400">
                                                            KES {Number(pkg.totalPrice || 0).toLocaleString()}
                                                        </p>
                                                        {pkg.oldTotalPrice != null && pkg.oldTotalPrice > pkg.totalPrice && (
                                                            <p className={`text-[11px] line-through ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                                                KES {Number(pkg.oldTotalPrice).toLocaleString()}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <p className={`text-[11px] line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        {pkg.description || 'View details'}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
