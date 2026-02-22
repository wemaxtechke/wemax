import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getTheme } from '../themes/index.js';

export const ThemeProvider = ({ children }) => {
    const theme = useSelector((state) => state?.ui?.theme || 'light');
    const themeObj = getTheme(theme);

    useEffect(() => {
        const root = document.documentElement;
        if (root && themeObj) {
            root.style.setProperty('--color-primary', themeObj.colors.primary);
            root.style.setProperty('--color-primary-dark', themeObj.colors.primaryDark);
            root.style.setProperty('--color-background', themeObj.colors.background);
            root.style.setProperty('--color-background-secondary', themeObj.colors.backgroundSecondary);
            root.style.setProperty('--color-surface', themeObj.colors.surface);
            root.style.setProperty('--color-surface-elevated', themeObj.colors.surfaceElevated);
            root.style.setProperty('--color-text', themeObj.colors.text);
            root.style.setProperty('--color-text-secondary', themeObj.colors.textSecondary);
            root.style.setProperty('--color-text-tertiary', themeObj.colors.textTertiary);
            root.style.setProperty('--color-border', themeObj.colors.border);
            root.style.setProperty('--color-error', themeObj.colors.error);
            root.style.setProperty('--color-success', themeObj.colors.success);
            root.style.setProperty('--color-warning', themeObj.colors.warning);
            root.style.setProperty('--spacing-xs', themeObj.spacing.xs);
            root.style.setProperty('--spacing-sm', themeObj.spacing.sm);
            root.style.setProperty('--spacing-md', themeObj.spacing.md);
            root.style.setProperty('--spacing-lg', themeObj.spacing.lg);
            root.style.setProperty('--spacing-xl', themeObj.spacing.xl);
            root.style.setProperty('--spacing-xxl', themeObj.spacing.xxl);
            root.style.setProperty('--border-radius-sm', themeObj.borderRadius.sm);
            root.style.setProperty('--border-radius-md', themeObj.borderRadius.md);
            root.style.setProperty('--border-radius-lg', themeObj.borderRadius.lg);
            root.style.setProperty('--shadow-sm', themeObj.shadows.sm);
            root.style.setProperty('--shadow-md', themeObj.shadows.md);
            root.style.setProperty('--shadow-lg', themeObj.shadows.lg);
            root.style.setProperty('--shadow-glow', themeObj.shadows.glow);
        }
    }, [theme, themeObj]);

    return <>{children}</>;
};
