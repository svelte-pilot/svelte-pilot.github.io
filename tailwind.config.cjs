/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{css,svelte}'],
  plugins: [require('@tailwindcss/typography')],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            pre: false
          }
        }
      }
    }
  }
}
