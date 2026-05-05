import { useSelector } from 'react-redux';
import { FaRobot, FaTimes } from 'react-icons/fa';
import { cn } from '../lib/utils.js';
import ShopAssistantTab from './ShopAssistantTab.jsx';

/**
 * Floating Shop AI — upper FAB on the right (above Support).
 * Lower FAB keeps the original single-button thumb position (Support).
 */
export default function ShopAssistantWidget({ isOpen, setIsOpen }) {
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });

    const bgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
    const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
    const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
    const textSecondaryClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className={cn(
                    'fixed z-[110] flex items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-all duration-300',
                    'hover:bg-emerald-700 hover:scale-105 active:scale-95',
                    'right-4 h-7 w-7 sm:right-6 sm:h-16 sm:w-16',
                    'bottom-[calc(11.25rem+env(safe-area-inset-bottom,0px))] sm:bottom-[calc(12.1rem+env(safe-area-inset-bottom,0px))] md:bottom-[calc(10rem+env(safe-area-inset-bottom,0px))]',
                    isOpen
                        ? 'pointer-events-none opacity-0'
                        : 'opacity-50 hover:opacity-100 focus-visible:opacity-100 active:opacity-100'
                )}
                aria-label="Open Shop AI"
            >
                <FaRobot className="text-sm sm:text-2xl" />
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-[115] bg-black/40 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none"
                    aria-hidden
                    onClick={() => setIsOpen(false)}
                />
            )}

            {isOpen && (
                <div
                    className={cn(
                        'fixed z-[120] overflow-hidden flex flex-col min-h-0',
                        'inset-x-0 bottom-0 rounded-t-2xl sm:rounded-t-none',
                        'h-[min(90vh,36rem)] sm:h-[28rem]',
                        'sm:inset-auto sm:bottom-24 sm:right-6 sm:left-auto sm:w-96 sm:rounded-2xl sm:shadow-2xl',
                        bgClass,
                        borderClass,
                        'border'
                    )}
                >
                    <div
                        className={cn(
                            'flex items-center justify-between shrink-0 px-4 py-3 sm:py-3.5 border-b',
                            borderClass,
                            theme === 'dark'
                                ? 'bg-gradient-to-r from-gray-800 to-gray-900'
                                : 'bg-gradient-to-r from-gray-50 to-white'
                        )}
                    >
                        <div className="min-w-0 flex-1 pr-2">
                            <h3 className={cn('font-semibold text-base sm:text-sm truncate', textClass)}>Shop AI</h3>
                            <p className={cn('text-xs mt-0.5', textSecondaryClass)}>
                                Find products from our catalog.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                'shrink-0 flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-full border text-sm transition-colors',
                                borderClass,
                                theme === 'dark'
                                    ? 'text-gray-300 hover:bg-gray-700 border-gray-600'
                                    : 'text-gray-600 hover:bg-gray-100 border-gray-300'
                            )}
                            aria-label="Close Shop AI"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <ShopAssistantTab theme={theme} />
                </div>
            )}
        </>
    );
}
