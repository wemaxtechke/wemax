import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api, { apiFormData } from '../../utils/api.js';
import { cn } from '../../lib/utils.js';

export default function AdminPackages() {
    const [packages, setPackages] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });
    const [form, setForm] = useState({
        name: '', description: '', items: [{ product: '', quantity: 1 }],
        totalPrice: '', oldTotalPrice: '', freeShipping: false, category: '', tag: '',
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    const loadPackages = async () => {
        try {
            const res = await api.get('/packages', { params: { limit: 200 } });
            setPackages(res.data.packages || []);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load packages');
        }
    };
    const loadProducts = async () => {
        try {
            const res = await api.get('/products', { params: { limit: 500 } });
            setProducts(res.data.products || []);
        } catch (_) {}
    };
    useEffect(() => {
        setLoading(true);
        Promise.all([loadPackages(), loadProducts()]).finally(() => setLoading(false));
    }, []);

    const openAdd = () => {
        setEditingId(null);
        setForm({ name: '', description: '', items: [{ product: '', quantity: 1 }], totalPrice: '', oldTotalPrice: '', freeShipping: false, category: '', tag: '' });
        setImageFiles([]);
        setExistingImages([]);
        setFormOpen(true);
    };
    const openEdit = (pkg) => {
        setEditingId(pkg._id);
        setForm({
            name: pkg.name || '', description: pkg.description || '',
            items: (pkg.items && pkg.items.length) ? pkg.items.map((i) => ({ product: i.product?._id || i.product || '', quantity: i.quantity || 1 })) : [{ product: '', quantity: 1 }],
            totalPrice: String(pkg.totalPrice ?? ''), oldTotalPrice: pkg.oldTotalPrice != null ? String(pkg.oldTotalPrice) : '',
            freeShipping: !!pkg.freeShipping, category: pkg.category || '', tag: pkg.tag || '',
        });
        setImageFiles([]);
        setExistingImages(pkg.images || []);
        setFormOpen(true);
    };
    const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
    const updateItem = (index, field, value) => {
        setForm((prev) => {
            const items = [...(prev.items || [])];
            items[index] = { ...items[index], [field]: field === 'quantity' ? Number(value) || 1 : value };
            return { ...prev, items };
        });
    };
    const addItem = () => setForm((prev) => ({ ...prev, items: [...(prev.items || []), { product: '', quantity: 1 }] }));
    const removeItem = (index) => setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    const onImageChange = (e) => setImageFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
    const removeImageFile = (index) => setImageFiles((prev) => prev.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('description', form.description);
            formData.append('items', JSON.stringify((form.items || []).filter((i) => i.product).map((i) => ({ product: i.product, quantity: i.quantity || 1 }))));
            formData.append('totalPrice', form.totalPrice);
            if (form.oldTotalPrice !== '') formData.append('oldTotalPrice', form.oldTotalPrice);
            formData.append('freeShipping', form.freeShipping);
            if (form.category) formData.append('category', form.category);
            if (form.tag) formData.append('tag', form.tag);
            
            // Send files to backend - backend will upload to Cloudinary
            imageFiles.forEach((file) => formData.append('images', file));
            
            const client = apiFormData();
            if (editingId) await client.put(`/packages/${editingId}`, formData);
            else await client.post('/packages', formData);
            setFormOpen(false);
            loadPackages();
        } catch (e) {
            setError(e.response?.data?.message || (editingId ? 'Update failed' : 'Create failed'));
        } finally {
            setSaving(false);
        }
    };
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this package?')) return;
        try {
            await api.delete(`/packages/${id}`);
            loadPackages();
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
                    <h1 className={cn("text-2xl md:text-3xl font-bold", textClass)}>Packages</h1>
                    <p className={cn("mt-1 text-sm", textSecondaryClass)}>Bundle products and offer package pricing.</p>
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
                    Add Package
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
                        {packages.length === 0 ? (
                            <div className={cn("rounded-2xl border p-6 text-center shadow-sm", bgClass, borderClass, textSecondaryClass)}>
                                No packages yet.
                            </div>
                        ) : packages.map((pkg) => (
                            <div key={pkg._id} className={cn("rounded-2xl border p-4 shadow-sm", bgClass, borderClass)}>
                                <div className="flex items-start gap-3">
                                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 shrink-0">
                                        {pkg.images?.[0]?.url ? (
                                            <img src={pkg.images[0].url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className={cn("w-full h-full flex items-center justify-center text-sm", textSecondaryClass)}>
                                                —
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className={cn("font-bold text-base truncate", textClass)}>{pkg.name}</div>
                                        <div className={cn("mt-1 text-sm", textSecondaryClass)}>
                                            {(pkg.items || []).length} product(s)
                                        </div>
                                        <div className={cn("mt-2 text-lg font-extrabold", textClass)}>
                                            KES {pkg.totalPrice?.toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openEdit(pkg)}
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
                                        onClick={() => handleDelete(pkg._id)}
                                        className={cn(
                                            "px-3 py-2 rounded-xl text-sm font-semibold transition-all border",
                                            "bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500 hover:text-white"
                                        )}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop table */}
                    <div className={cn("hidden md:block overflow-x-auto rounded-xl border shadow-sm", bgClass, borderClass)}>
                        <table className="w-full border-collapse min-w-[760px]">
                            <thead>
                                <tr className={cn("border-b", borderClass)}>
                                    {['Image', 'Name', 'Items', 'Price', 'Actions'].map((h) => (
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
                                {packages.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className={cn("px-4 md:px-6 py-10 text-center", textSecondaryClass)}>
                                            No packages yet.
                                        </td>
                                    </tr>
                                ) : packages.map((pkg) => (
                                    <tr key={pkg._id} className={cn("border-b last:border-b-0 transition-colors", borderClass, hoverBgClass)}>
                                        <td className="px-4 md:px-6 py-3">
                                            {pkg.images?.[0]?.url ? (
                                                <img src={pkg.images[0].url} alt="" className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                                            ) : (
                                                <span className={cn("text-sm", textSecondaryClass)}>—</span>
                                            )}
                                        </td>
                                        <td className={cn("px-4 md:px-6 py-3 font-medium", textClass)}>{pkg.name}</td>
                                        <td className={cn("px-4 md:px-6 py-3", textSecondaryClass)}>{(pkg.items || []).length} product(s)</td>
                                        <td className={cn("px-4 md:px-6 py-3 font-semibold", textClass)}>KES {pkg.totalPrice?.toLocaleString()}</td>
                                        <td className="px-4 md:px-6 py-3">
                                            <div className="flex gap-2 flex-wrap">
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(pkg)}
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
                                                    onClick={() => handleDelete(pkg._id)}
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
                        "relative w-full sm:max-w-3xl max-h-[92vh] overflow-hidden rounded-2xl border shadow-2xl",
                        bgClass,
                        borderClass,
                        "animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
                    )}>
                        <div className={cn("px-5 sm:px-6 py-4 border-b", borderClass)}>
                            <h2 className={cn("text-lg sm:text-xl font-bold", textClass)}>{editingId ? 'Edit Package' : 'Add Package'}</h2>
                            <p className={cn("mt-1 text-sm", textSecondaryClass)}>Create a package, add products, then upload images.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(92vh-70px)]">
                            <div className="px-5 sm:px-6 py-5 overflow-y-auto space-y-4">
                                <label className="block">
                                    <span className={cn("font-semibold mb-1 block", textClass)}>Name *</span>
                                    <input
                                        value={form.name}
                                        onChange={(e) => updateForm('name', e.target.value)}
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
                                <label className="block">
                                    <span className={cn("font-semibold mb-1 block", textClass)}>Description *</span>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => updateForm('description', e.target.value)}
                                        rows={3}
                                        required
                                        className={cn(
                                            "w-full px-4 py-2 rounded-lg border transition-all resize-y min-h-[110px]",
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                            inputBgClass,
                                            borderClass,
                                            textClass
                                        )}
                                    />
                                </label>

                                <div className={cn("rounded-xl border p-4", borderClass, theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50')}>
                                    <div className={cn("text-xs uppercase tracking-wider font-semibold", textSecondaryClass)}>Products in package</div>
                                    <div className="mt-3 space-y-3">
                                        {(form.items || []).map((item, i) => (
                                            <div key={i} className="flex flex-col md:flex-row gap-2">
                                                <select
                                                    value={item.product}
                                                    onChange={(e) => updateItem(i, 'product', e.target.value)}
                                                    className={cn(
                                                        "flex-1 px-4 py-2 rounded-lg border transition-all",
                                                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                                        inputBgClass,
                                                        borderClass,
                                                        textClass
                                                    )}
                                                >
                                                    <option value="">Select product</option>
                                                    {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                                                </select>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                                                    className={cn(
                                                        "w-full md:w-28 px-4 py-2 rounded-lg border transition-all",
                                                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                                        inputBgClass,
                                                        borderClass,
                                                        textClass
                                                    )}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(i)}
                                                    className={cn(
                                                        "px-3 py-2 rounded-lg font-semibold text-sm transition-all border",
                                                        "bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500 hover:text-white"
                                                    )}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addItem}
                                            className={cn(
                                                "px-4 py-2 rounded-lg font-medium transition-all border text-sm",
                                                theme === 'dark'
                                                    ? "bg-gray-900 text-gray-200 border-gray-700 hover:bg-gray-800"
                                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                            )}
                                        >
                                            Add product
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="block">
                                        <span className={cn("font-semibold mb-1 block", textClass)}>Total Price (KES) *</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.totalPrice}
                                            onChange={(e) => updateForm('totalPrice', e.target.value)}
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
                                    <label className="block">
                                        <span className={cn("font-semibold mb-1 block", textClass)}>Old Price (KES)</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.oldTotalPrice}
                                            onChange={(e) => updateForm('oldTotalPrice', e.target.value)}
                                            className={cn(
                                                "w-full px-4 py-2 rounded-lg border transition-all",
                                                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                                inputBgClass,
                                                borderClass,
                                                textClass
                                            )}
                                        />
                                    </label>
                                </div>

                                <label className={cn("flex items-center gap-3 cursor-pointer select-none", textClass)}>
                                    <input
                                        type="checkbox"
                                        checked={form.freeShipping}
                                        onChange={(e) => updateForm('freeShipping', e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div>
                                        <div className="font-semibold">Free Shipping</div>
                                        <div className={cn("text-xs", textSecondaryClass)}>If enabled, shipping can be waived for this package.</div>
                                    </div>
                                </label>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="block">
                                        <span className={cn("font-semibold mb-1 block", textClass)}>Bundle Type *</span>
                                        <select
                                            value={form.category}
                                            onChange={(e) => updateForm('category', e.target.value)}
                                            required
                                            className={cn(
                                                "w-full px-4 py-2 rounded-lg border transition-all",
                                                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                                inputBgClass,
                                                borderClass,
                                                textClass
                                            )}
                                        >
                                            <option value="">Select bundle type</option>
                                            <option value="Premium Electronics">Premium Electronics</option>
                                            <option value="Designer Furniture">Designer Furniture</option>
                                        </select>
                                        <p className={cn("mt-1 text-xs", textSecondaryClass)}>
                                            Choose whether this bundle is for electronics or furniture.
                                        </p>
                                    </label>
                                    <label className="block">
                                        <span className={cn("font-semibold mb-1 block", textClass)}>Tag</span>
                                        <input
                                            value={form.tag}
                                            onChange={(e) => updateForm('tag', e.target.value)}
                                            placeholder="Optional: e.g. Church Sound Setup"
                                            className={cn(
                                                "w-full px-4 py-2 rounded-lg border transition-all",
                                                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                                inputBgClass,
                                                borderClass,
                                                textClass
                                            )}
                                        />
                                        <p className={cn("mt-1 text-xs", textSecondaryClass)}>
                                            Optional tag for additional categorization.
                                        </p>
                                    </label>
                                </div>

                                <div className={cn("rounded-xl border p-4", borderClass, theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50')}>
                                    <div className={cn("text-xs uppercase tracking-wider font-semibold", textSecondaryClass)}>Images</div>
                                    <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {existingImages.map((img, i) => (
                                            <div key={i} className="relative overflow-hidden rounded-lg border border-white/10">
                                                <img src={img.url} alt="" className="w-full h-20 object-cover" />
                                                <div className="absolute inset-x-0 bottom-0 bg-black/55 text-white text-[10px] py-1 text-center">
                                                    Existing
                                                </div>
                                            </div>
                                        ))}
                                        {imageFiles.map((file, i) => (
                                            <div key={`f-${i}`} className="relative overflow-hidden rounded-lg border border-white/10">
                                                <img src={URL.createObjectURL(file)} alt="" className="w-full h-20 object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImageFile(i)}
                                                    className="absolute top-1 right-1 w-7 h-7 rounded-full bg-rose-500 text-white hover:bg-rose-600"
                                                    aria-label="Remove image"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3">
                                        <label className={cn(
                                            "inline-flex items-center justify-center px-4 py-2 rounded-lg cursor-pointer transition-all border text-sm font-medium",
                                            theme === 'dark'
                                                ? "bg-gray-900 text-gray-200 border-gray-700 hover:bg-gray-800"
                                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                        )}>
                                            <input type="file" accept="image/*" multiple onChange={onImageChange} className="hidden" />
                                            Choose images
                                        </label>
                                    </div>
                                </div>
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
                                    {saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
