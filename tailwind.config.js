/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        du: {
          DEFAULT: '#5c3b47',
        },
        'du-bg': '#986d5a',
      },
      backgroundImage: {
        // keep existing gradients available if needed
      },
    },
  },
  plugins: [],
};
