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

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className={cn(
                "text-2xl md:text-3xl font-bold mb-6 md:mb-8 flex items-center gap-3",
                textClass
            )}>
                Dashboard
            </h1>
            {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                    <div className={cn(
                        "relative p-6 md:p-8 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group overflow-hidden",
                        bgClass,
                        borderClass,
                        hoverBorderClass
                    )}>
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-600 to-blue-800 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                        <FaShoppingBag className={cn(
                            "absolute top-4 right-4 text-4xl md:text-5xl opacity-10",
                            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        )} />
                        <h3 className={cn(
                            "text-xs uppercase tracking-wider font-semibold mb-3",
                            textSecondaryClass
                        )}>
                            Total Orders
                        </h3>
                        <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            {stats.totalOrders || 0}
                        </p>
                    </div>

                    <div className={cn(
                        "relative p-6 md:p-8 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group overflow-hidden",
                        bgClass,
                        borderClass,
                        hoverBorderClass
                    )}>
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-600 to-blue-800 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                        <FaDollarSign className={cn(
                            "absolute top-4 right-4 text-4xl md:text-5xl opacity-10",
                            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        )} />
                        <h3 className={cn(
                            "text-xs uppercase tracking-wider font-semibold mb-3",
                            textSecondaryClass
                        )}>
                            Total Revenue
                        </h3>
                        <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            KES {stats.totalRevenue?.toLocaleString() || '0'}
                        </p>
                    </div>

                    <div className={cn(
                        "relative p-6 md:p-8 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group overflow-hidden",
                        bgClass,
                        borderClass,
                        hoverBorderClass
                    )}>
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-600 to-blue-800 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                        <FaUsers className={cn(
                            "absolute top-4 right-4 text-4xl md:text-5xl opacity-10",
                            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        )} />
                        <h3 className={cn(
                            "text-xs uppercase tracking-wider font-semibold mb-3",
                            textSecondaryClass
                        )}>
                            Total Customers
                        </h3>
                        <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            {stats.totalCustomers || 0}
                        </p>
                    </div>

                    <div className={cn(
                        "relative p-6 md:p-8 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group overflow-hidden",
                        bgClass,
                        borderClass,
                        hoverBorderClass
                    )}>
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-600 to-blue-800 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                        <FaClock className={cn(
                            "absolute top-4 right-4 text-4xl md:text-5xl opacity-10",
                            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        )} />
                        <h3 className={cn(
                            "text-xs uppercase tracking-wider font-semibold mb-3",
                            textSecondaryClass
                        )}>
                            Pending Payments
                        </h3>
                        <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            {stats.pendingPayments || 0}
                        </p>
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
