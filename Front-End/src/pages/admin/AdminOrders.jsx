import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../utils/api.js';
import { cn } from '../../lib/utils.js';

const TRACKING_STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updating, setUpdating] = useState(false);
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });

    const loadOrders = async () => {
        setLoading(true);
        try {
            const params = statusFilter ? { status: statusFilter, limit: 200 } : { limit: 200 };
            const res = await api.get('/orders', { params });
            setOrders(res.data.orders || []);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [statusFilter]);

    const openDetail = async (id) => {
        try {
            const res = await api.get(`/orders/${id}`);
            setSelectedOrder(res.data);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load order');
        }
    };

    const updateStatus = async (orderId, status) => {
        setUpdating(true);
        try {
            await api.patch(`/orders/${orderId}/status`, { status });
            loadOrders();
            if (selectedOrder && selectedOrder._id === orderId) {
                const res = await api.get(`/orders/${orderId}`);
                setSelectedOrder(res.data);
            }
        } catch (e) {
            setError(e.response?.data?.message || 'Update failed');
        } finally {
            setUpdating(false);
        }
    };

    const confirmPayment = async (orderId) => {
        setUpdating(true);
        try {
            await api.patch(`/orders/${orderId}/payment-confirm`);
            loadOrders();
            if (selectedOrder && selectedOrder._id === orderId) {
                const res = await api.get(`/orders/${orderId}`);
                setSelectedOrder(res.data);
            }
        } catch (e) {
            setError(e.response?.data?.message || 'Confirm failed');
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleString() : '—';

    const bgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
    const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
    const textSecondaryClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    const hoverBgClass = theme === 'dark' ? 'hover:bg-gray-700/40' : 'hover:bg-gray-50';
    const inputBgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';

    const statusBadgeClass = (status) => {
        const map = {
            Pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
            Paid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
            Processing: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
            Shipped: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
            Delivered: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
            Cancelled: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        };
        return map[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    };

    return (
        <div>
            <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2", borderClass)}>
                <h1 className={cn("text-2xl md:text-3xl font-bold", textClass)}>Orders</h1>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <label className="sr-only" htmlFor="statusFilter">Status filter</label>
                    <select
                        id="statusFilter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={cn(
                            "w-full sm:w-[220px] px-4 py-2 rounded-lg border transition-all",
                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                            inputBgClass,
                            borderClass,
                            textClass
                        )}
                    >
                        <option value="">All tracking statuses</option>
                        {TRACKING_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {error && (
                <div className="p-4 mb-6 rounded-lg border-l-4 flex items-center gap-2 bg-rose-500/15 border-rose-500 text-rose-400" role="alert">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center min-h-[320px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                </div>
            ) : (
                <>
                    {/* Mobile cards */}
                    <div className="md:hidden space-y-3">
                        {orders.length === 0 ? (
                            <div className={cn("rounded-2xl border p-6 text-center shadow-sm", bgClass, borderClass, textSecondaryClass)}>
                                No orders.
                            </div>
                        ) : orders.map((o) => (
                            <div key={o._id} className={cn("rounded-2xl border p-4 shadow-sm", bgClass, borderClass)}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className={cn("font-bold text-base", textClass)}>Order #{String(o._id).slice(-8)}</div>
                                        <div className={cn("mt-1 text-sm truncate", textSecondaryClass)}>
                                            {o.customer?.name || '—'} · {o.customer?.email || '—'}
                                        </div>
                                        <div className={cn("mt-1 text-xs", textSecondaryClass)}>{formatDate(o.createdAt)}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border", statusBadgeClass(o.payment?.status || (o.payment?.paidAt ? 'Paid' : 'Pending')))}>
                                            Payment: {o.payment?.status || (o.payment?.paidAt ? 'Paid' : 'Pending')}
                                        </span>
                                        <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border", statusBadgeClass(o.status))}>
                                            Tracking: {o.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between gap-3">
                                    <div className={cn("text-sm", textSecondaryClass)}>
                                        Total
                                        <div className={cn("text-lg font-extrabold", textClass)}>KES {o.total?.toLocaleString()}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            className={cn(
                                                "px-3 py-2 rounded-xl text-sm font-semibold transition-all border",
                                                theme === 'dark'
                                                    ? "bg-gray-900 text-gray-200 border-gray-700 hover:bg-gray-800"
                                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                            )}
                                            onClick={() => openDetail(o._id)}
                                        >
                                            View
                                        </button>
                                        {(o.payment?.status || (o.payment?.paidAt ? 'Paid' : 'Pending')) === 'Pending' ? (
                                            <button
                                                type="button"
                                                className={cn(
                                                    "px-3 py-2 rounded-xl text-sm font-semibold transition-all border",
                                                    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-white",
                                                    "disabled:opacity-60 disabled:cursor-not-allowed"
                                                )}
                                                onClick={() => confirmPayment(o._id)}
                                                disabled={updating}
                                            >
                                                Confirm
                                            </button>
                                        ) : (
                                            <div />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop table */}
                    <div className={cn("hidden md:block overflow-x-auto rounded-xl border shadow-sm", bgClass, borderClass)}>
                        <table className="w-full border-collapse min-w-[760px]">
                            <thead>
                                <tr className={cn("border-b", borderClass)}>
                                    {['Order ID', 'Customer', 'Total', 'Payment', 'Tracking', 'Date', 'Actions'].map((h) => (
                                        <th
                                            key={h}
                                            className={cn(
                                                "px-4 md:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider",
                                                textSecondaryClass,
                                                theme === 'dark' ? 'bg-gray-900/60' : 'bg-gray-50'
                                            )}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className={cn("px-4 md:px-6 py-10 text-center", textSecondaryClass)}>
                                            No orders.
                                        </td>
                                    </tr>
                                ) : orders.map((o) => (
                                    <tr key={o._id} className={cn("border-b last:border-b-0 transition-colors", borderClass, hoverBgClass)}>
                                        <td className={cn("px-4 md:px-6 py-3 font-medium", textClass)}>#{String(o._id).slice(-8)}</td>
                                        <td className={cn("px-4 md:px-6 py-3", textSecondaryClass)}>
                                            <div className={cn("font-medium", textClass)}>{o.customer?.name || '—'}</div>
                                            <div className="text-xs">{o.customer?.email || '—'}</div>
                                        </td>
                                        <td className={cn("px-4 md:px-6 py-3 font-semibold", textClass)}>
                                            KES {o.total?.toLocaleString()}
                                        </td>
                                        <td className="px-4 md:px-6 py-3">
                                            <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border", statusBadgeClass(o.payment?.status || (o.payment?.paidAt ? 'Paid' : 'Pending')))}>
                                                {o.payment?.status || (o.payment?.paidAt ? 'Paid' : 'Pending')}
                                            </span>
                                        </td>
                                        <td className="px-4 md:px-6 py-3">
                                            <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border", statusBadgeClass(o.status))}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className={cn("px-4 md:px-6 py-3", textSecondaryClass)}>{formatDate(o.createdAt)}</td>
                                        <td className="px-4 md:px-6 py-3">
                                            <div className="flex gap-2 flex-wrap">
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        "px-3 py-1.5 text-xs rounded-lg font-medium transition-all border",
                                                        theme === 'dark'
                                                            ? "bg-gray-900 text-gray-200 border-gray-700 hover:bg-gray-800"
                                                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                                    )}
                                                    onClick={() => openDetail(o._id)}
                                                >
                                                    View
                                                </button>
                                                {(o.payment?.status || (o.payment?.paidAt ? 'Paid' : 'Pending')) === 'Pending' && (
                                                    <button
                                                        type="button"
                                                        className={cn(
                                                            "px-3 py-1.5 text-xs rounded-lg font-semibold transition-all border",
                                                            "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-white",
                                                            "disabled:opacity-60 disabled:cursor-not-allowed"
                                                        )}
                                                        onClick={() => confirmPayment(o._id)}
                                                        disabled={updating}
                                                    >
                                                        Confirm payment
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {selectedOrder && (
                <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-2 sm:p-4" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
                    <div className={cn(
                        "relative w-full sm:max-w-3xl max-h-[92vh] overflow-hidden rounded-2xl border shadow-2xl",
                        bgClass,
                        borderClass,
                        "animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
                    )}>
                        <div className={cn("flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b", borderClass)}>
                            <div>
                                <h2 className={cn("text-lg sm:text-xl font-bold", textClass)}>
                                    Order #{String(selectedOrder._id).slice(-8)}
                                </h2>
                                <div className={cn("mt-1 text-sm", textSecondaryClass)}>
                                    {formatDate(selectedOrder.createdAt)}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedOrder(null)}
                                className={cn(
                                    "shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl border transition-all",
                                    theme === 'dark'
                                        ? "bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800"
                                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                )}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="px-5 sm:px-6 py-4 overflow-y-auto max-h-[calc(92vh-140px)]">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className={cn("rounded-xl border p-4", borderClass, theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50')}>
                                    <div className={cn("text-xs uppercase tracking-wider font-semibold", textSecondaryClass)}>Customer</div>
                                    <div className={cn("mt-2 font-semibold", textClass)}>{selectedOrder.customer?.name || '—'}</div>
                                    <div className={cn("text-sm", textSecondaryClass)}>{selectedOrder.customer?.email || '—'}</div>
                                    <div className={cn("text-sm", textSecondaryClass)}>{selectedOrder.customer?.phone || '—'}</div>
                                </div>

                                <div className={cn("rounded-xl border p-4", borderClass, theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50')}>
                                    <div className={cn("text-xs uppercase tracking-wider font-semibold", textSecondaryClass)}>Totals</div>
                                    <div className={cn("mt-2 text-sm", textSecondaryClass)}>
                                        Subtotal: <span className={cn("font-semibold", textClass)}>KES {selectedOrder.subtotal?.toLocaleString() || '—'}</span>
                                    </div>
                                    <div className={cn("text-sm", textSecondaryClass)}>
                                        Shipping: <span className={cn("font-semibold", textClass)}>KES {selectedOrder.shippingCost?.toLocaleString() || '—'}</span>
                                    </div>
                                    <div className={cn("mt-2 text-lg font-bold", textClass)}>
                                        Total: KES {selectedOrder.total?.toLocaleString() || '—'}
                                    </div>
                                    <div className="mt-3 space-y-1">
                                        <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border", statusBadgeClass(selectedOrder.payment?.status || (selectedOrder.payment?.paidAt ? 'Paid' : 'Pending')))}>
                                            Payment: {selectedOrder.payment?.status || (selectedOrder.payment?.paidAt ? 'Paid' : 'Pending')}
                                        </span>
                                        <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border", statusBadgeClass(selectedOrder.status))}>
                                            Tracking: {selectedOrder.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={cn("mt-4 rounded-xl border p-4", borderClass, theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50')}>
                                <div className={cn("text-xs uppercase tracking-wider font-semibold", textSecondaryClass)}>Delivery</div>
                                <div className={cn("mt-2 text-sm", textSecondaryClass)}>
                                    <span className={cn("font-semibold", textClass)}>Shipping location:</span> {selectedOrder.shippingLocation || '—'}
                                </div>
                                <div className={cn("mt-1 text-sm", textSecondaryClass)}>
                                    <span className={cn("font-semibold", textClass)}>Address:</span>{' '}
                                    {selectedOrder.shippingAddress?.name ? `${selectedOrder.shippingAddress.name}, ` : ''}
                                    {selectedOrder.shippingAddress?.addressLine ? `${selectedOrder.shippingAddress.addressLine}, ` : ''}
                                    {selectedOrder.shippingAddress?.city ? `${selectedOrder.shippingAddress.city}, ` : ''}
                                    {selectedOrder.shippingAddress?.region || '—'}
                                </div>
                            </div>

                            {selectedOrder.payment?.proofImage?.url && (
                                <div className={cn("mt-4 rounded-xl border p-4", borderClass, theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50')}>
                                    <div className={cn("text-xs uppercase tracking-wider font-semibold", textSecondaryClass)}>Proof of payment</div>
                                    <a
                                        href={selectedOrder.payment.proofImage.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-2 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 underline underline-offset-4"
                                    >
                                        View image
                                    </a>
                                </div>
                            )}

                            <div className={cn("mt-4 rounded-xl border p-4", borderClass, theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50')}>
                                <div className={cn("text-xs uppercase tracking-wider font-semibold mb-2", textSecondaryClass)}>Items</div>
                                <div className="space-y-2">
                                    {(selectedOrder.items || []).map((item, i) => (
                                        <div key={i} className={cn("flex items-start justify-between gap-3 text-sm", textSecondaryClass)}>
                                            <div>
                                                <div className={cn("font-semibold", textClass)}>{item.product?.name || 'Product'}</div>
                                                <div className="text-xs">Qty {item.quantity}</div>
                                            </div>
                                            <div className={cn("font-semibold", textClass)}>
                                                KES {(item.price * item.quantity).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                    {(selectedOrder.packages || []).map((pkg, i) => (
                                        <div key={`p-${i}`} className={cn("flex items-start justify-between gap-3 text-sm", textSecondaryClass)}>
                                            <div>
                                                <div className={cn("font-semibold", textClass)}>{pkg.package?.name || 'Package'}</div>
                                                <div className="text-xs">Qty {pkg.quantity}</div>
                                            </div>
                                            <div className={cn("font-semibold", textClass)}>
                                                KES {(pkg.price * pkg.quantity).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                            <div className={cn("px-5 sm:px-6 py-4 border-t flex flex-col sm:flex-row gap-3", borderClass)}>
                            <div className="flex-1">
                                <label className="sr-only" htmlFor="orderStatusSelect">Update tracking status</label>
                                <select
                                    id="orderStatusSelect"
                                    value={selectedOrder.status}
                                    onChange={(e) => updateStatus(selectedOrder._id, e.target.value)}
                                    disabled={updating}
                                    className={cn(
                                        "w-full px-4 py-2 rounded-lg border transition-all",
                                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                        inputBgClass,
                                        borderClass,
                                        textClass,
                                        "disabled:opacity-60 disabled:cursor-not-allowed"
                                    )}
                                >
                                    {TRACKING_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            {(selectedOrder.payment?.status || (selectedOrder.payment?.paidAt ? 'Paid' : 'Pending')) === 'Pending' && (
                                <button
                                    type="button"
                                    onClick={() => confirmPayment(selectedOrder._id)}
                                    disabled={updating}
                                    className={cn(
                                        "px-6 py-2 rounded-lg font-semibold transition-all",
                                        "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white",
                                        "hover:shadow-lg hover:-translate-y-0.5",
                                        "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                                    )}
                                >
                                    Confirm payment
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setSelectedOrder(null)}
                                className={cn(
                                    "px-6 py-2 rounded-lg font-medium transition-all border",
                                    theme === 'dark'
                                        ? "bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800"
                                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                )}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
