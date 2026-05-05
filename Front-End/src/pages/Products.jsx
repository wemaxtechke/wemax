import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaStar } from 'react-icons/fa';
import wemaxLogo from '../assets/wemax-logo.jpg';
import { addToCart } from '../redux/slices/cartSlice.js';
import SmartImage from '../components/SmartImage.jsx';
import api from '../utils/api.js';
import { Seo } from '../components/Seo.jsx';

export default function Products() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });
    const { isAuthenticated } = useSelector((state) => state?.auth || {});

    const PAGE_SIZE = 40;
    const sentinelRef = useRef(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const mergeUniqueById = (prev, next) => {
        const map = new Map();
        (prev || []).forEach((p) => map.set(p?._id, p));
        (next || []).forEach((p) => map.set(p?._id, p));
        return Array.from(map.values());
    };

    const fetchProductsPage = useCallback(async (targetPage, { append } = { append: false }) => {
        setError('');
        if (append) setLoadingMore(true);
        else setLoading(true);

        try {
            const params = Object.fromEntries(searchParams);
            // Pagination is controlled by this page (ignore any URL page/limit)
            delete params.page;
            delete params.limit;

            const response = await api.get('/products', {
                params: { ...params, page: targetPage, limit: PAGE_SIZE },
            });

            const nextProducts = response.data?.products || [];
            const nextTotalPages = Number(response.data?.totalPages ?? 1) || 1;
            const nextCurrentPage = Number(response.data?.currentPage ?? targetPage) || targetPage;

            setProducts((prev) => (append ? mergeUniqueById(prev, nextProducts) : nextProducts));
            setTotalPages(nextTotalPages);
            setPage(nextCurrentPage);
            setHasMore(nextCurrentPage < nextTotalPages);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load products');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [searchParams]);

    useEffect(() => {
        // Reset to first page whenever filters/search changes
        fetchProductsPage(1, { append: false });
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, [fetchProductsPage]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        if (loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (!first?.isIntersecting) return;
                if (!hasMore) return;
                if (loadingMore) return;
                fetchProductsPage(page + 1, { append: true });
            },
            { root: null, rootMargin: '300px', threshold: 0 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [fetchProductsPage, hasMore, loading, loadingMore, page]);

    const vignetteDark = 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(3, 7, 18, 0.4) 100%)';
    const vignetteLight = 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 35%, rgba(241, 245, 249, 0.5) 100%)';
    const bgImageDark = [
        vignetteDark,
        'radial-gradient(ellipse 140% 90% at 50% -15%, rgba(59, 130, 246, 0.28), transparent 55%)',
        'radial-gradient(ellipse 90% 70% at 100% 50%, rgba(30, 64, 175, 0.18), transparent 50%)',
        'radial-gradient(ellipse 80% 60% at 0% 55%, rgba(99, 102, 241, 0.18), transparent 50%)',
        'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(59, 130, 246, 0.12), transparent 55%)',
    ].join(', ');
    const bgImageLight = [
        vignetteLight,
        'radial-gradient(ellipse 140% 90% at 50% -15%, rgba(96, 165, 250, 0.32), transparent 55%)',
        'radial-gradient(ellipse 90% 70% at 100% 50%, rgba(147, 197, 253, 0.28), transparent 50%)',
        'radial-gradient(ellipse 80% 60% at 0% 55%, rgba(199, 210, 254, 0.28), transparent 50%)',
        'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(186, 230, 253, 0.2), transparent 55%)',
    ].join(', ');

    const handleAddToCart = async (e, product) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
        } catch (error) {
            // Optional: could show a toast here; keeping silent to avoid UI changes
            console.error('Failed to add to cart from products page:', error);
        }
    };

    return (
        <div className="relative w-full min-h-screen overflow-hidden">
            <Seo
                title="All Products"
                description="Browse all Wemax products including premium electronics, church sound systems, livestream gear, accessories and more with nationwide delivery."
            />
            {/* Background layer - gradients + subtle vignette */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundColor: theme === 'dark' ? '#030712' : '#eef2ff',
                    backgroundImage: theme === 'dark' ? bgImageDark : bgImageLight,
                    backgroundAttachment: 'fixed',
                    backgroundSize: 'cover',
                }}
            />
            <div className={`relative z-10 w-full min-h-screen py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 ${theme === 'dark' ? 'bg-gray-950/35' : 'bg-white/45'} backdrop-blur-[3px]`}>
            <div className="max-w-7xl mx-auto">
                <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-8 md:mb-12 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    All Products
                </h1>

                {error && (
                    <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
                        theme === 'dark'
                            ? 'bg-red-500/10 border-red-500/30 text-red-200'
                            : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[0.421875rem] sm:gap-[0.5625rem] md:gap-[0.84375rem]">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`overflow-hidden rounded-md shadow-sm ${
                                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                                    } animate-pulse`}
                                >
                                    <div
                                        className={`h-[5.625rem] sm:h-[6.75rem] md:h-[7.875rem] ${
                                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                                        }`}
                                    />
                                    <div className={`p-[0.421875rem] sm:p-[0.5625rem] ${theme === 'dark' ? 'bg-gray-900/40' : 'bg-blue-50'}`}>
                                        <div
                                            className={`mb-1 h-2 rounded sm:h-2.5 ${
                                                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                                            }`}
                                        />
                                        <div
                                            className={`mb-2 h-2 w-2/3 rounded ${
                                                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                                            }`}
                                        />
                                        <div
                                            className={`mb-[0.421875rem] h-3 w-1/2 rounded sm:h-[0.84375rem] ${
                                                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                                            }`}
                                        />
                                        <div
                                            className={`h-[1.125rem] rounded ${
                                                theme === 'dark' ? 'bg-gray-800' : 'bg-orange-200'
                                            }`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[0.421875rem] sm:gap-[0.5625rem] md:gap-[0.84375rem]">
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <Link 
                                        key={product._id} 
                                        to={`/products/${product._id}`}
                                        className={`group overflow-hidden rounded-md transition-all duration-300 hover:shadow-xl ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-lg'}`}
                                    >
                                        {/* Product Image — scaled again ×0.75 */}
                                        <div className="relative h-[5.625rem] overflow-hidden bg-white sm:h-[6.75rem] md:h-[7.875rem]">
                                            <SmartImage
                                                src={product.images?.[0]?.url || wemaxLogo}
                                                alt={product.name}
                                                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                                            />
                                            {product.discount > 0 && (
                                                <div className="absolute right-1 top-1 rounded bg-red-500 px-1 py-px text-[8px] font-bold text-white sm:text-[10px]">
                                                    -{product.discount}%
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className={`p-[0.421875rem] sm:p-[0.5625rem] ${theme === 'dark' ? 'bg-blue-950/40' : 'bg-blue-50'}`}>
                                            <h3 className={`mb-1 line-clamp-2 text-[8px] font-semibold sm:text-[10px] md:text-xs ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                                                {product.name}
                                            </h3>

                                            {/* Rating */}
                                            <div className="mb-1 flex items-center gap-px">
                                                <div className="flex text-yellow-500">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FaStar key={i} className="text-[8px] sm:text-[10px]" />
                                                    ))}
                                                </div>
                                                <span className={`text-[8px] sm:text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    (234)
                                                </span>
                                            </div>

                                            {/* Price */}
                                            <div className="mb-[0.421875rem]">
                                                <p className={`text-[10.5px] font-bold sm:text-sm md:text-base ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                                                    KES {product.newPrice?.toLocaleString() || '0'}
                                                </p>
                                                {product.oldPrice && product.oldPrice > product.newPrice && (
                                                    <p className="text-[8px] text-gray-500 line-through sm:text-[10px]">
                                                        KES {product.oldPrice?.toLocaleString()}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Add to Cart Button */}
                                            <button
                                                type="button"
                                                onClick={(e) => handleAddToCart(e, product)}
                                                className="flex w-full items-center justify-center gap-1 rounded bg-orange-500 py-1 text-[8px] font-semibold text-white transition-colors duration-300 hover:bg-orange-600 sm:text-[10px]"
                                            >
                                                <FaShoppingCart className="text-[8px] sm:text-[10px]" /> Add
                                            </button>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className={`col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-4 text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <p>No products found.</p>
                                </div>
                            )}
                        </div>

                        {/* Infinite scroll sentinel */}
                        <div ref={sentinelRef} className="h-1" />
                        <div className="mt-6 flex justify-center">
                            {loadingMore ? (
                                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Loading more products...
                                </div>
                            ) : !hasMore && products.length > 0 ? (
                                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    You’ve reached the end.
                                </div>
                            ) : null}
                        </div>
                    </>
                )}
            </div>
            </div>
        </div>
    );
}
