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
                <div className={cn('mb-4 flex items-center justify-between border-b-2 pb-3 sm:mb-6 sm:pb-4', borderClass)}>
                    <h1 className={cn('text-xl font-bold sm:text-2xl md:text-3xl', textClass)}>Flash Sale</h1>
                </div>
                <div className="flex min-h-[240px] items-center justify-center sm:min-h-[300px]">
                    <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600 sm:h-12 sm:w-12" />
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className={cn('mb-2 border-b-2 pb-3 sm:mb-4 sm:pb-4', borderClass)}>
                <div className="min-w-0">
                    <h1 className={cn('text-xl font-bold sm:text-2xl md:text-3xl', textClass)}>Flash Sale</h1>
                    <p className={cn('mt-0.5 text-xs sm:mt-1 sm:text-sm', textSecondaryClass)}>Control countdown timer and visibility on the home page.</p>
                </div>
            </div>

            {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border-l-4 border-rose-500 bg-rose-500/15 p-3 text-sm text-rose-400 sm:mb-6 sm:p-4" role="alert">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border-l-4 border-emerald-500 bg-emerald-500/15 p-3 text-sm text-emerald-400 sm:mb-6 sm:p-4" role="status">
                    {success}
                </div>
            )}

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4">
                <div className={cn('overflow-hidden rounded-xl border shadow-sm lg:col-span-2 sm:rounded-2xl', bgClass, borderClass)}>
                    <div className={cn('border-b px-4 py-3 sm:px-6 sm:py-4', borderClass, theme === 'dark' ? 'bg-gray-900/60' : 'bg-gray-50')}>
                        <h2 className={cn('text-base font-bold sm:text-lg', textClass)}>Settings</h2>
                        <p className={cn('mt-0.5 text-xs sm:mt-1 sm:text-sm', textSecondaryClass)}>Update timer duration and activation state.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4 sm:space-y-5 sm:px-6 sm:py-5">
                        <label className={cn("flex items-start gap-3 cursor-pointer select-none", textClass)}>
                            <input
                                type="checkbox"
                                checked={settings.isActive}
                                onChange={(e) => handleChange('isActive', e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                                <div className="text-sm font-semibold sm:text-base">Flash Sale Active</div>
                                <div className={cn('text-[11px] sm:text-xs', textSecondaryClass)}>
                                    When enabled, the timer appears on the home page.
                                </div>
                            </div>
                        </label>

                        <div className={cn('rounded-lg border p-3 sm:rounded-xl sm:p-4', borderClass, theme === 'dark' ? 'bg-gray-900/40' : 'bg-gray-50')}>
                            <div className={cn('text-[10px] font-semibold uppercase tracking-wider sm:text-xs', textSecondaryClass)}>Timer</div>
                            <div className="mt-2 grid grid-cols-1 gap-2 sm:mt-3 sm:grid-cols-3 sm:gap-3">
                                <label className="block">
                                    <span className={cn('mb-1 block text-sm font-semibold sm:text-base', textClass)}>Hours</span>
                                    <input
                                        id="hours"
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={settings.hours}
                                        onChange={(e) => handleChange('hours', Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                                        required
                                        className={cn(
                                            'w-full rounded-lg border px-3 py-2 text-sm transition-all sm:px-4 sm:text-base',
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                            inputBgClass,
                                            borderClass,
                                            textClass
                                        )}
                                    />
                                </label>
                                <label className="block">
                                    <span className={cn('mb-1 block text-sm font-semibold sm:text-base', textClass)}>Minutes</span>
                                    <input
                                        id="minutes"
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={settings.minutes}
                                        onChange={(e) => handleChange('minutes', Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                                        required
                                        className={cn(
                                            'w-full rounded-lg border px-3 py-2 text-sm transition-all sm:px-4 sm:text-base',
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                            inputBgClass,
                                            borderClass,
                                            textClass
                                        )}
                                    />
                                </label>
                                <label className="block">
                                    <span className={cn('mb-1 block text-sm font-semibold sm:text-base', textClass)}>Seconds</span>
                                    <input
                                        id="seconds"
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={settings.seconds}
                                        onChange={(e) => handleChange('seconds', Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                                        required
                                        className={cn(
                                            'w-full rounded-lg border px-3 py-2 text-sm transition-all sm:px-4 sm:text-base',
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

                        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:gap-3 sm:pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className={cn(
                                    'rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-2 text-sm font-semibold !text-white transition-all hover:!text-white sm:px-6 sm:text-base',
                                    'hover:shadow-lg hover:-translate-y-0.5',
                                    'disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none',
                                )}
                            >
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                            <button
                                type="button"
                                onClick={loadSettings}
                                className={cn(
                                    'rounded-lg border px-4 py-2 text-sm font-medium transition-all sm:px-6 sm:text-base',
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

                <div className={cn('overflow-hidden rounded-xl border shadow-sm sm:rounded-2xl', bgClass, borderClass)}>
                    <div className={cn('border-b px-4 py-3 sm:px-5 sm:py-4', borderClass, theme === 'dark' ? 'bg-gray-900/60' : 'bg-gray-50')}>
                        <h2 className={cn('text-base font-bold sm:text-lg', textClass)}>Preview</h2>
                        <p className={cn('mt-0.5 text-xs sm:mt-1 sm:text-sm', textSecondaryClass)}>How it will appear to customers.</p>
                    </div>
                    <div className="p-4 sm:p-5">
                        <div className={cn(
                            'rounded-xl border p-4 text-center sm:rounded-2xl sm:p-5',
                            borderClass,
                            theme === 'dark' ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-slate-50 to-white"
                        )}>
                            <div className={cn('text-[10px] font-semibold uppercase tracking-wider sm:text-xs', textSecondaryClass)}>
                                Flash Sale Timer
                            </div>
                            <div className={cn(
                                'mt-2 text-xl font-extrabold tabular-nums sm:mt-3 sm:text-3xl',
                                'bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent'
                            )}>
                                {String(settings.hours).padStart(2, '0')}h:
                                {String(settings.minutes).padStart(2, '0')}m:
                                {String(settings.seconds).padStart(2, '0')}s
                            </div>
                            <div className={cn('mt-2 text-xs sm:mt-3 sm:text-sm', settings.isActive ? "text-emerald-400" : "text-rose-400")}>
                                {settings.isActive ? 'Active' : 'Inactive'}
                            </div>
                        </div>
                        <div className={cn('mt-3 text-[11px] sm:mt-4 sm:text-xs', textSecondaryClass)}>
                            If the feature is inactive, the home page timer should be hidden.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
