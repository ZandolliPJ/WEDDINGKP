/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}','./components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'green-dark':  '#1a4a2e',
        'green-mid':   '#2d7a4f',
        'green-light': '#4caf7d',
        'gold':        '#c9a84c',
        'gold-light':  '#f0d080',
        'trop-pink':   '#e91e8c',
        'trop-yellow': '#f39c12',
        'trop-coral':  '#ff7675',
        'trop-purple': '#9b59b6',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        josefin:  ['"Josefin Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
