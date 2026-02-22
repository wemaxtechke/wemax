import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, removeFromCart } from '../redux/slices/cartSlice.js';
import { Link } from 'react-router-dom';
import { FaTrash, FaShoppingCart } from 'react-icons/fa';
import wemaxLogo from '../assets/wemax-logo.jpg';

export default function Cart() {
    const dispatch = useDispatch();
    const { items, packages, subtotal, loading } = useSelector((state) => state.cart);
    const [removingId, setRemovingId] = useState(null);

    const handleRemoveProduct = async (itemId) => {
        setRemovingId(itemId);
        try {
            await dispatch(removeFromCart({ itemId, type: 'product' })).unwrap();
            dispatch(fetchCart());
        } catch (err) {
            console.error('Failed to remove item:', err);
        } finally {
            setRemovingId(null);
        }
    };

    const handleRemovePackage = async (itemId) => {
        setRemovingId(itemId);
        try {
            await dispatch(removeFromCart({ itemId, type: 'package' })).unwrap();
            dispatch(fetchCart());
        } catch (err) {
            console.error('Failed to remove package:', err);
        } finally {
            setRemovingId(null);
        }
    };
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });

    useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

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
            <div className={`relative z-10 w-full min-h-screen py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 ${theme === 'dark' ? 'bg-gray-950/35' : 'bg-white/45'} backdrop-blur-[3px]`}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-8 flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <FaShoppingCart className="text-blue-600" /> Shopping Cart
                </h1>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            {(items.length > 0 || packages.length > 0) ? (
                                <div className="space-y-4">
                                    {/* Product Items */}
                                    {items.map((item) => (
                                        <div 
                                            key={item._id} 
                                            className={`p-4 md:p-6 rounded-lg flex items-center gap-4 justify-between ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                                        >
                                            <img
                                                src={item.product?.images?.[0]?.url || wemaxLogo}
                                                alt={item.product?.name || 'Product'}
                                                className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                    {item.product?.name}
                                                </h3>
                                                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    Qty: {item.quantity}
                                                </p>
                                            </div>
                                            <div className="text-right mr-4">
                                                <p className="text-lg md:text-xl font-bold text-grey-600">
                                                    KES {item.price?.toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveProduct(item._id)}
                                                disabled={removingId === item._id}
                                                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                aria-label="Remove from cart"
                                            >
                                                {removingId === item._id ? (
                                                    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <FaTrash />
                                                )}
                                            </button>
                                        </div>
                                    ))}

                                    {/* Package Items */}
                                    {packages.map((pkg) => (
                                        <div 
                                            key={pkg._id} 
                                            className={`p-4 md:p-6 rounded-lg flex items-center gap-4 justify-between ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                                        >
                                            <img
                                                src={pkg.package?.images?.[0]?.url || wemaxLogo}
                                                alt={pkg.package?.name || 'Package'}
                                                className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                    📦 {pkg.package?.name}
                                                </h3>
                                                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    Qty: {pkg.quantity}
                                                </p>
                                            </div>
                                            <div className="text-right mr-4">
                                                <p className="text-lg md:text-xl font-bold text-blue-600">
                                                    KES {pkg.price?.toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePackage(pkg._id)}
                                                disabled={removingId === pkg._id}
                                                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                aria-label="Remove package from cart"
                                            >
                                                {removingId === pkg._id ? (
                                                    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <FaTrash />
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={`text-center py-12 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <FaShoppingCart className="text-5xl mx-auto mb-4 opacity-50" />
                                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Your cart is empty
                                    </p>
                                    <Link 
                                        to="/products" 
                                        className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-semibold"
                                    >
                                        Continue Shopping →
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Order Summary */}
                        <div className={`rounded-lg p-6 h-fit ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                            <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Order Summary
                            </h2>
                            
                            <div className="space-y-4 mb-6 pb-6 border-b border-gray-300">
                                <div className="flex justify-between">
                                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                        Subtotal
                                    </span>
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        KES {subtotal?.toLocaleString() || '0'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                        Shipping
                                    </span>
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        TBD
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                        Tax
                                    </span>
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        TBD
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between mb-6">
                                <span className="text-lg font-bold">Total</span>
                                <span className="text-2xl font-bold text-grey-600">
                                    KES {subtotal?.toLocaleString() || '0'}
                                </span>
                            </div>

                            <Link 
                                to="/checkout" 
                                className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors duration-300 mb-3"
                            >
                                Proceed to Checkout
                            </Link>

                            <Link 
                                to="/products" 
                                className={`w-full block text-center py-3 rounded-lg font-semibold transition-colors duration-300 border ${theme === 'dark' ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                )}
            </div>
            </div>
        </div>
    );
}
