/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pawa-navy': '#0f172a',
        'pawa-navy-dark': '#0b1120',
        'pawa-navy-light': '#1e293b',
        'pawa-navy-border': '#334155',
        'pawa-blue': '#0284c7',
        'pawa-blue-hover': '#0369a1',
        'pawa-blue-light': '#38bdf8',
        'pawa-green': '#16a34a',
        'pawa-green-hover': '#15803d',
        'pawa-red': '#dc2626',
        'pawa-yellow': '#eab308',
        'pawa-card': '#1e293b',
        'pawa-card-hover': '#24334a',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
