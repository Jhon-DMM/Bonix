/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Base canvas — white gallery, Apple-style surfaces
        canvas: '#f5f6f8',
        paper: '#ffffff',
        ink: '#1b1f24',
        muted: '#6b7280',
        hairline: '#e3e7ec',
        // Celeste accent system (replaces the old purple)
        celeste: {
          50: '#eef9ff',
          100: '#d9f1ff',
          200: '#b7e6ff',
          300: '#84d6ff',
          400: '#49bfff',
          500: '#1fa3f5',
          600: '#0e82d1',
          700: '#0d67a8',
          800: '#10568a',
          900: '#124a73',
        },
      },
      fontFamily: {
        display: ['"SF Pro Display"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        text: ['"SF Pro Text"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '28px',
        pill: '980px',
      },
      keyframes: {
        slideFromRight: {
          '0%': { transform: 'translateX(12vw)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideFromLeft: {
          '0%': { transform: 'translateX(-12vw)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-from-right': 'slideFromRight 850ms cubic-bezier(0.22,1,0.36,1)',
        'slide-from-left': 'slideFromLeft 850ms cubic-bezier(0.22,1,0.36,1)',
      },
    },
  },
  plugins: [],
};
