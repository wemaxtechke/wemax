import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchProductById, fetchProducts } from '../redux/slices/productSlice.js';
import { addToCart } from '../redux/slices/cartSlice.js';
import { FaShoppingCart, FaHeart, FaStar, FaCheckCircle, FaBox, FaFacebook, FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { FaStarHalfStroke } from 'react-icons/fa6';
import wemaxLogo from '../assets/wemax-logo.jpg';
import api from '../utils/api.js';
import SmartImage from '../components/SmartImage.jsx';
import { Seo } from '../components/Seo.jsx';
import { WEMAX_INSTAGRAM_PAGE } from '../constants/social.js';

/** Admin sends [{ key, value }]; endpoints may use specKey, objects, JSON string, etc. */
function normalizeSpecifications(raw) {
    const empty = [];
    if (raw == null || raw === '') return empty;

    let list = raw;
    if (typeof raw === 'string') {
        try {
            list = JSON.parse(raw);
        } catch {
            return empty;
        }
    }
    if (!Array.isArray(list) && typeof list === 'object') {
        list = Object.entries(list).map(([key, value]) => ({
            key: String(key ?? '').trim(),
            value:
                value != null && typeof value !== 'object'
                    ? String(value).trim()
                    : value != null
                      ? JSON.stringify(value)
                      : '',
        }));
    }
    if (!Array.isArray(list)) return empty;

    return list
        .map((entry) => {
            if (!entry || typeof entry !== 'object') return null;
            const key = String(entry.key ?? entry.specKey ?? entry.name ?? entry.label ?? '').trim();
            let val = entry.value ?? entry.specValue ?? entry.val;
            if (val != null && typeof val === 'object') {
                try {
                    val = JSON.stringify(val);
                } catch {
                    val = String(val);
                }
            }
            const value = val != null && val !== '' ? String(val).trim() : '';
            if (!key && !value) return null;
            return { key: key || '—', value: value || '—' };
        })
        .filter(Boolean);
}

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentProduct, loading, items: allProducts } = useSelector((state) => state.products);
    const { isAuthenticated } = useSelector((state) => state?.auth || {});
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [cartLoading, setCartLoading] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [relatedLoading, setRelatedLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
        // Scroll to top when component mounts or ID changes
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        dispatch(fetchProductById(id));
    }, [dispatch, id]);

    // Check if product is in wishlist
    useEffect(() => {
        if (currentProduct && isAuthenticated) {
            checkWishlistStatus();
        }
    }, [currentProduct, isAuthenticated]);

    // Fetch related products
    useEffect(() => {
        if (currentProduct) {
            fetchRelatedProducts();
        }
    }, [currentProduct]);

    const checkWishlistStatus = async () => {
        try {
            const response = await api.get('/wishlist');
            const wishlist = response.data || [];
            setIsInWishlist(wishlist.some(item => item._id === currentProduct._id || item.toString() === currentProduct._id));
        } catch (error) {
            // User might not be authenticated or wishlist might be empty
            setIsInWishlist(false);
        }
    };

    const fetchRelatedProducts = async () => {
        if (!currentProduct) return;
        setRelatedLoading(true);
        try {
            const response = await api.get('/products', {
                params: {
                    category: currentProduct.category,
                    limit: 4,
                }
            });
            // Filter out current product
            const related = (response.data.products || []).filter(p => p._id !== currentProduct._id).slice(0, 4);
            setRelatedProducts(related);
        } catch (error) {
            console.error('Failed to fetch related products:', error);
        } finally {
            setRelatedLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            showNotification('Please login to add items to cart', 'error');
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        if (currentProduct.stock < quantity) {
            showNotification(`Only ${currentProduct.stock} items available in stock`, 'error');
            return;
        }

        setCartLoading(true);
        try {
            await dispatch(addToCart({
                productId: currentProduct._id,
                quantity: quantity,
            })).unwrap();
            showNotification('Product added to cart successfully!', 'success');
        } catch (error) {
            showNotification(error || 'Failed to add to cart', 'error');
        } finally {
            setCartLoading(false);
        }
    };

    const handleBuyNow = async () => {
        if (!isAuthenticated) {
            showNotification('Please login to continue', 'error');
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        if (currentProduct.stock < quantity) {
            showNotification(`Only ${currentProduct.stock} items available in stock`, 'error');
            return;
        }

        setCartLoading(true);
        try {
            await dispatch(addToCart({
                productId: currentProduct._id,
                quantity: quantity,
            })).unwrap();
            navigate('/checkout');
        } catch (error) {
            showNotification(error || 'Failed to proceed to checkout', 'error');
        } finally {
            setCartLoading(false);
        }
    };

    const handleWishlistToggle = async () => {
        if (!isAuthenticated) {
            showNotification('Please login to save items to wishlist', 'error');
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        setWishlistLoading(true);
        try {
            if (isInWishlist) {
                await api.delete(`/wishlist/${currentProduct._id}`);
                setIsInWishlist(false);
                showNotification('Removed from wishlist', 'success');
            } else {
                await api.post('/wishlist', { productId: currentProduct._id });
                setIsInWishlist(true);
                showNotification('Added to wishlist!', 'success');
            }
        } catch (error) {
            showNotification(error.response?.data?.message || 'Failed to update wishlist', 'error');
        } finally {
            setWishlistLoading(false);
        }
    };

    const openShareFacebook = (url) => {
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            '_blank',
            'noopener,noreferrer'
        );
    };

    const openShareWhatsApp = (text) => {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    };

    const shareProductInstagram = async (url) => {
        try {
            await navigator.clipboard.writeText(url);
            showNotification('Link copied — paste it in your Instagram story or DM', 'success');
            window.open(WEMAX_INSTAGRAM_PAGE, '_blank', 'noopener,noreferrer');
        } catch {
            showNotification('Could not copy link. Try sharing from the address bar.', 'error');
        }
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    const calculateDiscount = () => {
        if (!currentProduct?.oldPrice || currentProduct.oldPrice <= currentProduct.newPrice) return 0;
        return Math.round(((currentProduct.oldPrice - currentProduct.newPrice) / currentProduct.oldPrice) * 100);
    };

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <>
                {[...Array(fullStars)].map((_, i) => (
                    <FaStar key={`full-${i}`} className="text-yellow-400" />
                ))}
                {hasHalfStar && <FaStarHalfStroke className="text-yellow-400" />}
                {[...Array(emptyStars)].map((_, i) => (
                    <FaStar key={`empty-${i}`} className="text-gray-400" />
                ))}
            </>
        );
    };

    const vignetteDark = 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(3, 7, 18, 0.4) 100%)';
    const vignetteLight = 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 35%, rgba(238, 242, 255, 0.5) 100%)';
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

    if (loading) {
        return (
            <div className="relative w-full min-h-screen overflow-hidden">
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundColor: theme === 'dark' ? '#030712' : '#eef2ff',
                        backgroundImage: theme === 'dark' ? bgImageDark : bgImageLight,
                        backgroundAttachment: 'fixed',
                        backgroundSize: 'cover',
                    }}
                />
                <div className={`relative z-10 w-full min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-950/35' : 'bg-white/45'} backdrop-blur-[3px]`}>
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (!currentProduct) {
        return (
            <div className="relative w-full min-h-screen overflow-hidden">
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundColor: theme === 'dark' ? '#030712' : '#eef2ff',
                        backgroundImage: theme === 'dark' ? bgImageDark : bgImageLight,
                        backgroundAttachment: 'fixed',
                        backgroundSize: 'cover',
                    }}
                />
                <div className={`relative z-10 w-full min-h-screen flex items-center justify-center px-4 ${theme === 'dark' ? 'bg-gray-950/35' : 'bg-white/45'} backdrop-blur-[3px]`}>
                    <div className="text-center">
                        <p className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Product not found
                        </p>
                        <Link
                            to="/products"
                            className="text-blue-600 hover:text-blue-700 underline"
                        >
                            Browse Products
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const images = currentProduct.images || [{ url: wemaxLogo }];
    const discount = calculateDiscount();
    const isInStock = currentProduct.stock > 0;
    const maxQuantity = currentProduct.stock || 999;
    const specRows = normalizeSpecifications(currentProduct.specifications);

    const productUrlBase = import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5173';
    const productUrl = `${productUrlBase}/products/${currentProduct._id}`;
    const productImage = images[0]?.url || wemaxLogo;
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: currentProduct.name,
        image: [productImage],
        description: currentProduct.description,
        sku: currentProduct._id?.slice(-8).toUpperCase(),
        brand: currentProduct.brand
            ? { '@type': 'Brand', name: currentProduct.brand }
            : undefined,
        offers: {
            '@type': 'Offer',
            priceCurrency: 'KES',
            price: currentProduct.newPrice,
            availability: currentProduct.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: productUrl,
        },
        aggregateRating:
            currentProduct.averageRating && currentProduct.reviewsCount
                ? {
                      '@type': 'AggregateRating',
                      ratingValue: currentProduct.averageRating,
                      reviewCount: currentProduct.reviewsCount,
                  }
                : undefined,
    };

    return (
        <div className="relative w-full min-h-screen overflow-hidden">
            <Seo
                title={currentProduct.name}
                description={currentProduct.description?.slice(0, 155)}
                type="product"
                image={productImage}
            >
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            </Seo>
            {/* Mobile bottom action bar */}
            <div className="fixed inset-x-0 bottom-[calc(2.5rem+env(safe-area-inset-bottom,0px))] z-[105] sm:bottom-[calc(3.25rem+env(safe-area-inset-bottom,0px))] md:hidden">
                <div className={`${theme === 'dark' ? 'bg-gray-900/95 border-t border-gray-800' : 'bg-white/95 border-t border-gray-200'} backdrop-blur px-3 py-2`}>
                    <div className="mx-auto flex max-w-7xl gap-2">
                        <button
                            onClick={handleAddToCart}
                            disabled={!isInStock || cartLoading}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md bg-orange-500 py-[0.46875rem] text-[0.65625rem] font-semibold text-white hover:bg-orange-600 ${
                                !isInStock || cartLoading ? 'cursor-not-allowed opacity-50' : ''
                            }`}
                        >
                            {cartLoading ? (
                                <>
                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <FaShoppingCart className="text-[0.5625rem]" /> Add to Cart
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleBuyNow}
                            disabled={!isInStock || cartLoading}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md bg-blue-600 py-[0.46875rem] text-[0.65625rem] font-semibold text-white hover:bg-blue-700 ${
                                !isInStock || cartLoading ? 'cursor-not-allowed opacity-50' : ''
                            }`}
                        >
                            {cartLoading ? (
                                <>
                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <FaShoppingCart className="text-[0.5625rem]" /> Buy Now
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            {/* Background layer - light and dark mode */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundColor: theme === 'dark' ? '#030712' : '#eef2ff',
                    backgroundImage: theme === 'dark' ? bgImageDark : bgImageLight,
                    backgroundAttachment: 'fixed',
                    backgroundSize: 'cover',
                }}
            />
            <div className={`relative z-10 w-full min-h-screen px-4 pt-3 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:pt-8 sm:pb-[calc(6.25rem+env(safe-area-inset-bottom,0px))] md:px-8 md:pt-12 md:pb-16 lg:pt-16 ${theme === 'dark' ? 'bg-gray-950/35' : 'bg-white/45'} backdrop-blur-[3px]`}>
            {/* Notification Toast */}
            {notification.show && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
                    notification.type === 'success' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-red-600 text-white'
                }`}>
                    <span>{notification.message}</span>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {/* Breadcrumb */}
                <nav className="mb-3 py-0.5 text-[11px] leading-tight sm:mb-4 sm:py-1 sm:text-xs">
                    <div className={`flex flex-wrap items-center gap-1 sm:gap-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Link to="/" className="hover:text-blue-600">
                            Home
                        </Link>
                        <span className="opacity-70" aria-hidden>
                            /
                        </span>
                        <Link to="/products" className="hover:text-blue-600">
                            Products
                        </Link>
                        <span className="opacity-70" aria-hidden>
                            /
                        </span>
                        <span className={`line-clamp-2 sm:line-clamp-none ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                            {currentProduct.name}
                        </span>
                    </div>
                </nav>

                <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-10">
                    {/* Images Section */}
                    <div className="space-y-3 sm:space-y-4">
                        {/* Main Image */}
                        <div className={`relative rounded-lg overflow-hidden h-60 sm:h-96 md:h-[500px] ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} flex items-center justify-center`}>
                            <SmartImage
                                src={images[selectedImage]?.url || wemaxLogo}
                                alt={currentProduct.name}
                                className="h-full w-full object-contain p-3 sm:p-4"
                            />
                            {discount > 0 && (
                                <div className="absolute right-1.5 top-1.5 rounded bg-red-500 px-[0.46875rem] py-[0.28125rem] text-[0.65625rem] font-bold leading-none text-white sm:right-3 sm:top-3 sm:rounded-md sm:px-[0.75rem] sm:py-1 sm:text-[0.84375rem] md:right-4 md:top-4 md:rounded-lg md:px-3 md:py-1.5 md:text-base">
                                    -{discount}%
                                </div>
                            )}
                            {currentProduct.isFlashDeal && (
                                <div className="absolute left-2 top-2 rounded-md bg-orange-500 px-2 py-0.5 text-xs font-bold text-white sm:left-4 sm:top-4 sm:rounded-lg sm:px-3 sm:py-1 sm:text-sm">
                                    Flash Deal
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Images */}
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 sm:gap-3">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`h-[3.75rem] w-[3.75rem] flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-20 sm:w-20 ${
                                            selectedImage === idx 
                                                ? 'border-blue-600 ring-2 ring-blue-400' 
                                                : theme === 'dark' 
                                                    ? 'border-gray-700 hover:border-gray-600' 
                                                    : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        <SmartImage
                                            src={img.url}
                                            alt={`${currentProduct.name} ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="space-y-1.5 sm:space-y-5 md:space-y-6">
                        {/* Brand and Category */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                            {currentProduct.brand && (
                                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold sm:px-3 sm:py-1 sm:text-sm ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                    {currentProduct.brand}
                                </span>
                            )}
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold sm:px-3 sm:py-1 sm:text-sm ${theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                                {currentProduct.category}
                            </span>
                            {currentProduct.subCategory && (
                                <span className={`rounded-full px-2 py-0.5 text-[11px] sm:px-3 sm:py-1 sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {currentProduct.subCategory}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <div>
                            <h1 className={`mb-1.5 text-xl font-bold sm:mb-3 sm:text-3xl md:text-4xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {currentProduct.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                                <div className="flex items-center gap-0.5 [&_svg]:h-3.5 [&_svg]:w-3.5 sm:gap-1 sm:[&_svg]:h-4 sm:[&_svg]:w-4">
                                    {renderStars(currentProduct.averageRating || 0)}
                                </div>
                                <span className={`text-xs font-semibold sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    ({currentProduct.reviewsCount || 0} {currentProduct.reviewsCount === 1 ? 'review' : 'reviews'})
                                </span>
                                {isInStock ? (
                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold sm:px-3 sm:py-1 sm:text-sm ${theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>
                                        <FaCheckCircle className="mr-0.5 inline text-[0.65rem] sm:mr-1 sm:text-sm" /> In Stock ({currentProduct.stock} available)
                                    </span>
                                ) : (
                                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-800 sm:px-3 sm:py-1 sm:text-sm">
                                        Out of Stock
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="space-y-0.5 sm:space-y-2">
                            <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-3">
                                <p className="text-xl font-bold text-blue-500 sm:text-3xl md:text-4xl">
                                    KES {currentProduct.newPrice?.toLocaleString()}
                                </p>
                                {currentProduct.oldPrice && currentProduct.oldPrice > currentProduct.newPrice && (
                                    <>
                                        <p className={`text-sm line-through sm:text-xl ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                            KES {currentProduct.oldPrice?.toLocaleString()}
                                        </p>
                                        {discount > 0 && (
                                            <span className="rounded-full bg-red-500 px-2 py-0.5 text-[0.65625rem] font-bold leading-none text-white sm:px-2.5 sm:py-[0.28125rem] sm:text-[0.84375rem] md:px-3 md:py-1 md:text-sm">
                                                Save {discount}%
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                            {discount > 0 && (
                                <p className={`text-[10px] font-semibold leading-tight sm:text-sm ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                    You save KES {(currentProduct.oldPrice - currentProduct.newPrice)?.toLocaleString()}
                                </p>
                            )}
                        </div>

                        {/* Quantity and primary actions (desktop/laptop) */}
                        <div className="space-y-1.5 border-t border-gray-300 pt-2 sm:space-y-4 sm:pt-4">
                            {/* Quantity */}
                            {isInStock && (
                                <div className="flex items-center gap-1.5 sm:gap-4">
                                    <span className={`text-xs font-semibold sm:text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        Quantity:
                                    </span>
                                    <div className={`flex items-center gap-1.5 rounded-md px-2 py-1 sm:gap-3 sm:rounded-lg sm:px-4 sm:py-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            disabled={quantity <= 1}
                                            className={`text-base font-bold transition-colors sm:text-xl ${
                                                quantity <= 1
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : theme === 'dark' 
                                                        ? 'text-gray-400 hover:text-white' 
                                                        : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            −
                                        </button>
                                        <span className={`min-w-[1.75rem] text-center text-xs font-bold sm:min-w-[2.5rem] sm:text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                                            disabled={quantity >= maxQuantity}
                                            className={`text-base font-bold transition-colors sm:text-xl ${
                                                quantity >= maxQuantity
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : theme === 'dark' 
                                                        ? 'text-gray-400 hover:text-white' 
                                                        : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            +
                                        </button>
                                    </div>
                                    {currentProduct.stock < 10 && currentProduct.stock > 0 && (
                                        <span className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                                            Only {currentProduct.stock} left!
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons (desktop / tablet) */}
                            <div className="hidden md:grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!isInStock || cartLoading}
                                    className={`bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
                                        !isInStock || cartLoading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {cartLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <FaShoppingCart /> Add to Cart
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    disabled={!isInStock || cartLoading}
                                    className={`bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
                                        !isInStock || cartLoading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {cartLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <FaShoppingCart /> Buy Now
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Specifications (above description so shoppers see tech details without scrolling past long copy) */}
                        {specRows.length > 0 && (
                            <section id="product-specifications" aria-label="Product specifications">
                                <h3 className={`mb-1 text-xs font-bold sm:mb-3 sm:text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    Specifications
                                </h3>
                                <div className={`overflow-x-auto rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                    <table className="w-full min-w-[280px] border-collapse text-left text-[10px] sm:text-sm">
                                        <thead>
                                            <tr
                                                className={
                                                    theme === 'dark'
                                                        ? 'border-b border-gray-600 bg-gray-900/50'
                                                        : 'border-b border-gray-300 bg-gray-200/70'
                                                }
                                            >
                                                <th
                                                    scope="col"
                                                    className={`px-2 py-1.5 font-bold sm:px-4 sm:py-2 ${
                                                        theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                                                    }`}
                                                >
                                                    Specification
                                                </th>
                                                <th
                                                    scope="col"
                                                    className={`px-2 py-1.5 font-bold sm:px-4 sm:py-2 ${
                                                        theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                                                    }`}
                                                >
                                                    Details
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {specRows.map((spec, idx) => (
                                                <tr
                                                    key={`${spec.key}-${idx}`}
                                                    className={
                                                        theme === 'dark'
                                                            ? idx % 2 === 1
                                                                ? 'bg-gray-900/25'
                                                                : ''
                                                            : idx % 2 === 1
                                                              ? 'bg-white/60'
                                                              : ''
                                                    }
                                                >
                                                    <th
                                                        scope="row"
                                                        className={`w-[32%] max-w-[9rem] align-top whitespace-normal break-words border-b px-2 py-1.5 font-semibold sm:max-w-none sm:px-4 sm:py-2 ${
                                                            theme === 'dark'
                                                                ? 'border-gray-700 text-gray-200'
                                                                : 'border-gray-200 text-gray-800'
                                                        }`}
                                                    >
                                                        {spec.key}
                                                    </th>
                                                    <td
                                                        className={`align-top whitespace-normal break-words border-b px-2 py-1.5 sm:px-4 sm:py-2 ${
                                                            theme === 'dark'
                                                                ? 'border-gray-700 text-gray-300'
                                                                : 'border-gray-200 text-gray-700'
                                                        }`}
                                                    >
                                                        {spec.value}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {/* Description */}
                        <div>
                            <h3 className={`mb-0.5 text-xs font-bold sm:mb-2 sm:text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Description
                            </h3>
                            <p className={`whitespace-pre-wrap text-xs leading-snug sm:text-base sm:leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {currentProduct.description}
                            </p>
                        </div>

                        {/* Save (desktop / laptop) */}
                        <div className="hidden md:block max-w-md">
                            <button
                                onClick={handleWishlistToggle}
                                disabled={wishlistLoading}
                                className={`w-full rounded-lg font-bold transition-colors flex items-center justify-center gap-2 py-3 ${
                                    isInWishlist
                                        ? theme === 'dark'
                                            ? 'bg-red-900/30 text-red-400 hover:bg-red-900/40'
                                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                                        : theme === 'dark'
                                            ? 'bg-gray-800 hover:bg-gray-700 text-red-400'
                                            : 'bg-gray-200 hover:bg-gray-300 text-red-600'
                                } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {wishlistLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                ) : (
                                    <>
                                        <FaHeart className={isInWishlist ? 'fill-current' : ''} /> {isInWishlist ? 'Saved' : 'Save'}
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Additional Info */}
                        <div className={`space-y-0.5 rounded-lg p-2 sm:space-y-2 sm:p-4 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                            <div className="flex items-center gap-1 text-[10px] sm:gap-2 sm:text-sm">
                                <FaBox className={`shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                    SKU: {currentProduct._id?.slice(-8).toUpperCase()}
                                </span>
                            </div>
                            {currentProduct.isFeatured && (
                                <div className={`text-[10px] font-semibold sm:text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                                    ⭐ Featured Product
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Share this product — end of detail content; ~25% smaller than original */}
                <div className="mt-6 rounded-lg border-[1.5px] border-dashed border-gray-300/80 bg-black/5 px-2.5 py-2.5 text-center dark:border-gray-600 dark:bg-white/5 sm:mt-8 sm:px-3 sm:py-3">
                    <h2
                        className={`mb-2 text-xs font-bold sm:text-[0.9375rem] ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                    >
                        Share this product
                    </h2>
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-[0.9375rem]">
                        <button
                            type="button"
                            onClick={() => openShareFacebook(productUrl)}
                            className="group flex flex-col items-center gap-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1"
                            aria-label="Share on Facebook"
                        >
                            <span className="flex h-[2.625rem] w-[2.625rem] items-center justify-center rounded-full bg-[#1877F2] text-white shadow-md ring-[3px] ring-[#1877F2]/25 transition group-hover:scale-105 group-active:scale-95 sm:h-12 sm:w-12">
                                <FaFacebook className="text-[1.35rem] sm:text-2xl" />
                            </span>
                            <span className={`text-[10px] font-semibold sm:text-[11px] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                Facebook
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                openShareWhatsApp(`Check out ${currentProduct.name} on WEMAX — ${productUrl}`)
                            }
                            className="group flex flex-col items-center gap-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-1"
                            aria-label="Share on WhatsApp"
                        >
                            <span className="flex h-[2.625rem] w-[2.625rem] items-center justify-center rounded-full bg-[#25D366] text-white shadow-md ring-[3px] ring-[#25D366]/25 transition group-hover:scale-105 group-active:scale-95 sm:h-12 sm:w-12">
                                <FaWhatsapp className="text-[1.35rem] sm:text-2xl" />
                            </span>
                            <span className={`text-[10px] font-semibold sm:text-[11px] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                WhatsApp
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => shareProductInstagram(productUrl)}
                            className="group flex flex-col items-center gap-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-1"
                            aria-label="Copy link for Instagram"
                        >
                            <span className="flex h-[2.625rem] w-[2.625rem] items-center justify-center rounded-full bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] text-white shadow-md ring-[3px] ring-pink-500/20 transition group-hover:scale-105 group-active:scale-95 sm:h-12 sm:w-12">
                                <FaInstagram className="text-[1.35rem] sm:text-2xl" />
                            </span>
                            <span className={`text-[10px] font-semibold sm:text-[11px] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                Instagram
                            </span>
                        </button>
                    </div>
                    <p className={`mx-auto mt-1.5 max-w-md text-[10px] leading-snug sm:text-[11px] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                        Instagram copies your product link so you can paste it in a story or DM.
                    </p>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-300">
                        <h2 className={`text-2xl sm:text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Related Products
                        </h2>
                        {relatedLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {relatedProducts.map((product) => {
                                    const productDiscount = product.oldPrice && product.oldPrice > product.newPrice
                                        ? Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100)
                                        : 0;
                                    return (
                                        <Link
                                            key={product._id}
                                            to={`/products/${product._id}`}
                                            className={`group rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
                                                theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-lg'
                                            }`}
                                        >
                                            <div className={`relative overflow-hidden h-40 sm:h-48 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                                <SmartImage
                                                    src={product.images?.[0]?.url || wemaxLogo}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                                {productDiscount > 0 && (
                                                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                                        -{productDiscount}%
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 sm:p-4">
                                                <h3 className={`text-xs sm:text-sm font-semibold line-clamp-2 mb-2 ${
                                                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                                                }`}>
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-grey-200 font-bold text-sm sm:text-base">
                                                        KES {product.newPrice?.toLocaleString()}
                                                    </p>
                                                    {product.oldPrice && product.oldPrice > product.newPrice && (
                                                        <p className={`text-xs line-through ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                                            KES {product.oldPrice?.toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
            </div>
        </div>
    );
}
