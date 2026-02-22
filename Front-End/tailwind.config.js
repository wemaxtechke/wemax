/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
        background: 'var(--color-background)',
        'background-secondary': 'var(--color-background-secondary)',
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        border: 'var(--color-border)',
        error: 'var(--color-error)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
      },
      textColor: {
        DEFAULT: 'var(--color-text)',
        secondary: 'var(--color-text-secondary)',
        tertiary: 'var(--color-text-tertiary)',
      },
      backgroundColor: {
        DEFAULT: 'var(--color-background)',
        secondary: 'var(--color-background-secondary)',
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
      },
      borderColor: {
        DEFAULT: 'var(--color-border)',
      },
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
        xxl: 'var(--spacing-xxl)',
      },
      borderRadius: {
        sm: 'var(--border-radius-sm)',
        md: 'var(--border-radius-md)',
        lg: 'var(--border-radius-lg)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        glow: 'var(--shadow-glow)',
      },
      fontFamily: {
        brand: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        container: '1400px',
      },
    },
  },
  plugins: [],
}
