import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../utils/api.js';
import { cn } from '../../lib/utils.js';

const CARRIERS = ['G4S', 'Parcel Grid', 'Fargo wells', 'Shuttles and bus services'];

export default function AdminShippingRates() {
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        carrier: CARRIERS[0],
        locationName: '',
        regionCode: '',
        price: '',
        isDefault: false,
        allowCashOnDelivery: true,
    });
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });

    const loadRates = async () => {
        try {
            const res = await api.get('/shipping-rates');
            setRates(res.data || []);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load rates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRates();
    }, []);

    const openAdd = () => {
        setEditingId(null);
        setForm({
            carrier: CARRIERS[0],
            locationName: '',
            regionCode: '',
            price: '',
            isDefault: false,
            allowCashOnDelivery: true,
        });
        setFormOpen(true);
    };

    const openEdit = (r) => {
        setEditingId(r._id);
        setForm({
            carrier: r.carrier || CARRIERS[0],
            locationName: r.locationName || '',
            regionCode: r.regionCode || '',
            price: String(r.price ?? ''),
            isDefault: !!r.isDefault,
            allowCashOnDelivery: r.allowCashOnDelivery ?? true,
        });
        setFormOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            const payload = {
                carrier: form.carrier,
                locationName: form.locationName,
                regionCode: form.regionCode,
                price: Number(form.price) || 0,
                isDefault: form.isDefault,
                allowCashOnDelivery: form.allowCashOnDelivery,
            };
            if (editingId) {
                await api.put(`/shipping-rates/${editingId}`, payload);
            } else {
                await api.post('/shipping-rates', payload);
            }
            setFormOpen(false);
            loadRates();
        } catch (e) {
            setError(e.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this shipping rate?')) return;
        try {
            await api.delete(`/shipping-rates/${id}`);
            loadRates();
        } catch (e) {
            setError(e.response?.data?.message || 'Delete failed');
        }
    };

    const bgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
    const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
    const textSecondaryClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    const hoverBgClass = theme === 'dark' ? 'hover:bg-gray-700/40' : 'hover:bg-gray-50';
    const inputBgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';

    return (
        <div>
            <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2", borderClass)}>
                <div>
                    <h1 className={cn("text-2xl md:text-3xl font-bold", textClass)}>Shipping Rates</h1>
                    <p className={cn("mt-1 text-sm", textSecondaryClass)}>Set delivery pricing per carrier and location, and control cash-on-delivery.</p>
                </div>
                <button
                    type="button"
                    onClick={openAdd}
                    className={cn(
                        "px-4 py-2 rounded-lg font-semibold transition-all",
                        "bg-gradient-to-r from-blue-600 to-blue-800 text-white",
                        "hover:shadow-lg hover:-translate-y-0.5"
                    )}
                >
                    Add Rate
                </button>
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
                        {rates.length === 0 ? (
                            <div className={cn("rounded-2xl border p-6 text-center shadow-sm", bgClass, borderClass, textSecondaryClass)}>
                                No shipping rates. Add one for checkout to work.
                            </div>
                        ) : rates.map((r) => (
                            <div key={r._id} className={cn("rounded-2xl border p-4 shadow-sm", bgClass, borderClass)}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className={cn("font-bold text-base truncate", textClass)}>{r.locationName}</div>
                                        <div className={cn("mt-1 text-sm", textSecondaryClass)}>
                                            Region: {r.regionCode || '—'}
                                        </div>
                                        <div className={cn("mt-1 text-xs", textSecondaryClass)}>
                                            Carrier: <span className={cn("font-semibold", textClass)}>{r.carrier || '—'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {r.isDefault && (
                                            <span className="shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                                                Default
                                            </span>
                                        )}
                                        <span className={cn(
                                            "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border",
                                            r.allowCashOnDelivery
                                                ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                                : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                                        )}>
                                            {r.allowCashOnDelivery ? 'Cash on delivery: On' : 'Cash on delivery: Off'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between gap-3">
                                    <div className={cn("text-sm", textSecondaryClass)}>
                                        Price
                                        <div className={cn("text-lg font-extrabold", textClass)}>KES {r.price?.toLocaleString()}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEdit(r)}
                                            className={cn(
                                                "px-3 py-2 rounded-xl text-sm font-semibold transition-all border",
                                                theme === 'dark'
                                                    ? "bg-gray-900 text-gray-200 border-gray-700 hover:bg-gray-800"
                                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                            )}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(r._id)}
                                            className={cn(
                                                "px-3 py-2 rounded-xl text-sm font-semibold transition-all border",
                                                "bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500 hover:text-white"
                                            )}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop table */}
                    <div className={cn("hidden md:block overflow-x-auto rounded-xl border shadow-sm", bgClass, borderClass)}>
                        <table className="w-full border-collapse min-w-[700px]">
                            <thead>
                                <tr className={cn("border-b", borderClass)}>
                                    {['Carrier', 'Location', 'Region code', 'Price (KES)', 'Default', 'Cash on delivery', 'Actions'].map((h) => (
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
                                {rates.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className={cn("px-4 md:px-6 py-10 text-center", textSecondaryClass)}>
                                            No shipping rates. Add one for checkout to work.
                                        </td>
                                    </tr>
                                ) : rates.map((r) => (
                                    <tr key={r._id} className={cn("border-b last:border-b-0 transition-colors", borderClass, hoverBgClass)}>
                                        <td className={cn("px-4 md:px-6 py-3 font-medium", textClass)}>{r.carrier || '—'}</td>
                                        <td className={cn("px-4 md:px-6 py-3 font-medium", textClass)}>{r.locationName}</td>
                                        <td className={cn("px-4 md:px-6 py-3", textSecondaryClass)}>{r.regionCode || '—'}</td>
                                        <td className={cn("px-4 md:px-6 py-3 font-semibold", textClass)}>KES {r.price?.toLocaleString()}</td>
                                        <td className="px-4 md:px-6 py-3">
                                            {r.isDefault ? (
                                                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                                                    Default
                                                </span>
                                            ) : (
                                                <span className={cn("text-sm", textSecondaryClass)}>—</span>
                                            )}
                                        </td>
                                        <td className="px-4 md:px-6 py-3">
                                            <span className={cn(
                                                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border",
                                                r.allowCashOnDelivery
                                                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                                    : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                                            )}>
                                                {r.allowCashOnDelivery ? 'On' : 'Off'}
                                            </span>
                                        </td>
                                        <td className="px-4 md:px-6 py-3">
                                            <div className="flex gap-2 flex-wrap">
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(r)}
                                                    className={cn(
                                                        "px-3 py-1.5 text-xs rounded-lg font-medium transition-all border",
                                                        theme === 'dark'
                                                            ? "bg-gray-900 text-gray-200 border-gray-700 hover:bg-gray-800"
                                                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                                    )}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(r._id)}
                                                    className={cn(
                                                        "px-3 py-1.5 text-xs rounded-lg font-semibold transition-all border",
                                                        "bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500 hover:text-white"
                                                    )}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {formOpen && (
                <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-2 sm:p-4" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setFormOpen(false)} />
                    <div className={cn(
                        "relative w-full sm:max-w-xl max-h-[92vh] overflow-hidden rounded-2xl border shadow-2xl",
                        bgClass,
                        borderClass,
                        "animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
                    )}>
                        <div className={cn("px-5 sm:px-6 py-4 border-b", borderClass)}>
                            <h2 className={cn("text-lg sm:text-xl font-bold", textClass)}>{editingId ? 'Edit Shipping Rate' : 'Add Shipping Rate'}</h2>
                            <p className={cn("mt-1 text-sm", textSecondaryClass)}>Set a price for a location (and optionally mark as default).</p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(92vh-70px)]">
                            <div className="px-5 sm:px-6 py-5 overflow-y-auto space-y-4">
                                <label className="block">
                                    <span className={cn("font-semibold mb-1 block", textClass)}>Carrier *</span>
                                    <select
                                        value={form.carrier}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                carrier: e.target.value,
                                                // If carrier is shuttles & bus services, force COD off
                                                allowCashOnDelivery:
                                                    e.target.value === 'Shuttles and bus services'
                                                        ? false
                                                        : p.allowCashOnDelivery,
                                            }))
                                        }
                                        required
                                        className={cn(
                                            "w-full px-4 py-2 rounded-lg border transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                            inputBgClass,
                                            borderClass,
                                            textClass
                                        )}
                                    >
                                        {CARRIERS.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="block">
                                    <span className={cn("font-semibold mb-1 block", textClass)}>Location name *</span>
                                    <input
                                        value={form.locationName}
                                        onChange={(e) => setForm((p) => ({ ...p, locationName: e.target.value }))}
                                        required
                                        placeholder="e.g. Nairobi"
                                        className={cn(
                                            "w-full px-4 py-2 rounded-lg border transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                            inputBgClass,
                                            borderClass,
                                            textClass
                                        )}
                                    />
                                </label>
                                <label className="block">
                                    <span className={cn("font-semibold mb-1 block", textClass)}>Region code</span>
                                    <input
                                        value={form.regionCode}
                                        onChange={(e) => setForm((p) => ({ ...p, regionCode: e.target.value }))}
                                        placeholder="e.g. NBI"
                                        className={cn(
                                            "w-full px-4 py-2 rounded-lg border transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                            inputBgClass,
                                            borderClass,
                                            textClass
                                        )}
                                    />
                                </label>
                                <label className="block">
                                    <span className={cn("font-semibold mb-1 block", textClass)}>Price (KES) *</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.price}
                                        onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                                        required
                                        className={cn(
                                            "w-full px-4 py-2 rounded-lg border transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                            inputBgClass,
                                            borderClass,
                                            textClass
                                        )}
                                    />
                                </label>
                                <label className={cn("flex items-center gap-3 cursor-pointer select-none", textClass)}>
                                    <input
                                        type="checkbox"
                                        checked={form.isDefault}
                                        onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div>
                                        <div className="font-semibold">Use as default rate</div>
                                        <div className={cn("text-xs", textSecondaryClass)}>Used when a customer location doesn’t match a specific rate for this carrier.</div>
                                    </div>
                                </label>
                                <label className={cn("flex items-center gap-3 cursor-pointer select-none", textClass)}>
                                    <input
                                        type="checkbox"
                                        checked={form.allowCashOnDelivery}
                                        disabled={form.carrier === 'Shuttles and bus services'}
                                        onChange={(e) => setForm((p) => ({ ...p, allowCashOnDelivery: e.target.checked }))}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                                    />
                                    <div>
                                        <div className="font-semibold">Allow cash on delivery</div>
                                        <div className={cn("text-xs", textSecondaryClass)}>
                                            Controls whether customers can see the pay-on-delivery option for this carrier and location.
                                            Disabled for Shuttles and bus services.
                                        </div>
                                    </div>
                                </label>
                            </div>

                            <div className={cn("px-5 sm:px-6 py-4 border-t flex flex-col sm:flex-row gap-3", borderClass)}>
                            <button
                                type="button"
                                onClick={() => setFormOpen(false)}
                                className={cn(
                                    "px-6 py-2 rounded-lg font-medium transition-all border",
                                    theme === 'dark'
                                        ? "bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800"
                                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                )}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className={cn(
                                    "px-6 py-2 rounded-lg font-semibold transition-all",
                                    "bg-gradient-to-r from-blue-600 to-blue-800 text-white",
                                    "hover:shadow-lg hover:-translate-y-0.5",
                                    "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                                )}
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
