import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, removeFromCart } from '../redux/slices/cartSlice.js';
import { Link } from 'react-router-dom';
import { FaTrash, FaShoppingCart } from 'react-icons/fa';
import wemaxLogo from '../assets/wemax-logo.jpg';
import SmartImage from '../components/SmartImage.jsx';

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
        <div className="relative w-full overflow-x-hidden">
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundColor: theme === 'dark' ? '#030712' : '#eef2ff',
                    backgroundImage: theme === 'dark' ? bgImageDark : bgImageLight,
                    backgroundAttachment: 'fixed',
                    backgroundSize: 'cover',
                }}
            />
            <div className={`relative z-10 w-full py-3 sm:py-12 md:py-16 px-2.5 sm:px-6 md:px-8 ${theme === 'dark' ? 'bg-gray-950/35' : 'bg-white/45'} backdrop-blur-[3px]`}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <h1 className={`mb-3 flex items-center gap-1.5 text-lg font-bold sm:mb-8 sm:gap-3 sm:text-3xl md:text-4xl lg:text-5xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <FaShoppingCart className="shrink-0 text-base text-blue-600 sm:text-3xl md:text-4xl" /> Shopping Cart
                </h1>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 md:gap-8 lg:grid-cols-3">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            {(items.length > 0 || packages.length > 0) ? (
                                <div className="space-y-1.5 sm:space-y-4">
                                    {/* Product Items */}
                                    {items.map((item) => (
                                        <div 
                                            key={item._id} 
                                            className={`flex items-start gap-1.5 rounded-md border p-2 sm:items-center sm:gap-4 sm:rounded-lg sm:p-4 md:p-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                                        >
                                            <SmartImage
                                                src={item.product?.images?.[0]?.url || wemaxLogo}
                                                alt={item.product?.name || 'Product'}
                                                className="h-10 w-10 shrink-0 rounded-md object-cover sm:h-16 sm:w-16 sm:rounded-lg md:h-20 md:w-20"
                                            />
                                            <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:gap-2 sm:items-center sm:justify-between">
                                                <div className="min-w-0">
                                                    <h3 className={`line-clamp-2 text-[11px] font-semibold sm:text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                        {item.product?.name}
                                                    </h3>
                                                    <p className={`mt-px text-[9px] sm:mt-1 sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        Qty: {item.quantity}
                                                    </p>
                                                </div>
                                                <p className={`shrink-0 text-xs font-bold sm:text-right sm:text-lg md:text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                    KES {item.price?.toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveProduct(item._id)}
                                                disabled={removingId === item._id}
                                                className={`shrink-0 rounded-md p-1 transition-colors sm:rounded-lg sm:p-2 ${theme === 'dark' ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-100'} disabled:cursor-not-allowed disabled:opacity-50`}
                                                aria-label="Remove from cart"
                                            >
                                                {removingId === item._id ? (
                                                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent sm:h-4 sm:w-4" />
                                                ) : (
                                                    <FaTrash className="text-[10px] sm:text-sm" />
                                                )}
                                            </button>
                                        </div>
                                    ))}

                                    {/* Package Items */}
                                    {packages.map((pkg) => (
                                        <div 
                                            key={pkg._id} 
                                            className={`flex items-start gap-1.5 rounded-md border p-2 sm:items-center sm:gap-4 sm:rounded-lg sm:p-4 md:p-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                                        >
                                            <SmartImage
                                                src={pkg.package?.images?.[0]?.url || wemaxLogo}
                                                alt={pkg.package?.name || 'Package'}
                                                className="h-10 w-10 shrink-0 rounded-md object-cover sm:h-16 sm:w-16 sm:rounded-lg md:h-20 md:w-20"
                                            />
                                            <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:gap-2 sm:items-center sm:justify-between">
                                                <div className="min-w-0">
                                                    <h3 className={`line-clamp-2 text-[11px] font-semibold sm:text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                        📦 {pkg.package?.name}
                                                    </h3>
                                                    <p className={`mt-px text-[9px] sm:mt-1 sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        Qty: {pkg.quantity}
                                                    </p>
                                                </div>
                                                <p className="shrink-0 text-xs font-bold text-blue-600 sm:text-right sm:text-lg md:text-xl">
                                                    KES {pkg.price?.toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePackage(pkg._id)}
                                                disabled={removingId === pkg._id}
                                                className={`shrink-0 rounded-md p-1 transition-colors sm:rounded-lg sm:p-2 ${theme === 'dark' ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-100'} disabled:cursor-not-allowed disabled:opacity-50`}
                                                aria-label="Remove package from cart"
                                            >
                                                {removingId === pkg._id ? (
                                                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent sm:h-4 sm:w-4" />
                                                ) : (
                                                    <FaTrash className="text-[10px] sm:text-sm" />
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
                        <div className={`h-fit rounded-lg border p-3 sm:p-6 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                            <h2 className={`mb-3 text-sm font-bold sm:mb-6 sm:text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Order Summary
                            </h2>
                            
                            <div className="mb-3 space-y-2 border-b border-gray-300 pb-3 sm:mb-6 sm:space-y-4 sm:pb-6">
                                <div className="flex justify-between text-xs sm:text-base">
                                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                        Subtotal
                                    </span>
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        KES {subtotal?.toLocaleString() || '0'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs sm:text-base">
                                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                        Shipping
                                    </span>
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        TBD
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs sm:text-base">
                                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                        Tax
                                    </span>
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        TBD
                                    </span>
                                </div>
                            </div>

                            <div className="mb-3 flex justify-between sm:mb-6">
                                <span className={`text-sm font-bold sm:text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Total</span>
                                <span className={`text-base font-bold sm:text-2xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    KES {subtotal?.toLocaleString() || '0'}
                                </span>
                            </div>

                            <Link 
                                to="/checkout" 
                                className="mb-2 block w-full rounded-lg bg-blue-600 py-2 text-center text-xs font-bold text-white transition-colors duration-300 hover:bg-blue-700 sm:mb-3 sm:py-3 sm:text-base"
                            >
                                Proceed to Checkout
                            </Link>

                            <Link 
                                to="/products" 
                                className={`block w-full rounded-lg border py-2 text-center text-xs font-semibold transition-colors duration-300 sm:py-3 sm:text-base ${theme === 'dark' ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
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
