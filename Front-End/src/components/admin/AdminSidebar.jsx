import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaBox, FaGift, FaShoppingBag, FaTruck, FaComments, FaClock, FaTimes } from 'react-icons/fa';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { cn } from '../../lib/utils.js';

export default function AdminSidebar({ isOpen, onClose }) {
    const location = useLocation();
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });
    const sidebarRef = useRef(null);

    const menuItems = [
        { path: '/admin', label: 'Dashboard', icon: FaHome },
        { path: '/admin/products', label: 'Products', icon: FaBox },
        { path: '/admin/packages', label: 'Packages', icon: FaGift },
        { path: '/admin/orders', label: 'Orders', icon: FaShoppingBag },
        { path: '/admin/shipping-rates', label: 'Shipping Rates', icon: FaTruck },
        { path: '/admin/chats', label: 'Chats', icon: FaComments },
        { path: '/admin/flash-sale', label: 'Flash Sale', icon: FaClock },
    ];

    // Close sidebar when route changes on mobile
    useEffect(() => {
        if (window.innerWidth < 768 && isOpen) {
            const handleRouteChange = () => {
                onClose();
            };
            // Use a small delay to ensure the route change has completed
            const timer = setTimeout(handleRouteChange, 300);
            return () => clearTimeout(timer);
        }
    }, [location.pathname]); // Only depend on pathname, not isOpen or onClose

    const bgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
    const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
    const textSecondaryClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    const hoverBgClass = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

    const handleBackdropClick = (e) => {
        e.stopPropagation();
        onClose();
    };

    const handleSidebarClick = (e) => {
        e.stopPropagation();
    };

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[999] md:hidden"
                    onClick={handleBackdropClick}
                    onTouchStart={handleBackdropClick}
                    style={{ 
                        animation: 'fadeIn 0.2s ease',
                        WebkitTapHighlightColor: 'transparent'
                    }}
                />
            )}
            
            <aside 
                ref={sidebarRef}
                onClick={handleSidebarClick}
                onTouchStart={handleSidebarClick}
                className={cn(
                    "fixed left-0 top-0 h-screen w-[260px] z-[1000] flex flex-col p-6 shadow-xl",
                    bgClass,
                    borderClass,
                    "border-r",
                    "transition-transform duration-300 ease-in-out",
                    "will-change-transform",
                    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
                style={{ WebkitTapHighlightColor: 'transparent' }}
            >
                {/* Mobile header */}
                <div className="flex justify-between items-center pb-6 mb-6 border-b-2 md:hidden" style={{ borderColor: 'var(--color-border)' }}>
                    <h2 className="text-xl font-bold text-blue-600 m-0">WEMAX ADMIN</h2>
                    <button 
                        onClick={onClose}
                        className={cn(
                            "p-2 rounded-md transition-colors",
                            textSecondaryClass,
                            hoverBgClass
                        )}
                        aria-label="Close menu"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                {/* Desktop header */}
                <h2 className="text-2xl font-bold text-blue-600 mb-8 pb-6 border-b-2 hidden md:block" style={{ borderColor: 'var(--color-border)' }}>
                    WEMAX ADMIN
                </h2>

                <nav className="flex flex-col gap-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 font-medium min-h-[44px]",
                                    isActive
                                        ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md"
                                        : cn(textSecondaryClass, hoverBgClass, "hover:translate-x-1")
                                )}
                            >
                                <Icon className="text-lg" />
                                <span>{item.label}</span>
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-white rounded-r-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
