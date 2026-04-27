import { useEffect } from 'react';
import api from '../../utils/api.js';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaShoppingBag, FaDollarSign, FaUsers, FaClock } from 'react-icons/fa';
import { cn } from '../../lib/utils.js';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });

    useEffect(() => {
        api.get('/analytics/dashboard')
            .then((res) => {
                setStats(res.data);
            })
            .catch((err) => {
                console.error('Failed to load dashboard stats:', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const bgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
    const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
    const textSecondaryClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    const hoverBorderClass = theme === 'dark' ? 'hover:border-blue-600' : 'hover:border-blue-500';

    const statCardClass = cn(
        'group relative overflow-hidden rounded-lg border p-4 transition-all duration-300 sm:rounded-xl sm:p-6 md:p-8',
        'hover:-translate-y-0.5 hover:shadow-lg md:hover:-translate-y-1',
        bgClass,
        borderClass,
        hoverBorderClass,
    );
    const statIconClass = cn(
        'pointer-events-none absolute top-3 right-3 text-3xl opacity-10 sm:top-4 sm:right-4 sm:text-4xl md:text-5xl',
        theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
    );
    const statLabelClass = cn(
        'mb-1 text-[10px] font-semibold uppercase tracking-wide sm:mb-2 sm:text-xs sm:tracking-wider md:mb-3',
        textSecondaryClass,
    );
    const statValueClass =
        'break-words bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-xl font-bold tabular-nums leading-none tracking-tight text-transparent sm:text-2xl md:text-3xl lg:text-4xl';

    if (loading) {
        return (
            <div className="flex min-h-[240px] items-center justify-center sm:min-h-[320px]">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600 sm:h-14 sm:w-14 md:h-16 md:w-16" />
            </div>
        );
    }

    return (
        <div>
            <h1 className={cn(
                'mb-4 text-xl font-bold sm:mb-6 sm:text-2xl md:mb-8 md:text-3xl',
                textClass,
            )}>
                Dashboard
            </h1>
            {stats ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
                    <div className={statCardClass}>
                        <div className="absolute top-0 left-0 h-full w-1 origin-top scale-y-0 bg-gradient-to-b from-blue-600 to-blue-800 transition-transform duration-300 group-hover:scale-y-100" />
                        <FaShoppingBag className={statIconClass} aria-hidden />
                        <h3 className={statLabelClass}>Total Orders</h3>
                        <p className={statValueClass}>{stats.totalOrders || 0}</p>
                    </div>

                    <div className={statCardClass}>
                        <div className="absolute top-0 left-0 h-full w-1 origin-top scale-y-0 bg-gradient-to-b from-blue-600 to-blue-800 transition-transform duration-300 group-hover:scale-y-100" />
                        <FaDollarSign className={statIconClass} aria-hidden />
                        <h3 className={statLabelClass}>Total Revenue</h3>
                        <p className={statValueClass}>KES {stats.totalRevenue?.toLocaleString() || '0'}</p>
                    </div>

                    <div className={statCardClass}>
                        <div className="absolute top-0 left-0 h-full w-1 origin-top scale-y-0 bg-gradient-to-b from-blue-600 to-blue-800 transition-transform duration-300 group-hover:scale-y-100" />
                        <FaUsers className={statIconClass} aria-hidden />
                        <h3 className={statLabelClass}>Total Customers</h3>
                        <p className={statValueClass}>{stats.totalCustomers || 0}</p>
                    </div>

                    <div className={statCardClass}>
                        <div className="absolute top-0 left-0 h-full w-1 origin-top scale-y-0 bg-gradient-to-b from-blue-600 to-blue-800 transition-transform duration-300 group-hover:scale-y-100" />
                        <FaClock className={statIconClass} aria-hidden />
                        <h3 className={statLabelClass}>Pending Payments</h3>
                        <p className={statValueClass}>{stats.pendingPayments || 0}</p>
                    </div>
                </div>
            ) : (
                <div className={cn(
                    "p-8 text-center rounded-lg border",
                    bgClass,
                    borderClass,
                    textSecondaryClass
                )}>
                    No statistics available
                </div>
            )}
        </div>
    );
}
