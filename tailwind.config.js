/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        // === AssetFlow Brand Colors ===
        primary: {
          DEFAULT: '#5E244E',
          hover: '#4A1C3E',
          light: '#7A3066',
        },
        secondary: {
          DEFAULT: '#AA1C41',
          hover: '#8E1636',
        },
        accent: {
          DEFAULT: '#E68457',
          light: '#F2A37C',
          hover: '#D4733F',
        },
        // === Backgrounds ===
        background: '#FFF8F3',
        surface: '#FFFFFF',
        // === Text ===
        text: {
          primary: '#2B2B2B',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
        // === Borders ===
        border: {
          DEFAULT: '#F1E5DD',
          divider: '#EAD7CC',
        },
        // === Status ===
        status: {
          available: '#4CAF50',
          allocated: '#5E244E',
          reserved: '#FFE8B4',
          maintenance: '#E68457',
          lost: '#C0392B',
          retired: '#8D6E63',
          disposed: '#9E9E9E',
          pending: '#AA1C41',
          approved: '#4CAF50',
          rejected: '#C0392B',
        },
      },
      borderRadius: {
        card: '16px',
        button: '10px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(94, 36, 78, 0.08), 0 4px 16px rgba(94, 36, 78, 0.06)',
        'card-hover': '0 4px 8px rgba(94, 36, 78, 0.12), 0 8px 24px rgba(94, 36, 78, 0.10)',
        sidebar: '2px 0 16px rgba(94, 36, 78, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
