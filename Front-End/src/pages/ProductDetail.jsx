import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchProductById, fetchProducts } from '../redux/slices/productSlice.js';
import { addToCart } from '../redux/slices/cartSlice.js';
import { FaShoppingCart, FaHeart, FaStar, FaShareAlt, FaCheckCircle, FaTruck, FaBox } from 'react-icons/fa';
import { FaStarHalfStroke } from 'react-icons/fa6';
import wemaxLogo from '../assets/wemax-logo.jpg';
import api from '../utils/api.js';
import SmartImage from '../components/SmartImage.jsx';

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

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: currentProduct.name,
                    text: currentProduct.description,
                    url: url,
                });
            } catch (error) {
                // User cancelled or error occurred
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(url);
                showNotification('Link copied to clipboard!', 'success');
            } catch (error) {
                showNotification('Failed to copy link', 'error');
            }
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

    return (
        <div className="relative w-full min-h-screen overflow-hidden">
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
            <div className={`relative z-10 w-full min-h-screen py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 ${theme === 'dark' ? 'bg-gray-950/35' : 'bg-white/45'} backdrop-blur-[3px]`}>
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
                <nav className="mb-6 text-sm">
                    <div className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Link to="/" className="hover:text-blue-600">Home</Link>
                        <span>/</span>
                        <Link to="/products" className="hover:text-blue-600">Products</Link>
                        <span>/</span>
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>
                            {currentProduct.name}
                        </span>
                    </div>
                </nav>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-12">
                    {/* Images Section */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className={`relative rounded-lg overflow-hidden h-80 sm:h-96 md:h-[500px] ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} flex items-center justify-center`}>
                            <SmartImage
                                src={images[selectedImage]?.url || wemaxLogo}
                                alt={currentProduct.name}
                                className="w-full h-full object-contain p-4"
                            />
                            {discount > 0 && (
                                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-lg">
                                    -{discount}%
                                </div>
                            )}
                            {currentProduct.isFlashDeal && (
                                <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-lg font-bold text-sm">
                                    Flash Deal
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Images */}
                        {images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
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
                    <div className="space-y-6">
                        {/* Brand and Category */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {currentProduct.brand && (
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                    {currentProduct.brand}
                                </span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                                {currentProduct.category}
                            </span>
                            {currentProduct.subCategory && (
                                <span className={`px-3 py-1 rounded-full text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {currentProduct.subCategory}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <div>
                            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {currentProduct.name}
                            </h1>
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-1">
                                    {renderStars(currentProduct.averageRating || 0)}
                                </div>
                                <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    ({currentProduct.reviewsCount || 0} {currentProduct.reviewsCount === 1 ? 'review' : 'reviews'})
                                </span>
                                {isInStock ? (
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>
                                        <FaCheckCircle className="inline mr-1" /> In Stock ({currentProduct.stock} available)
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                                        Out of Stock
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="space-y-2">
                            <div className="flex items-baseline gap-3 flex-wrap">
                                <p className="text-3xl md:text-4xl font-bold text-blue-500">
                                    KES {currentProduct.newPrice?.toLocaleString()}
                                </p>
                                {currentProduct.oldPrice && currentProduct.oldPrice > currentProduct.newPrice && (
                                    <>
                                        <p className={`text-xl line-through ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                            KES {currentProduct.oldPrice?.toLocaleString()}
                                        </p>
                                        {discount > 0 && (
                                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                Save {discount}%
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                            {discount > 0 && (
                                <p className={`font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                    You save KES {(currentProduct.oldPrice - currentProduct.newPrice)?.toLocaleString()}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className={`font-bold text-lg mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Description
                            </h3>
                            <p className={`leading-relaxed whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {currentProduct.description}
                            </p>
                        </div>

                        {/* Specifications */}
                        {currentProduct.specifications && currentProduct.specifications.length > 0 && (
                            <div>
                                <h3 className={`font-bold text-lg mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    Specifications
                                </h3>
                                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} p-4 rounded-lg`}>
                                    {currentProduct.specifications.map((spec, idx) => (
                                        spec.key && spec.value && (
                                            <div key={idx} className="flex gap-2">
                                                <span className={`font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {spec.key}:
                                                </span>
                                                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                                    {spec.value}
                                                </span>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity and Actions */}
                        <div className="space-y-4 pt-4 border-t border-gray-300">
                            {/* Quantity */}
                            {isInStock && (
                                <div className="flex items-center gap-4">
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        Quantity:
                                    </span>
                                    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            disabled={quantity <= 1}
                                            className={`text-xl font-bold transition-colors ${
                                                quantity <= 1
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : theme === 'dark' 
                                                        ? 'text-gray-400 hover:text-white' 
                                                        : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            −
                                        </button>
                                        <span className={`min-w-[40px] text-center font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                                            disabled={quantity >= maxQuantity}
                                            className={`text-xl font-bold transition-colors ${
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
                                        <span className={`text-sm ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                                            Only {currentProduct.stock} left!
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            </div>

                            {/* Wishlist Button */}
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

                            {/* Buy Now Button */}
                            <button
                                onClick={handleBuyNow}
                                disabled={!isInStock || cartLoading}
                                className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
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

                            {/* Share */}
                            <button
                                onClick={handleShare}
                                className={`w-full py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 border ${
                                    theme === 'dark' 
                                        ? 'border-gray-700 text-gray-400 hover:bg-gray-800' 
                                        : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <FaShareAlt /> Share Product
                            </button>
                        </div>

                        {/* Shipping Info */}
                        <div className={`p-4 rounded-lg space-y-2 ${theme === 'dark' ? 'bg-blue-900/20 border border-blue-800/30' : 'bg-blue-50 border border-blue-200'}`}>
                            <p className={`font-semibold flex items-center gap-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-800'}`}>
                                <FaTruck className="text-lg" /> {currentProduct.freeShipping ? 'Free Shipping' : 'Shipping Available'}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-blue-400/70' : 'text-blue-700'}`}>
                                {currentProduct.freeShipping 
                                    ? 'This item qualifies for free shipping'
                                    : 'Free shipping on orders over KES 5,000. Delivery within 3-5 business days'
                                }
                            </p>
                        </div>

                        {/* Additional Info */}
                        <div className={`p-4 rounded-lg space-y-2 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                            <div className="flex items-center gap-2 text-sm">
                                <FaBox className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
                                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                    SKU: {currentProduct._id?.slice(-8).toUpperCase()}
                                </span>
                            </div>
                            {currentProduct.isFeatured && (
                                <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                                    ⭐ Featured Product
                                </div>
                            )}
                        </div>
                    </div>
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
