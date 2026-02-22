import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../redux/slices/uiSlice.js';
import { logout } from '../../redux/slices/authSlice.js';
import { FaMoon, FaSun, FaBars } from 'react-icons/fa';
import { cn } from '../../lib/utils.js';

export default function AdminHeader({ onMenuToggle }) {
    const dispatch = useDispatch();
    const { theme } = useSelector((state) => state.ui);
    const { user } = useSelector((state) => state.auth);

    const bgClass = theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/80';
    const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
    const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
    const textSecondaryClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    const buttonBgClass = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100';
    const buttonHoverClass = theme === 'dark' ? 'hover:bg-blue-600' : 'hover:bg-blue-600';

    const handleMenuToggle = (e) => {
        e.stopPropagation();
        onMenuToggle();
    };

    return (
        <header className={cn(
            "sticky top-0 z-50 border-b backdrop-blur-lg",
            bgClass,
            borderClass,
            "px-4 md:px-8 py-4 flex flex-wrap justify-between items-center gap-4"
        )}>
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <button 
                    onClick={handleMenuToggle}
                    className={cn(
                        "md:hidden p-2 rounded-lg transition-all",
                        buttonBgClass,
                        borderClass,
                        "border",
                        buttonHoverClass,
                        "hover:text-white hover:border-blue-600"
                    )}
                    aria-label="Toggle menu"
                    type="button"
                >
                    <FaBars className="text-lg" />
                </button>
                <h1 className={cn(
                    "text-xl md:text-2xl font-bold truncate",
                    textClass
                )}>
                    Admin Dashboard
                </h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                <button 
                    onClick={() => dispatch(toggleTheme())}
                    className={cn(
                        "p-2 rounded-lg transition-all",
                        buttonBgClass,
                        borderClass,
                        "border",
                        buttonHoverClass,
                        "hover:text-white hover:border-blue-600"
                    )}
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <FaSun /> : <FaMoon />}
                </button>
                <span className={cn("hidden md:inline font-medium", textSecondaryClass)}>
                    {user?.name}
                </span>
                <button 
                    onClick={() => dispatch(logout())}
                    className={cn(
                        "px-4 py-2 rounded-lg font-medium transition-all text-sm md:text-base",
                        buttonBgClass,
                        borderClass,
                        "border",
                        buttonHoverClass,
                        "hover:text-white hover:border-blue-600"
                    )}
                >
                    Logout
                </button>
            </div>
        </header>
    );
}
