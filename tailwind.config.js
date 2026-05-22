/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F4F8F7',
        surface: '#FFFFFF',
        primary: {
          DEFAULT: '#3A7A6E',
          light: '#5AACA0',
          muted: '#6AAAA0',
          subtle: '#E8F5F1',
          hover: '#2F6560',
        },
        warm: {
          DEFAULT: '#C48A6A',
          bg: '#FFF3E8',
          border: '#F5DCC8',
        },
        deep: '#1C3E38',
        mid: {
          DEFAULT: '#8BBFB7',
          light: '#A8CCC8',
          pale: '#C8E4E0',
        },
        inactive: '#B4D2CC',
        danger: {
          DEFAULT: '#D96A5A',
          bg: '#FFF0EE',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'PingFang SC', 'Noto Sans SC', 'Helvetica Neue', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '1.4' }],
        tab:   ['11px', { lineHeight: '1' }],
      },
      boxShadow: {
        card:        '0 1px 2px rgba(30,80,72,0.04), 0 3px 10px rgba(30,80,72,0.07)',
        'card-hover':'0 2px 4px rgba(30,80,72,0.06), 0 6px 18px rgba(30,80,72,0.10)',
        'card-sm':   '0 1px 2px rgba(30,80,72,0.04), 0 2px 8px rgba(30,80,72,0.05)',
        btn:         '0 4px 12px rgba(58,122,110,0.20)',
        'btn-hover': '0 6px 16px rgba(58,122,110,0.28)',
        avatar:      '0 2px 8px rgba(0,0,0,0.10)',
        fab:         '0 4px 12px rgba(58,122,110,0.35)',
        'warm-card': '0 1px 2px rgba(196,138,106,0.08), 0 3px 10px rgba(196,138,106,0.12)',
        dot:         '0 0 0 3px rgba(58,122,110,0.18)',
        'dot-warm':  '0 0 0 3px rgba(196,138,106,0.18)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(150deg, #EEF7F5 0%, #DFF0EB 40%, #DAF0EE 100%)',
        'btn-gradient':  'linear-gradient(150deg, #5AACA0, #3A8A7E)',
        'warm-gradient': 'linear-gradient(135deg, #FFF8F2, #FFF3E8)',
      },
    },
  },
  plugins: [],
}
