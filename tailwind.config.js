/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        success: 'rgb(74 222 128)',
        danger: 'rgb(239 68 68)',
        info: 'rgb(14 165 233)',
        warning: 'rgb(251, 197, 49)'
      },
      gridTemplateColumns: {
        dashboard: '15vw 1fr'
      }
    }
  },
  plugins: []
}
