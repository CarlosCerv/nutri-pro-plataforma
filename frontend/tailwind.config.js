/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Navy — Fondos principales (dark mode)
        navy: {
          950: '#090E1A',
          900: '#0D1526',
          800: '#132038',
          700: '#1A2E50',
          600: '#243D6A',
          500: '#2E4E88',
        },
        // Emerald — Acento primario
        emerald: {
          DEFAULT: '#2ECC8E',
          50:  '#E8FAF3',
          100: '#C5F2DF',
          200: '#8FE6C4',
          300: '#58D9A7',
          400: '#2ECC8E',
          500: '#22A872',
          600: '#188557',
          700: '#0F613E',
          800: '#074028',
          900: '#022014',
        },
        // Gold — Acento secundario / premium
        gold: {
          DEFAULT: '#E8C96A',
          50:  '#FDF8EC',
          100: '#FAF0CE',
          200: '#F4DE9A',
          300: '#EDD06E',
          400: '#E8C96A',
          500: '#D4A832',
          600: '#AA8424',
          700: '#7D6119',
          800: '#52400F',
          900: '#291F06',
        },
        // Semantic
        success: '#2ECC8E',
        warning: '#F59E0B',
        danger:  '#EF4444',
        info:    '#3B82F6',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"DM Mono"', '"Courier New"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem',  { lineHeight: '1rem' }],
        xs:    ['0.75rem',  { lineHeight: '1rem' }],
        sm:    ['0.875rem', { lineHeight: '1.25rem' }],
        base:  ['1rem',     { lineHeight: '1.5rem' }],
        lg:    ['1.125rem', { lineHeight: '1.75rem' }],
        xl:    ['1.25rem',  { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem',   { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem',  { lineHeight: '2.5rem' }],
        '5xl': ['3rem',     { lineHeight: '1' }],
      },
      screens: {
        'xs':  '480px',
        'sm':  '640px',
        'md':  '768px',
        'lg':  '1024px',
        'xl':  '1280px',
        '2xl': '1536px',
      },
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
        '72':  '18rem',
        '80':  '20rem',
        '88':  '22rem',
        '96':  '24rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'emerald-sm':  '0 2px 8px rgba(46, 204, 142, 0.2)',
        'emerald-md':  '0 4px 20px rgba(46, 204, 142, 0.3)',
        'emerald-lg':  '0 8px 40px rgba(46, 204, 142, 0.4)',
        'gold-sm':     '0 2px 8px rgba(232, 201, 106, 0.2)',
        'gold-md':     '0 4px 20px rgba(232, 201, 106, 0.3)',
        'navy-md':     '0 4px 20px rgba(9, 14, 26, 0.5)',
        'navy-lg':     '0 8px 40px rgba(9, 14, 26, 0.7)',
        'glass':       '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card':        '0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)',
        'card-hover':  '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(46,204,142,0.1)',
      },
      animation: {
        'fade-in':      'fadeIn 0.2s ease-out',
        'fade-up':      'fadeUp 0.3s ease-out',
        'slide-in-left':'slideInLeft 0.3s ease-out',
        'slide-in-right':'slideInRight 0.3s ease-out',
        'scale-in':     'scaleIn 0.2s ease-out',
        'pulse-soft':   'pulseSoft 2s ease-in-out infinite',
        'shimmer':      'shimmer 1.5s linear infinite',
        'spin-slow':    'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to:   { backgroundPosition: '200% 0' },
        },
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backgroundImage: {
        'gradient-emerald': 'linear-gradient(135deg, #2ECC8E 0%, #22A872 100%)',
        'gradient-gold':    'linear-gradient(135deg, #E8C96A 0%, #D4A832 100%)',
        'gradient-navy':    'linear-gradient(180deg, #0D1526 0%, #090E1A 100%)',
        'gradient-glass':   'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'shimmer-base':     'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
}
