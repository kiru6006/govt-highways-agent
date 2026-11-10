/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Highways Design Token Identity Accents
        highways: {
          charcoal: '#20242B',
          yellow: '#FACC15',
          yellowDark: '#CA8A04',
          gold: '#EAB308',
          slate: '#334155',
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          border: '#E2E8F0',
        },
        // Strict Road Category Tokens
        road: {
          nh: {
            bg: '#20242B',
            text: '#FACC15',
            border: '#374151',
          },
          sh: {
            bg: '#EFF6FF',
            text: '#1D4ED8',
            border: '#BFDBFE',
          },
          mdr: {
            bg: '#F0FDF4',
            text: '#15803D',
            border: '#BBF7D0',
          },
          odr: {
            bg: '#F1F5F9',
            text: '#475569',
            border: '#CBD5E1',
          },
          rural: {
            bg: '#FFF7ED',
            text: '#C2410C',
            border: '#FED7AA',
          },
        },
        // Strict Risk Severity Tokens
        risk: {
          critical: {
            DEFAULT: '#DC2626',
            bg: '#FEF2F2',
            border: '#FECACA',
            text: '#991B1B',
          },
          high: {
            DEFAULT: '#D97706',
            bg: '#FFFBEB',
            border: '#FDE68A',
            text: '#92400E',
          },
          medium: {
            DEFAULT: '#F59E0B',
            bg: '#FEF3C7',
            border: '#FCD34D',
            text: '#B45309',
          },
          low: {
            DEFAULT: '#2563EB',
            bg: '#EFF6FF',
            border: '#BFDBFE',
            text: '#1E40AF',
          },
          success: {
            DEFAULT: '#15803D',
            bg: '#F0FDF4',
            border: '#BBF7D0',
            text: '#166534',
          },
          unknown: {
            DEFAULT: '#64748B',
            bg: '#F8FAFC',
            border: '#E2E8F0',
            text: '#475569',
          },
        },
        // Legacy compatibility mappings
        'tnh-sh': {
          DEFAULT: '#1D4ED8',
          hover: '#1E40AF',
          light: '#EFF6FF',
          border: '#BFDBFE',
        },
        'tnh-nh': {
          DEFAULT: '#20242B',
          hover: '#111827',
          light: '#FEF9C3',
          text: '#CA8A04',
          border: '#FDE047',
        },
        'tnh-mdr': {
          DEFAULT: '#15803D',
          hover: '#166534',
          light: '#F0FDF4',
          border: '#BBF7D0',
        },
        'tnh-odr': {
          DEFAULT: '#475569',
          hover: '#334155',
          light: '#F1F5F9',
          border: '#CBD5E1',
        },
        'tnh-rural': {
          DEFAULT: '#EA580C',
          hover: '#C2410C',
          light: '#FFF7ED',
          border: '#FFEDD5',
        },
        gov: {
          dark: '#20242B',
          card: '#FFFFFF',
          border: '#E2E8F0',
          bg: '#F8FAFC',
          muted: '#64748B',
          accent: '#2563EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}
