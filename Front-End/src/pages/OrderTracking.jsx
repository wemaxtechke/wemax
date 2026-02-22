import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById, clearCurrentOrder } from '../redux/slices/orderSlice.js';
import { FaBox, FaTruck, FaCheckCircle, FaMoneyBillWave } from 'react-icons/fa';

const TRACKING_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

export default function OrderTracking() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentOrder: order, loading } = useSelector((state) => state.orders);
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });

    useEffect(() => {
        if (id) {
            dispatch(fetchOrderById(id));
        }
        return () => {
            dispatch(clearCurrentOrder());
        };
    }, [dispatch, id]);

    const paymentStatus = order?.payment?.status || (order?.payment?.paidAt ? 'Paid' : 'Pending');
    const trackingStatus = order?.status || 'Pending';

    const isStepCompleted = (step) => {
        const indexOf = (s) => TRACKING_STEPS.indexOf(s);
        const currentIndex = indexOf(trackingStatus);
        const stepIndex = indexOf(step);
        if (currentIndex === -1 || stepIndex === -1) return false;
        return currentIndex >= stepIndex;
    };

    const containerBg = theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50';
    const cardBg = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
    const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
    const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

    return (
        <div className={`w-full min-height-screen ${containerBg} py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8`}>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between gap-4 mb-8">
                    <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-3 ${textPrimary}`}>
                        <FaTruck className="text-blue-600" />
                        Track Your Order
                    </h1>
                    <Link
                        to="/orders"
                        className="text-sm font-medium text-blue-500 hover:text-blue-400 underline underline-offset-4"
                    >
                        Back to My Orders
                    </Link>
                </div>

                {loading || !order ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Summary card */}
                        <div className={`rounded-2xl shadow-md border px-4 sm:px-6 py-5 sm:py-6 ${cardBg} ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-center">
                                <div className="space-y-2">
                                    <p className={`text-xs sm:text-sm font-semibold uppercase tracking-wide ${textSecondary}`}>
                                        Order
                                    </p>
                                    <p className={`text-lg sm:text-2xl font-bold flex items-center gap-2 ${textPrimary}`}>
                                        <FaBox className="text-blue-500" />
                                        #{String(order._id).slice(-8).toUpperCase()}
                                    </p>
                                    <p className={`text-sm ${textSecondary}`}>
                                        Placed on{' '}
                                        <span className="font-semibold">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </span>
                                    </p>
                                </div>

                                <div className="space-y-3 sm:text-right">
                                    <div>
                                        <p className={`text-xs sm:text-sm font-semibold uppercase tracking-wide ${textSecondary}`}>
                                            Total
                                        </p>
                                        <p className="text-xl sm:text-2xl font-bold text-blue-500">
                                            KES {order.total?.toLocaleString() || '0'}
                                        </p>
                                    </div>

                                    <div className="flex sm:justify-end gap-2 flex-wrap">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                                            paymentStatus === 'Paid'
                                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                        }`}>
                                            <FaMoneyBillWave className="text-current" />
                                            Payment: {paymentStatus}
                                        </span>
                                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                                            trackingStatus === 'Delivered'
                                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                                : trackingStatus === 'Shipped'
                                                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                                                : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                                        }`}>
                                            <FaTruck className="text-current" />
                                            Tracking: {trackingStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tracking timeline */}
                        <div className={`rounded-2xl shadow-md border px-4 sm:px-6 py-5 sm:py-6 ${cardBg} ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                            <h2 className={`text-lg sm:text-xl font-semibold mb-4 ${textPrimary}`}>
                                Delivery Progress
                            </h2>
                            <ol className="relative border-l border-dashed border-blue-500/40 ml-3 space-y-5">
                                {TRACKING_STEPS.map((step) => {
                                    const completed = isStepCompleted(step);
                                    return (
                                        <li key={step} className="ml-4">
                                            <div className={`absolute -left-[9px] w-4 h-4 rounded-full flex items-center justify-center ${
                                                completed
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-500/20 text-gray-400'
                                            }`}>
                                                {completed ? (
                                                    <FaCheckCircle className="w-3 h-3" />
                                                ) : (
                                                    <span className="w-2 h-2 rounded-full bg-gray-400/60" />
                                                )}
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
                                                <p className={`font-semibold ${textPrimary}`}>
                                                    {step}
                                                </p>
                                                <p className={`text-sm ${textSecondary}`}>
                                                    {step === 'Pending' && 'Your order is pending confirmation.'}
                                                    {step === 'Processing' && 'Your order is being prepared.'}
                                                    {step === 'Shipped' && 'Your package is on the way.'}
                                                    {step === 'Delivered' && 'Your package has been delivered.'}
                                                </p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>

                        {/* Shipping and items */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className={`rounded-2xl shadow-md border px-4 sm:px-6 py-5 sm:py-6 ${cardBg} ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                                <h2 className={`text-lg sm:text-xl font-semibold mb-3 ${textPrimary}`}>
                                    Shipping Details
                                </h2>
                                <p className={`text-sm ${textSecondary}`}>
                                    <span className="font-semibold">Location: </span>
                                    {order.shippingLocation || '—'}
                                </p>
                                <p className={`mt-2 text-sm ${textSecondary}`}>
                                    <span className="font-semibold">Address: </span>
                                    {order.shippingAddress?.name ? `${order.shippingAddress.name}, ` : ''}
                                    {order.shippingAddress?.addressLine ? `${order.shippingAddress.addressLine}, ` : ''}
                                    {order.shippingAddress?.city ? `${order.shippingAddress.city}, ` : ''}
                                    {order.shippingAddress?.region || ''}
                                </p>
                            </div>

                            <div className={`rounded-2xl shadow-md border px-4 sm:px-6 py-5 sm:py-6 ${cardBg} ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                                <h2 className={`text-lg sm:text-xl font-semibold mb-3 ${textPrimary}`}>
                                    Items in this Order
                                </h2>
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                    {(order.items || []).map((item, i) => (
                                        <div key={i} className="flex items-start justify-between gap-3 text-sm">
                                            <div>
                                                <p className={`font-semibold ${textPrimary}`}>
                                                    {item.product?.name || 'Product'}
                                                </p>
                                                <p className={textSecondary}>Qty {item.quantity}</p>
                                            </div>
                                            <p className={`font-semibold ${textPrimary}`}>
                                                KES {(item.price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                    {(order.packages || []).map((pkg, i) => (
                                        <div key={`p-${i}`} className="flex items-start justify-between gap-3 text-sm">
                                            <div>
                                                <p className={`font-semibold ${textPrimary}`}>
                                                    {pkg.package?.name || 'Package'}
                                                </p>
                                                <p className={textSecondary}>Qty {pkg.quantity}</p>
                                            </div>
                                            <p className={`font-semibold ${textPrimary}`}>
                                                KES {(pkg.price * pkg.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

