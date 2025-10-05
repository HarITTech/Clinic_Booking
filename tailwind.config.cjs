// tailwind.config.cjs
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy-blue': '#0a2e50',
        'light-blue': '#4e739a',
        'golden-yellow': '#c8a45f',
        'off-white': '#f8f9fa',
      },
      fontFamily: {
        'serif-display': ['"Playfair Display"', 'serif'],
        'sans-body': ['"Poppins"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
