import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchProducts } from '../redux/slices/productSlice.js';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaStar } from 'react-icons/fa';
import wemaxLogo from '../assets/wemax-logo.jpg';
import { addToCart } from '../redux/slices/cartSlice.js';
import SmartImage from '../components/SmartImage.jsx';

export default function Products() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { items: products, loading } = useSelector((state) => state.products);
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });
    const { isAuthenticated } = useSelector((state) => state?.auth || {});

    useEffect(() => {
        const params = Object.fromEntries(searchParams);
        dispatch(fetchProducts(params));
    }, [dispatch, searchParams]);

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
                <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-8 md:mb-12 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    All Products
                </h1>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                        {products.length > 0 ? (
                            products.map((product) => (
                                <Link 
                                    key={product._id} 
                                    to={`/products/${product._id}`}
                                    className={`group rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-lg'}`}
                                >
                                    {/* Product Image Container */}
                                    <div className="relative overflow-hidden h-40 sm:h-48 md:h-56 bg-white">
                                        <SmartImage
                                            src={product.images?.[0]?.url || wemaxLogo}
                                            alt={product.name}
                                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {product.discount > 0 && (
                                            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs sm:text-sm font-bold">
                                                -{product.discount}%
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className={`p-3 sm:p-4 ${theme === 'dark' ? 'bg-blue-950/40' : 'bg-blue-50'}`}>
                                        <h3 className={`text-xs sm:text-sm md:text-base font-semibold line-clamp-2 mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                                            {product.name}
                                        </h3>

                                        {/* Rating */}
                                        <div className="flex items-center gap-1 mb-2">
                                            <div className="flex text-yellow-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar key={i} className="text-xs sm:text-sm" />
                                                ))}
                                            </div>
                                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                (234)
                                            </span>
                                        </div>

                                        {/* Price */}
                                        <div className="mb-3">
                                            <p className={`text-lg sm:text-xl md:text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                                                KES {product.newPrice?.toLocaleString() || '0'}
                                            </p>
                                            {product.oldPrice && product.oldPrice > product.newPrice && (
                                                <p className="text-xs sm:text-sm line-through text-gray-500">
                                                    KES {product.oldPrice?.toLocaleString()}
                                                </p>
                                            )}
                                        </div>

                                        {/* Add to Cart Button */}
                                        <button
                                            type="button"
                                            onClick={(e) => handleAddToCart(e, product)}
                                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded text-xs sm:text-sm font-semibold transition-colors duration-300 flex items-center justify-center gap-2"
                                        >
                                            <FaShoppingCart className="text-xs sm:text-sm" /> Add
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
                )}
            </div>
            </div>
        </div>
    );
}
