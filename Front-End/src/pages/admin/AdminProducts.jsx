import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api, { apiFormData } from '../../utils/api.js';
import { cn } from '../../lib/utils.js';
import { CATEGORIES, PHONE_BRANDS, LAPTOP_BRANDS } from '../../constants/categories.js';
import SmartImage from '../../components/SmartImage.jsx';

const initialSpec = { key: '', value: '' };

export default function AdminProducts() {
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });
    const { user } = useSelector((state) => state?.auth || { user: null });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        category: 'Electronics',
        subCategory: 'Phones',
        brand: '',
        newPrice: '',
        oldPrice: '',
        freeShipping: false,
        stock: '0',
        isFeatured: false,
        isFlashDeal: false,
        specifications: [{ ...initialSpec }],
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [myProductCount, setMyProductCount] = useState(null);
    const [specPasteText, setSpecPasteText] = useState('');
    const [specGenerating, setSpecGenerating] = useState(false);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/products', { params: { limit: 200 } });
            setProducts(res.data.products || []);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const loadMyProductCount = async () => {
        if (!user?.email) return;
        try {
            const res = await api.get('/products', {
                params: { limit: 1, createdByEmail: user.email },
            });
            setMyProductCount(res.data?.total ?? 0);
        } catch (e) {
            console.error('Failed to load your product count:', e);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        loadMyProductCount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.email]);

    const openAdd = () => {
        setEditingId(null);
        setForm({
            name: '',
            description: '',
            category: 'Electronics',
            subCategory: 'Phones',
            brand: '',
            newPrice: '',
            oldPrice: '',
            freeShipping: false,
            stock: '0',
            isFeatured: false,
            isFlashDeal: false,
            specifications: [{ ...initialSpec }],
        });
        setImageFiles([]);
        setExistingImages([]);
        setFormOpen(true);
    };

    const openEdit = (p) => {
        setEditingId(p._id);
        setForm({
            name: p.name || '',
            description: p.description || '',
            category: p.category || 'Electronics',
            subCategory: p.subCategory || 'Phones',
            brand: p.brand || '',
            newPrice: String(p.newPrice ?? ''),
            oldPrice: p.oldPrice != null ? String(p.oldPrice) : '',
            freeShipping: !!p.freeShipping,
            stock: String(p.stock ?? '0'),
            isFeatured: !!p.isFeatured,
            isFlashDeal: !!p.isFlashDeal,
            specifications: (p.specifications && p.specifications.length)
                ? p.specifications.map((s) => ({ key: s.key || '', value: s.value || '' }))
                : [{ ...initialSpec }],
        });
        setImageFiles([]);
        setExistingImages(p.images || []);
        setFormOpen(true);
    };

    const updateForm = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (field === 'category') {
            const subs = CATEGORIES[value] || [];
            setForm((prev) => ({ ...prev, subCategory: subs[0] || prev.subCategory }));
        }
    };

    const updateSpec = (index, field, value) => {
        setForm((prev) => {
            const specs = [...(prev.specifications || [])];
            specs[index] = { ...specs[index], [field]: value };
            return { ...prev, specifications: specs };
        });
    };

    const addSpec = () => {
        setForm((prev) => ({
            ...prev,
            specifications: [...(prev.specifications || []), { ...initialSpec }],
        }));
    };

    const removeSpec = (index) => {
        setForm((prev) => ({
            ...prev,
            specifications: prev.specifications.filter((_, i) => i !== index),
        }));
    };

    const generateSpecsFromText = async () => {
        if (!specPasteText.trim()) return;
        setSpecGenerating(true);
        try {
            const res = await api.post('/ai/parse-specs', { text: specPasteText });
            const specs = res.data?.specifications || [];
            if (Array.isArray(specs) && specs.length) {
                setForm((prev) => ({
                    ...prev,
                    specifications: specs,
                }));
            }
        } catch (e) {
            console.error('Failed to generate specifications from AI:', e);
            setError(e.response?.data?.message || 'Failed to generate specifications from AI');
        } finally {
            setSpecGenerating(false);
        }
    };

    const onImageChange = (e) => {
        const files = Array.from(e.target.files || []);
        setImageFiles((prev) => [...prev, ...files]);
    };

    const handlePasteImage = async (event) => {
        const items = event.clipboardData?.items;
        if (!items || !items.length) return;

        const imageItems = Array.from(items).filter(
            (item) => item.kind === 'file' && item.type.startsWith('image/')
        );
        if (!imageItems.length) return;

        event.preventDefault();

        const pastedFiles = await Promise.all(
            imageItems.map(
                (item, index) =>
                    new Promise((resolve) => {
                        const file = item.getAsFile();
                        if (!file) return resolve(null);
                        // Give pasted images a sensible name if missing
                        const name =
                            file.name && file.name !== 'image.png'
                                ? file.name
                                : `pasted-image-${Date.now()}-${index}.png`;
                        resolve(new File([file], name, { type: file.type }));
                    })
            )
        );

        const validFiles = pastedFiles.filter(Boolean);
        if (validFiles.length) {
            setImageFiles((prev) => [...prev, ...validFiles]);
        }
    };

    const removeImageFile = (index) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('description', form.description);
            formData.append('category', form.category);
            formData.append('subCategory', form.subCategory);
            formData.append('brand', form.brand);
            formData.append('newPrice', form.newPrice);
            if (form.oldPrice !== '') formData.append('oldPrice', form.oldPrice);
            formData.append('freeShipping', form.freeShipping);
            formData.append('stock', form.stock);
            formData.append('isFeatured', form.isFeatured);
            formData.append('isFlashDeal', form.isFlashDeal);
            formData.append('specifications', JSON.stringify(
                (form.specifications || []).filter((s) => s.key || s.value)
            ));
            
            // Send files to backend - backend will upload to Cloudinary
            imageFiles.forEach((file) => formData.append('images', file));

            const client = apiFormData();
            if (editingId) {
                await client.put(`/products/${editingId}`, formData);
            } else {
                await client.post('/products', formData);
            }
            setFormOpen(false);
            loadProducts();
            loadMyProductCount();
        } catch (e) {
            setError(e.response?.data?.message || (editingId ? 'Update failed' : 'Create failed'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            loadProducts();
            loadMyProductCount();
        } catch (e) {
            setError(e.response?.data?.message || 'Delete failed');
        }
    };

    const subOptions = CATEGORIES[form.category] || [];

    const bgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
    const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
    const textSecondaryClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    const hoverBgClass = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3 pb-4 border-b-2" style={{ borderColor: 'var(--color-border)' }}>
                <h1 className={cn("text-2xl md:text-3xl font-bold m-0", textClass)}>Products</h1>
                <button 
                    type="button"
                    onClick={openAdd}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    Add Product
                </button>
            </div>
            {user?.email && (
                <div
                    className={cn(
                        "mb-6 px-4 py-3 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2",
                        bgClass,
                        borderClass
                    )}
                >
                    <div className={cn("text-sm", textSecondaryClass)}>
                        Signed in as <span className={cn("font-semibold", textClass)}>{user.email}</span>
                    </div>
                    <div className={cn("text-sm", textSecondaryClass)}>
                        Products created by you:{' '}
                        <span className={cn("font-semibold", textClass)}>
                            {myProductCount !== null ? myProductCount : '—'}
                        </span>
                    </div>
                </div>
            )}
            {error && (
                <div className={cn(
                    "p-4 mb-6 rounded-lg border-l-4 flex items-center gap-2",
                    "bg-red-500/15 border-red-500 text-red-500"
                )} role="alert">
                    {error}
                </div>
            )}
            {loading ? (
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    {/* Mobile cards */}
                    <div className="md:hidden space-y-3">
                        {products.length === 0 ? (
                            <div className={cn("rounded-2xl border p-6 text-center shadow-sm", bgClass, borderClass, textSecondaryClass)}>
                                No products yet. Add one to get started.
                            </div>
                        ) : products.map((p) => (
                            <div key={p._id} className={cn("rounded-2xl border p-4 shadow-sm", bgClass, borderClass)}>
                                <div className="flex items-start gap-3">
                                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 shrink-0">
                                        {p.images?.[0]?.url ? (
                                            <SmartImage src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className={cn("w-full h-full flex items-center justify-center text-sm", textSecondaryClass)}>
                                                —
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className={cn("font-bold text-base truncate", textClass)}>{p.name}</div>
                                        <div className={cn("mt-1 text-sm", textSecondaryClass)}>{p.category} / {p.subCategory}</div>
                                        {p.createdByEmail && (
                                            <div className={cn("mt-1 text-xs", textSecondaryClass)}>
                                                Created by: <span className={cn("font-medium", textClass)}>{p.createdByEmail}</span>
                                            </div>
                                        )}
                                        <div className="mt-2 flex items-center justify-between gap-3">
                                            <div className={cn("text-lg font-extrabold", textClass)}>
                                                KES {p.newPrice?.toLocaleString()}
                                            </div>
                                            <div className={cn("text-sm", textSecondaryClass)}>
                                                Stock: <span className={cn("font-semibold", textClass)}>{p.stock}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openEdit(p)}
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
                                        onClick={() => handleDelete(p._id)}
                                        className={cn(
                                            "px-3 py-2 rounded-xl text-sm font-semibold transition-all border",
                                            "bg-red-500/15 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                        )}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop table */}
                    <div className={cn(
                        "hidden md:block overflow-x-auto rounded-lg border shadow-sm",
                        bgClass,
                        borderClass
                    )}>
                        <table className="w-full border-collapse min-w-[600px]">
                            <thead>
                                <tr className={cn("bg-gray-100 dark:bg-gray-900", borderClass, "border-b")}>
                                    <th className={cn("px-4 md:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky top-0", textSecondaryClass, bgClass)}>Image</th>
                                    <th className={cn("px-4 md:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky top-0", textSecondaryClass, bgClass)}>Name</th>
                                    <th className={cn("px-4 md:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky top-0", textSecondaryClass, bgClass)}>Category</th>
                                    <th className={cn("px-4 md:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky top-0", textSecondaryClass, bgClass)}>Price</th>
                                    <th className={cn("px-4 md:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky top-0", textSecondaryClass, bgClass)}>Stock</th>
                                    <th className={cn("px-4 md:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky top-0", textSecondaryClass, bgClass)}>Created By</th>
                                    <th className={cn("px-4 md:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky top-0", textSecondaryClass, bgClass)}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className={cn("px-4 md:px-6 py-8 text-center", textSecondaryClass)}>
                                            No products yet. Add one to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((p) => (
                                        <tr key={p._id} className={cn("border-b transition-colors", borderClass, hoverBgClass)}>
                                            <td className="px-4 md:px-6 py-3">
                                                {p.images?.[0]?.url ? (
                                                    <SmartImage src={p.images[0].url} alt="" className="w-12 h-12 object-cover rounded" />
                                                ) : (
                                                    <span className={textSecondaryClass}>—</span>
                                                )}
                                            </td>
                                            <td className={cn("px-4 md:px-6 py-3 font-medium", textClass)}>{p.name}</td>
                                            <td className={cn("px-4 md:px-6 py-3", textSecondaryClass)}>{p.category} / {p.subCategory}</td>
                                            <td className={cn("px-4 md:px-6 py-3 font-semibold text-blue-600", textClass)}>KES {p.newPrice?.toLocaleString()}</td>
                                            <td className={cn("px-4 md:px-6 py-3", textClass)}>{p.stock}</td>
                                            <td className={cn("px-4 md:px-6 py-3", textSecondaryClass)}>
                                                {p.createdByEmail ? (
                                                    <span className="break-all">{p.createdByEmail}</span>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td className="px-4 md:px-6 py-3">
                                                <div className="flex gap-2 flex-wrap">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => openEdit(p)}
                                                        className={cn(
                                                            "px-2 py-1 text-xs rounded font-medium transition-all",
                                                            "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
                                                            "border border-gray-300 dark:border-gray-600",
                                                            "hover:bg-gray-200 dark:hover:bg-gray-600"
                                                        )}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleDelete(p._id)}
                                                        className={cn(
                                                            "px-2 py-1 text-xs rounded font-medium transition-all",
                                                            "bg-red-500/15 border border-red-500 text-red-500",
                                                            "hover:bg-red-500 hover:text-white"
                                                        )}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {formOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setFormOpen(false)} />
                    <div className={cn(
                        "relative bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-xl",
                        "max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8",
                        "shadow-2xl animate-in slide-in-from-bottom-4 duration-300",
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white',
                        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    )}>
                        <h2 className={cn(
                            "text-2xl font-bold mb-6 pb-4 border-b-2",
                            textClass,
                            borderClass
                        )}>
                            {editingId ? 'Edit Product' : 'Add Product'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <label className={cn("block", textClass)}>
                                <span className="font-semibold mb-1 block">Name *</span>
                                <input
                                    value={form.name}
                                    onChange={(e) => updateForm('name', e.target.value)}
                                    required
                                    className={cn(
                                        "w-full px-4 py-2 rounded-lg border transition-all",
                                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                        bgClass === 'bg-gray-800' ? 'bg-gray-900' : 'bg-gray-50',
                                        borderClass,
                                        textClass
                                    )}
                                />
                            </label>
                            <label className={cn("block", textClass)}>
                                <span className="font-semibold mb-1 block">Description *</span>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => updateForm('description', e.target.value)}
                                    rows={3}
                                    required
                                    className={cn(
                                        "w-full px-4 py-2 rounded-lg border transition-all resize-y min-h-[100px]",
                                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                        bgClass === 'bg-gray-800' ? 'bg-gray-900' : 'bg-gray-50',
                                        borderClass,
                                        textClass
                                    )}
                                />
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className={cn("block", textClass)}>
                                    <span className="font-semibold mb-1 block">Category *</span>
                                    <select
                                        value={form.category}
                                        onChange={(e) => updateForm('category', e.target.value)}
                                        className={cn(
                                            "w-full px-4 py-2 rounded-lg border transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                            bgClass === 'bg-gray-800' ? 'bg-gray-900' : 'bg-gray-50',
                                            borderClass,
                                            textClass
                                        )}
                                    >
                                        {Object.keys(CATEGORIES).map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </label>
                                <label className={cn("block", textClass)}>
                                    <span className="font-semibold mb-1 block">Sub-category *</span>
                                    <select
                                        value={form.subCategory}
                                        onChange={(e) => updateForm('subCategory', e.target.value)}
                                        className={cn(
                                            "w-full px-4 py-2 rounded-lg border transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                            bgClass === 'bg-gray-800' ? 'bg-gray-900' : 'bg-gray-50',
                                            borderClass,
                                            textClass
                                        )}
                                    >
                                        {subOptions.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <label className={cn("block", textClass)}>
                                <span className="font-semibold mb-1 block">Brand</span>
                                {form.category === 'Electronics' && form.subCategory === 'Phones' ? (
                                    <select
                                        value={form.brand}
                                        onChange={(e) => updateForm('brand', e.target.value)}
                                        className={cn(
                                            "w-full px-4 py-2 rounded-lg border transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                            bgClass === 'bg-gray-800' ? 'bg-gray-900' : 'bg-gray-50',
                                            borderClass,
                                            textClass
                                        )}
                                    >
                                        <option value="">Select brand</option>
                                        {PHONE_BRANDS.map((b) => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                ) : form.category === 'Electronics' && form.subCategory === 'Laptops' ? (
                                    <select
                                        value={form.brand}
                                        onChange={(e) => updateForm('brand', e.target.value)}
                                        className={cn(
                                            "w-full px-4 py-2 rounded-lg border transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                            bgClass === 'bg-gray-800' ? 'bg-gray-900' : 'bg-gray-50',
                                            borderClass,
                                            textClass
                                        )}
                                    >
                                        <option value="">Select brand</option>
                                        {LAPTOP_BRANDS.map((b) => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        value={form.brand}
                                        onChange={(e) => updateForm('brand', e.target.value)}
                                        placeholder="Optional"
                                        className={cn(
                                            "w-full px-4 py-2 rounded-lg border transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                            bgClass === 'bg-gray-800' ? 'bg-gray-900' : 'bg-gray-50',
                                            borderClass,
                                            textClass
                                        )}
                                    />
                                )}
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className={cn("block", textClass)}>
                                    <span className="font-semibold mb-1 block">New Price (KES) *</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.newPrice}
                                        onChange={(e) => updateForm('newPrice', e.target.value)}
                                        required
                                        className={cn(
                                            "w-full px-4 py-2 rounded-lg border transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                            bgClass === 'bg-gray-800' ? 'bg-gray-900' : 'bg-gray-50',
                                            borderClass,
                                            textClass
                                        )}
                                    />
                                </label>
                                <label className={cn("block", textClass)}>
                                    <span className="font-semibold mb-1 block">Old Price (KES) — optional</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.oldPrice}
                                        onChange={(e) => updateForm('oldPrice', e.target.value)}
                                        className={cn(
                                            "w-full px-4 py-2 rounded-lg border transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                            bgClass === 'bg-gray-800' ? 'bg-gray-900' : 'bg-gray-50',
                                            borderClass,
                                            textClass
                                        )}
                                    />
                                </label>
                            </div>
                            <label className={cn("block", textClass)}>
                                <span className="font-semibold mb-1 block">Stock *</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.stock}
                                    onChange={(e) => updateForm('stock', e.target.value)}
                                    required
                                    className={cn(
                                        "w-full px-4 py-2 rounded-lg border transition-all",
                                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                        bgClass === 'bg-gray-800' ? 'bg-gray-900' : 'bg-gray-50',
                                        borderClass,
                                        textClass
                                    )}
                                />
                            </label>
                            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                                <label className={cn("flex items-center gap-2 cursor-pointer", textClass)}>
                                    <input
                                        type="checkbox"
                                        checked={form.freeShipping}
                                        onChange={(e) => updateForm('freeShipping', e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>Free Shipping</span>
                                </label>
                                <label className={cn("flex items-center gap-2 cursor-pointer", textClass)}>
                                    <input
                                        type="checkbox"
                                        checked={form.isFeatured}
                                        onChange={(e) => updateForm('isFeatured', e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>Featured</span>
                                </label>
                                <label className={cn("flex items-center gap-2 cursor-pointer", textClass)}>
                                    <input
                                        type="checkbox"
                                        checked={form.isFlashDeal}
                                        onChange={(e) => updateForm('isFlashDeal', e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>Flash Deal</span>
                                </label>
                            </div>

                            <div className={cn("mt-6 pt-4 border-t", borderClass)}>
                                <span className={cn("block font-semibold mb-3", textClass)}>Specifications</span>
                                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4 mb-3">
                                    <div className="space-y-2">
                                        {(form.specifications || []).map((spec, i) => (
                                            <div key={i} className="flex flex-col md:flex-row gap-2">
                                                <input
                                                    placeholder="Key"
                                                    value={spec.key}
                                                    onChange={(e) => updateSpec(i, 'key', e.target.value)}
                                                    className={cn(
                                                        "flex-1 px-4 py-2 rounded-lg border transition-all",
                                                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                                        bgClass === 'bg-gray-800' ? 'bg-gray-900' : 'bg-gray-50',
                                                        borderClass,
                                                        textClass
                                                    )}
                                                />
                                                <input
                                                    placeholder="Value"
                                                    value={spec.value}
                                                    onChange={(e) => updateSpec(i, 'value', e.target.value)}
                                                    className={cn(
                                                        "flex-1 px-4 py-2 rounded-lg border transition-all",
                                                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                                        bgClass === 'bg-gray-800' ? 'bg-gray-900' : 'bg-gray-50',
                                                        borderClass,
                                                        textClass
                                                    )}
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeSpec(i)}
                                                    className={cn(
                                                        "px-3 py-2 text-xs rounded font-medium transition-all",
                                                        "bg-red-500/15 border border-red-500 text-red-500",
                                                        "hover:bg-red-500 hover:text-white"
                                                    )}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                        <button 
                                            type="button" 
                                            onClick={addSpec}
                                            className={cn(
                                                "px-3 py-2 text-xs rounded font-medium transition-all",
                                                "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
                                                "border border-gray-300 dark:border-gray-600",
                                                "hover:bg-gray-200 dark:hover:bg-gray-600"
                                            )}
                                        >
                                            Add row
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <textarea
                                            placeholder={`Paste raw specifications here, e.g.\nFront Camera\t5MP\nBack Camera\t8MP\nDisplay\t5.0″ inch\n...`}
                                            value={specPasteText}
                                            onChange={(e) => setSpecPasteText(e.target.value)}
                                            rows={6}
                                            className={cn(
                                                "w-full px-3 py-2 rounded-lg border text-sm resize-y min-h-[120px]",
                                                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                                bgClass === 'bg-gray-800' ? 'bg-gray-900' : 'bg-gray-50',
                                                borderClass,
                                                textClass
                                            )}
                                        />
                                        <button
                                            type="button"
                                            disabled={specGenerating || !specPasteText.trim()}
                                            onClick={generateSpecsFromText}
                                            className={cn(
                                                "inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                                                "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white",
                                                "hover:shadow-md hover:-translate-y-0.5",
                                                "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                                            )}
                                        >
                                            {specGenerating ? 'Generating with AI...' : 'Generate specs from text (AI)'}
                                        </button>
                                        <p className={cn("text-[11px] leading-snug", textSecondaryClass)}>
                                            Paste specs like: <span className="font-mono">Front Camera&nbsp;&nbsp;5MP</span> on each line.
                                            The AI will convert them into key/value rows automatically.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className={cn("mt-6 pt-4 border-t", borderClass)}
                                onPaste={handlePasteImage}
                            >
                                <span className={cn("block font-semibold mb-3", textClass)}>Images</span>
                                <div className="flex flex-wrap gap-3 mb-3">
                                    {existingImages.map((img, i) => (
                                        <div key={i} className="relative">
                                            <SmartImage src={img.url} alt="" className="w-20 h-20 object-cover rounded" />
                                            <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1 rounded-b">Existing</span>
                                        </div>
                                    ))}
                                    {imageFiles.map((file, i) => (
                                        <div key={`f-${i}`} className="relative">
                                            <img src={URL.createObjectURL(file)} alt="" className="w-20 h-20 object-cover rounded" />
                                            <button 
                                                type="button" 
                                                onClick={() => removeImageFile(i)}
                                                className={cn(
                                                    "absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs",
                                                    "bg-red-500 text-white hover:bg-red-600"
                                                )}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <label className={cn(
                                        "inline-block px-4 py-2 rounded-lg cursor-pointer transition-all",
                                        "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
                                        "border border-gray-300 dark:border-gray-600",
                                        "hover:bg-gray-200 dark:hover:bg-gray-600"
                                    )}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={onImageChange}
                                            className="hidden"
                                        />
                                        Choose images from device
                                    </label>
                                    <div
                                        className={cn(
                                            "flex-1 px-4 py-2 rounded-lg border text-xs sm:text-sm",
                                            "border-dashed",
                                            borderClass,
                                            textSecondaryClass
                                        )}
                                    >
                                        You can also <span className="font-semibold">paste images directly</span> from
                                        your clipboard here (Ctrl+V / Cmd+V) after copying them.
                                    </div>
                                </div>
                            </div>

                            <div className={cn("flex flex-col sm:flex-row gap-3 mt-8 pt-4 border-t", borderClass)}>
                                <button 
                                    type="button" 
                                    onClick={() => setFormOpen(false)}
                                    className={cn(
                                        "px-6 py-2 rounded-lg font-medium transition-all",
                                        "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
                                        "border border-gray-300 dark:border-gray-600",
                                        "hover:bg-gray-200 dark:hover:bg-gray-600",
                                        "sm:flex-1"
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
                                        "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
                                        "sm:flex-1"
                                    )}
                                >
                                    {saving ? 'Saving...' : (editingId ? 'Update Product' : 'Create Product')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
