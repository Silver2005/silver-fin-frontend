/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'silver-primary': '#1e293b',
        'silver-accent': '#10b981',
      }
    },
  },
  plugins: [],
}