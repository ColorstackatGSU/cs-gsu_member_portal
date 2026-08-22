/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gsu: {
          blue: '#0039A6',
          'blue-dim': '#002a7a',
          'blue-bright': '#0057c9',
          white: '#FFFFFF',
          red: '#CC0000',
          yellow: '#FFD400',
          ink: '#000000',
          'blue-steel': '#cbd5e1',
          'cool-blue': '#0057c9',
          vibrant: '#00AEEF',
          'light-blue': '#97CAEB',
          'light-gray': 'rgba(0, 0, 0, 0.12)',
          'med-gray': 'rgba(0, 0, 0, 0.25)',
          'dark-gray': '#4a4f57',
          paper: '#e9e7e1',
          'paper-warm': '#dedbd3',
        },
      },
      // Archivo for text and headings, JetBrains Mono for labels, buttons and
      // numbers. The CSS vars in index.css are the source of truth; these keep the
      // Tailwind utilities pointed at the same two families.
      fontFamily: {
        sans: ['Archivo', 'Helvetica Neue', 'Arial', 'system-ui', 'sans-serif'],
        display: ['Archivo', 'Helvetica Neue', 'Arial', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        none: '0',
      },
      boxShadow: {
        hard: '3px 3px 0 #000000',
        'hard-lg': '6px 6px 0 #000000',
      },
      maxWidth: {
        container: '1400px',
      },
    },
  },
  plugins: [],
};
