/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: '#f5f7fb',
        foreground: '#0f172a',
        primary: {
          DEFAULT: '#1f3a5f',
          foreground: '#f9fafb',
        },
        muted: {
          DEFAULT: '#e5e7eb',
          foreground: '#6b7280',
        },
        border: '#e5e7eb',
        card: '#ffffff',
      },
      boxShadow: {
        subtle: '0 8px 24px rgba(15, 23, 42, 0.04)',
      },
      borderRadius: {
        lg: '16px',
      },
    },
  },
  plugins: [],
};