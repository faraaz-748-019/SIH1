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
        dark: {
          900: '#070B14',
          800: '#0D1424',
          700: '#141E34',
          600: '#1E2B48',
          500: '#2A3B60',
        },
        cyber: {
          blue: '#38BDF8',
          cyan: '#22D3EE',
          indigo: '#6366F1',
          purple: '#A855F7',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(34, 211, 238, 0.3)',
        'glow-purple': '0 0 25px -5px rgba(168, 85, 247, 0.3)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.3)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(ellipse at top, rgba(30, 43, 72, 0.4), transparent 70%)',
        'grid-pattern': 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
      }
    },
  },
  plugins: [],
}
