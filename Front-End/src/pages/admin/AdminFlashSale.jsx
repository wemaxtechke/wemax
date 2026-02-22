import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../utils/api.js';
import { cn } from '../../lib/utils.js';

export default function AdminFlashSale() {
    const [settings, setSettings] = useState({
        hours: 1,
        minutes: 45,
        seconds: 30,
        isActive: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const response = await api.get('/flash-sale');
            setSettings(response.data);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load flash sale settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            await api.put('/flash-sale', settings);
            setSuccess('Flash sale settings updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to update flash sale settings');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setSettings((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const bgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
    const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
    const textSecondaryClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    const inputBgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';

    if (loading) {
        return (
            <div>
                <div className={cn("flex items-center justify-between mb-6 pb-4 border-b-2", borderClass)}>
                    <h1 className={cn("text-2xl md:text-3xl font-bold", textClass)}>Flash Sale</h1>
                </div>
                <div className="flex justify-center items-center min-h-[320px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2", borderClass)}>
                <div>
                    <h1 className={cn("text-2xl md:text-3xl font-bold", textClass)}>Flash Sale</h1>
                    <p className={cn("mt-1 text-sm", textSecondaryClass)}>Control countdown timer and visibility on the home page.</p>
                </div>
            </div>

            {error && (
                <div className="p-4 mb-6 rounded-lg border-l-4 flex items-center gap-2 bg-rose-500/15 border-rose-500 text-rose-400" role="alert">
                    {error}
                </div>
            )}
            {success && (
                <div className="p-4 mb-6 rounded-lg border-l-4 flex items-center gap-2 bg-emerald-500/15 border-emerald-500 text-emerald-400" role="status">
                    {success}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className={cn("lg:col-span-2 rounded-2xl border shadow-sm overflow-hidden", bgClass, borderClass)}>
                    <div className={cn("px-5 sm:px-6 py-4 border-b", borderClass, theme === 'dark' ? 'bg-gray-900/60' : 'bg-gray-50')}>
                        <h2 className={cn("text-lg font-bold", textClass)}>Settings</h2>
                        <p className={cn("mt-1 text-sm", textSecondaryClass)}>Update timer duration and activation state.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="px-5 sm:px-6 py-5 space-y-5">
                        <label className={cn("flex items-start gap-3 cursor-pointer select-none", textClass)}>
                            <input
                                type="checkbox"
                                checked={settings.isActive}
                                onChange={(e) => handleChange('isActive', e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                                <div className="font-semibold">Flash Sale Active</div>
                                <div className={cn("text-xs", textSecondaryClass)}>
                                    When enabled, the timer appears on the home page.
                                </div>
                            </div>
                        </label>

                        <div className={cn("rounded-xl border p-4", borderClass, theme === 'dark' ? 'bg-gray-900/40' : 'bg-gray-50')}>
                            <div className={cn("text-xs uppercase tracking-wider font-semibold", textSecondaryClass)}>Timer</div>
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <label className="block">
                                    <span className={cn("font-semibold mb-1 block", textClass)}>Hours</span>
                                    <input
                                        id="hours"
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={settings.hours}
                                        onChange={(e) => handleChange('hours', Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
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
                                    <span className={cn("font-semibold mb-1 block", textClass)}>Minutes</span>
                                    <input
                                        id="minutes"
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={settings.minutes}
                                        onChange={(e) => handleChange('minutes', Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
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
                                    <span className={cn("font-semibold mb-1 block", textClass)}>Seconds</span>
                                    <input
                                        id="seconds"
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={settings.seconds}
                                        onChange={(e) => handleChange('seconds', Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
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
                            </div>
                            <p className={cn("mt-3 text-xs", textSecondaryClass)}>
                                Tip: values reset when the timer reaches zero.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
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
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                            <button
                                type="button"
                                onClick={loadSettings}
                                className={cn(
                                    "px-6 py-2 rounded-lg font-medium transition-all border",
                                    theme === 'dark'
                                        ? "bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800"
                                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                )}
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                <div className={cn("rounded-2xl border shadow-sm overflow-hidden", bgClass, borderClass)}>
                    <div className={cn("px-5 py-4 border-b", borderClass, theme === 'dark' ? 'bg-gray-900/60' : 'bg-gray-50')}>
                        <h2 className={cn("text-lg font-bold", textClass)}>Preview</h2>
                        <p className={cn("mt-1 text-sm", textSecondaryClass)}>How it will appear to customers.</p>
                    </div>
                    <div className="p-5">
                        <div className={cn(
                            "rounded-2xl border p-5 text-center",
                            borderClass,
                            theme === 'dark' ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-slate-50 to-white"
                        )}>
                            <div className={cn("text-xs uppercase tracking-wider font-semibold", textSecondaryClass)}>
                                Flash Sale Timer
                            </div>
                            <div className={cn(
                                "mt-3 text-3xl font-extrabold tabular-nums",
                                "bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent"
                            )}>
                                {String(settings.hours).padStart(2, '0')}h:
                                {String(settings.minutes).padStart(2, '0')}m:
                                {String(settings.seconds).padStart(2, '0')}s
                            </div>
                            <div className={cn("mt-3 text-sm", settings.isActive ? "text-emerald-400" : "text-rose-400")}>
                                {settings.isActive ? 'Active' : 'Inactive'}
                            </div>
                        </div>
                        <div className={cn("mt-4 text-xs", textSecondaryClass)}>
                            If the feature is inactive, the home page timer should be hidden.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
