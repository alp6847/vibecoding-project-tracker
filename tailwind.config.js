/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0A4FFF', // electric blue — owns the space
          accent: '#5A8FFF', // sky blue — tints, hover lift
          ocean: '#0A7AFF', // digital UI accent
        },
        surface: {
          page: '#F5F4F0', // off-white canvas
          card: '#E8DCC8', // sand-dollar panel
          backdrop: '#001040', // deep navy — modal scrim / spine
          navy: '#001040',
          'navy-elevated': '#0A1A50',
          line: '#0D0D0D', // ink rule
        },
        text: {
          primary: '#0D0D0D',
          secondary: '#3A3A3A',
          muted: '#888880',
          inverse: '#F5F4F0',
        },
        type: {
          feature: '#0A4FFF',
          bug: '#E8001C',
        },
        accent: {
          red: '#E8001C', // Japan Red — one moment per composition
          yellow: '#FFD166',
          peach: '#FF9B7A',
        },
        due: {
          safe: '#2A7A2A',
          warning: '#FFD166',
          overdue: '#E8001C',
          neutral: '#888880',
        },
      },
      fontFamily: {
        // Condensed grotesque for hero / display — Suisse Int'l Condensed stand-in.
        display: ['"Oswald"', '"Suisse Int\'l Condensed"', 'system-ui', 'sans-serif'],
        // Heavy grotesque for section heads / wordmark.
        heading: ['"Archivo"', '"Neue Haas Grotesk Display"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', '"Suisse Int\'l"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"Monaspace"', 'ui-monospace', 'monospace'],
        jp: ['"Noto Sans JP"', '"Zen Kaku Gothic Antique"', 'sans-serif'],
      },
      fontSize: {
        // Overscaled, fluid editorial display type.
        hero: ['clamp(3.5rem, 13vw, 12rem)', { lineHeight: '0.86', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.75rem, 7vw, 6rem)', { lineHeight: '0.92', letterSpacing: '-0.015em' }],
        display: ['clamp(2rem, 4.5vw, 3.5rem)', { lineHeight: '0.96', letterSpacing: '-0.01em' }],
      },
      letterSpacing: {
        label: '0.12em',
        tight: '-0.01em',
      },
      boxShadow: {
        // Hard offset only — no blur. Depth from offset + overlap.
        offset: '4px 4px 0 #0D0D0D',
        'offset-sm': '3px 3px 0 #0D0D0D',
        'offset-blue': '4px 4px 0 #0A4FFF',
      },
      maxWidth: {
        editorial: '1600px',
      },
      keyframes: {
        'reveal-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'reveal-left': {
          '0%': { opacity: '0', transform: 'translateX(-28px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.985)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'scrim-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'reveal-up': 'reveal-up 0.5s ease-out both',
        'reveal-left': 'reveal-left 0.6s ease-out both',
        'fade-in': 'fade-in 0.3s ease-out both',
        'scale-in': 'scale-in 0.28s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scrim-in': 'scrim-in 0.2s ease-out both',
      },
    },
  },
  plugins: [],
};
