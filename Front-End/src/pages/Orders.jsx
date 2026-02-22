import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../redux/slices/orderSlice.js';
import { FaBox, FaCheckCircle, FaHourglassHalf, FaInfoCircle, FaFilePdf } from 'react-icons/fa';
import api from '../utils/api.js';

export default function Orders() {
    const dispatch = useDispatch();
    const { items: orders, loading } = useSelector((state) => state.orders);
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    const getTrackingBadge = (status) => {
        const s = status || 'Pending';
        let color = 'bg-gray-100 text-gray-800';
        if (s === 'Delivered') color = 'bg-green-100 text-green-800';
        else if (s === 'Shipped') color = 'bg-blue-100 text-blue-800';
        else if (s === 'Processing') color = 'bg-indigo-100 text-indigo-800';
        else if (s === 'Pending') color = 'bg-amber-100 text-amber-800';
        return { label: s, className: color };
    };

    const downloadQuotation = async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}/quotation`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `quotation-${orderId.slice(-8)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to download quotation:', error);
        }
    };

    return (
        <div className={`w-full min-h-screen ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'} py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8`}>
            <div className="max-w-4xl mx-auto">
                <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-8 flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <FaBox className="text-blue-600" /> My Orders
                </h1>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <div 
                                    key={order._id} 
                                    className={`p-4 md:p-6 rounded-lg border transition-all ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
                                        {/* Order ID */}
                                        <div>
                                            <p className={`text-xs sm:text-sm font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase mb-1`}>
                                                Order ID
                                            </p>
                                            <p className={`text-base sm:text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                #{order._id?.slice(-6)?.toUpperCase()}
                                            </p>
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <p className={`text-xs sm:text-sm font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase mb-1`}>
                                                Tracking Status
                                            </p>
                                            {(() => {
                                                const { label, className } = getTrackingBadge(order.status);
                                                return (
                                                    <div className="flex items-center gap-2">
                                                        <FaInfoCircle className="text-blue-500" />
                                                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${className}`}>
                                                            {label}
                                                        </span>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {/* Date */}
                                        <div>
                                            <p className={`text-xs sm:text-sm font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase mb-1`}>
                                                Ordered On
                                            </p>
                                            <p className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        {/* Total */}
                                        <div className="space-y-2">
                                            <p className={`text-xs sm:text-sm font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase mb-1`}>
                                                Total
                                            </p>
                                            <p className="text-lg md:text-2xl font-bold text-blue-600">
                                                KES {order.total?.toLocaleString() || '0'}
                                            </p>
                                            <div className="flex flex-col gap-2">
                                                <Link
                                                    to={`/orders/${order._id}/track`}
                                                    className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                                                >
                                                    Track this order
                                                </Link>
                                                <button
                                                    onClick={() => downloadQuotation(order._id)}
                                                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-emerald-500 hover:text-emerald-400 underline underline-offset-4"
                                                >
                                                    <FaFilePdf className="text-xs" />
                                                    Download quotation
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={`text-center py-12 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                <FaBox className="text-5xl mx-auto mb-4 opacity-50" />
                                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    You have no orders yet
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
