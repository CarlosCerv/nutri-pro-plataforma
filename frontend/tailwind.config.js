/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    // apple-style-frontend: la escala de radios es 6 / 11 / 18 px, más la
    // píldora de los botones de acción. Antes todo estaba aplanado a 8px, lo
    // que borraba la diferencia entre un control pequeño y un contenedor.
    borderRadius: {
      none: '0',
      sm: 'var(--radius-s)',
      DEFAULT: 'var(--radius-s)',
      md: 'var(--radius-s)',
      lg: 'var(--radius-m)',
      xl: 'var(--radius-m)',
      '2xl': 'var(--radius-l)',
      '3xl': 'var(--radius-l)',
      full: 'var(--radius-pill)',
    },
    // Cuatro pesos, no más (regla no negociable #4).
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '400',
      semibold: '600',
      bold: '700',
    },
    extend: {
      colors: {
        // OBSOLETAS — no usar en código nuevo.
        //
        // `emerald`, `gold` y `navy` eran una segunda y tercera identidad de
        // marca, contra la regla no negociable #1 del sistema (un solo
        // acento). Se mantienen los nombres porque unas 60 clases del código
        // todavía los usan y borrarlos los volvería invisibles en silencio;
        // los valores ya apuntan al acento y a los estados semánticos, así
        // que la interfaz ya cumple la regla. Cuando la migración de páginas
        // termine de reemplazarlos por tokens, este bloque se borra.
        navy: {
          950: '#1D1D1F',
          900: '#1D1D1F',
          800: '#2C2C2E',
          700: '#424245',
          600: '#424245',
          500: '#6E6E73',
        },
        emerald: {
          DEFAULT: '#0071E3',
          50:  '#E8F4FF',
          100: '#CCE4FF',
          200: '#99C9FF',
          300: '#66ADFF',
          400: '#3392FF',
          500: '#0071E3',
          600: '#005BB5',
          700: '#004494',
          800: '#003370',
          900: '#00224D',
        },
        gold: {
          DEFAULT: '#B45309',
          50:  '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#F59E0B',
          500: '#B45309',
          600: '#92400E',
          700: '#7C2D12',
          800: '#5C2308',
          900: '#3F1A06',
        },
        success: '#1B7F3A',
        warning: '#B45309',
        danger:  '#C41E16',
        info:    '#0071E3',
      },
      fontFamily: {
        display: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'system-ui',
          'sans-serif',
        ],
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'system-ui',
          'sans-serif',
        ],
        mono: ['"SF Mono"', 'SFMono-Regular', 'ui-monospace', 'Menlo', 'Consolas', 'monospace'],
      },
      letterSpacing: {
        apple: '-0.011em',
        'apple-tight': '-0.022em',
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.006em' }],
        xs:    ['0.8125rem', { lineHeight: '1.125rem', letterSpacing: '0.006em' }],
        sm:    ['0.9375rem', { lineHeight: '1.25rem', letterSpacing: '-0.006em' }],
        base:  ['1.0625rem', { lineHeight: '1.5rem', letterSpacing: '-0.011em' }],
        lg:    ['1.125rem',  { lineHeight: '1.625rem', letterSpacing: '-0.014em' }],
        xl:    ['1.25rem',   { lineHeight: '1.75rem', letterSpacing: '-0.017em' }],
        '2xl': ['1.5rem',    { lineHeight: '2rem', letterSpacing: '-0.019em' }],
        '3xl': ['1.75rem',   { lineHeight: '2.125rem', letterSpacing: '-0.021em' }],
        '4xl': ['2.25rem',   { lineHeight: '2.5rem', letterSpacing: '-0.022em' }],
        '5xl': ['3rem',      { lineHeight: '1.05', letterSpacing: '-0.024em' }],
      },
      screens: {
        xs:  '480px',
        sm:  '640px',
        md:  '768px',
        lg:  '1024px',
        xl:  '1280px',
        '2xl': '1536px',
      },
      spacing: {
        '4.5': '1.125rem',
        13:  '3.25rem',
        15:  '3.75rem',
        18:  '4.5rem',
        22:  '5.5rem',
        72:  '18rem',
        80:  '20rem',
        88:  '22rem',
        96:  '24rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        // apple-style-frontend: una sola sombra en todo el sistema (--shadow-1).
        // card-hover se mantiene por compatibilidad con className existentes,
        // pero ya no es una sombra distinta — el hover de tarjeta diferencia
        // con borde, no con una segunda sombra (ver .card:hover en index.css).
        card:          'var(--shadow-1)',
        'card-hover':  'var(--shadow-1)',
      },
      animation: {
        'fade-in':       'fadeIn 0.2s var(--ease)',
        'fade-up':       'fadeUp 0.3s var(--ease)',
        'slide-in-left': 'slideInLeft 0.3s var(--ease)',
        'slide-in-right':'slideInRight 0.3s var(--ease)',
        'scale-in':      'scaleIn 0.2s var(--ease)',
        'pulse-soft':    'pulseSoft 2s ease-in-out infinite',
        shimmer:         'shimmer 1.5s linear infinite',
        'spin-slow':     'spin 3s linear infinite',
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
      // Dos duraciones y una sola curva (regla no negociable #5).
      transitionDuration: {
        micro: 'var(--duration-micro)',
        layout: 'var(--duration-layout)',
        200: '200ms',
        300: '300ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'var(--ease)',
        apple: 'var(--ease)',
      },
      backgroundImage: {
        'shimmer-base': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
};
