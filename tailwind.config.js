/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gsu: {
          blue: '#0039A6',
          'blue-dim': '#002a7a',
          'blue-bright': '#1d56c9',
          white: '#FFFFFF',
          red: '#CC0000',
          'blue-steel': '#cbd5e1',
          'cool-blue': '#0071CE',
          vibrant: '#00AEEF',
          'light-blue': '#97CAEB',
          'light-gray': 'rgba(255, 255, 255, 0.12)',
          'med-gray': 'rgba(255, 255, 255, 0.25)',
          'dark-gray': '#94a3b8',
          paper: '#091024',
          'paper-warm': '#0d152d',
        },
      },
      // Montserrat everywhere, matching the official site. The site's tailwind.config
      // still claims Space Grotesk, but its --display/--mono CSS vars both resolve to
      // Montserrat and every component reads those vars, so Space Grotesk never renders.
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'system-ui', 'sans-serif'],
        mono: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        container: '1400px',
      },
    },
  },
  plugins: [],
};
