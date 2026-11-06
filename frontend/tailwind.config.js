/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tamil Nadu Highways Department Design Token Palette
        'tnh-sh': {
          DEFAULT: '#006A4E', // State Highways (Primary Brand / Main Actions)
          hover: '#00553E',
          light: '#E6F4EA',
          border: '#B2DFCD',
        },
        'tnh-nh': {
          DEFAULT: '#FFCC00', // National Highways (Central Assets)
          hover: '#E5B800',
          light: '#FFF9E6',
          text: '#996600',
          border: '#FFE680',
        },
        'tnh-mdr': {
          DEFAULT: '#004B87', // Major District Roads (Regional Connectivity)
          hover: '#003B6B',
          light: '#E6F0F7',
          border: '#B3CFE5',
        },
        'tnh-odr': {
          DEFAULT: '#D1197E', // Other District Roads (Local Hub Linkages)
          hover: '#A91465',
          light: '#FCE8F3',
          border: '#F2B3D6',
        },
        'tnh-rural': {
          DEFAULT: '#FF6600', // Rural & Village Roads (Panchayats)
          hover: '#CC5200',
          light: '#FFF3EB',
          border: '#FFCCB3',
        },
        // Administrative UI Grays & Slates
        gov: {
          dark: '#0F172A',
          card: '#FFFFFF',
          border: '#E2E8F0',
          bg: '#F8FAFC',
          muted: '#64748B',
          accent: '#0284C7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

