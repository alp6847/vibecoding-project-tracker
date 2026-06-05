/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0A4FFF',
          accent: '#5A8FFF',
        },
        surface: {
          page: '#F5F4F0',
          card: '#E8DCC8',
          backdrop: '#001040',
        },
        text: {
          primary: '#0D0D0D',
          muted: '#888880',
        },
        type: {
          feature: '#0A4FFF',
          bug: '#E8001C',
        },
        due: {
          safe: '#2A7A2A',
          warning: '#FFD166',
          overdue: '#E8001C',
          neutral: '#888880',
        },
      },
      fontFamily: {
        heading: [
          '"Suisse Int\'l Condensed"',
          '"Neue Haas Grotesk Display"',
          'system-ui',
          'sans-serif',
        ],
        body: ['"Suisse Int\'l"', '"Apertura"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"Monaspace"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
