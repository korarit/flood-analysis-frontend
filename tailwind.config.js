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
        background: {
          DEFAULT: '#070B12',
          card: '#0D1524',
          subtle: '#121D31',
          hover: '#182742',
        },
        hydro: {
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
          950: '#083344',
        },
        status: {
          normal: '#10B981',    // Green
          watch: '#F59E0B',     // Yellow / Amber
          warning: '#F97316',   // Orange
          critical: '#EF4444',  // Red
          missing: '#64748B',   // Gray / Slate
        }
      },
      fontFamily: {
        sans: ['Inter', 'Prompt', 'Kanit', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.4)',
        'glow-status-normal': '0 0 15px -3px rgba(16, 185, 129, 0.5)',
        'glow-status-watch': '0 0 15px -3px rgba(245, 158, 11, 0.5)',
        'glow-status-warning': '0 0 15px -3px rgba(249, 115, 22, 0.5)',
        'glow-status-critical': '0 0 15px -3px rgba(239, 68, 68, 0.6)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radar 4s linear infinite',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
