/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bomb: {
          bg: '#0f0f1a',
          surface: '#1a1a2e',
          card: '#16213e',
          border: '#0f3460',
          accent: '#e94560',
          yellow: '#f5a623',
          green: '#00d68f',
          red: '#ff3d71',
          text: '#e2e8f0',
          muted: '#64748b',
        },
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};
