import { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { cn } from '../lib/utils.js';

const STORAGE_KEY = 'wemax_chat_widgets_hint_dismissed';

function readDismissed() {
    if (typeof window === 'undefined') return true;
    try {
        return sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch {
        return true;
    }
}

function persistDismissed() {
    try {
        sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
        /* ignore */
    }
}

/** Call when FAB opens a panel so the hint stays gone for the session. */
export function markFloatingChatWidgetsHintDismissed() {
    persistDismissed();
}

/**
 * One-time-per-session pointer above the Shop AI / Support FABs.
 * Dismisses on scroll, wheel, touch drag, or when a chat panel opens.
 */
export default function FloatingChatWidgetsHint({ visible, onDismiss }) {
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });

    const dismiss = useCallback(() => {
        if (!visible) return;
        persistDismissed();
        onDismiss();
    }, [visible, onDismiss]);

    useEffect(() => {
        if (!visible) return;

        const opts = { passive: true };
        const onScroll = () => dismiss();
        const onWheel = () => dismiss();
        const onTouchMove = () => dismiss();
        const onPointerDown = () => dismiss();

        window.addEventListener('scroll', onScroll, opts);
        window.addEventListener('wheel', onWheel, opts);
        window.addEventListener('touchmove', onTouchMove, opts);
        document.addEventListener('pointerdown', onPointerDown, opts);

        return () => {
            window.removeEventListener('scroll', onScroll, opts);
            window.removeEventListener('wheel', onWheel, opts);
            window.removeEventListener('touchmove', onTouchMove, opts);
            document.removeEventListener('pointerdown', onPointerDown, opts);
        };
    }, [visible, dismiss]);

    if (!visible) return null;

    const isDark = theme === 'dark';

    return (
        <div
            className={cn(
                'fixed z-[109] pointer-events-none flex flex-col items-end',
                'right-4 sm:right-6',
                // Just above the Shop AI FAB (stacked above Support); arrow aims at both buttons
                'bottom-[calc(13.75rem+env(safe-area-inset-bottom,0px))] sm:bottom-[calc(14.5rem+env(safe-area-inset-bottom,0px))] md:bottom-[calc(12.5rem+env(safe-area-inset-bottom,0px))]',
                'max-w-[13rem] transition-opacity duration-300'
            )}
            aria-hidden
        >
            <div
                className={cn(
                    'rounded-xl px-3 py-2 text-[11px] sm:text-xs leading-snug shadow-lg border text-right',
                    isDark
                        ? 'bg-gray-800 text-gray-100 border-gray-600'
                        : 'bg-white text-gray-800 border-gray-200'
                )}
            >
                <span className="font-semibold">Shop AI</span>
                <span className={cn('mx-1', isDark ? 'text-gray-500' : 'text-gray-400')}>·</span>
                <span className="font-semibold">Support</span>
                <span className={cn('block mt-0.5', isDark ? 'text-gray-400' : 'text-gray-500')}>
                    Tap the buttons — hint hides when you scroll.
                </span>
            </div>
            {/* Arrow pointing down toward FAB column */}
            <div className="flex w-full justify-end pr-[0.65rem] sm:pr-[1.35rem]">
                <div
                    className={cn(
                        'w-0 h-0 border-l-[7px] border-r-[7px] border-t-[9px] border-l-transparent border-r-transparent',
                        isDark ? 'border-t-gray-800' : 'border-t-white'
                    )}
                    style={{
                        filter: isDark ? 'drop-shadow(0 2px 2px rgb(0 0 0 / 0.2))' : undefined,
                    }}
                />
            </div>
        </div>
    );
}

export { readDismissed };
