module.exports = {
  content: ["./{views,public}/**/*.{html,ejs,js}"],
  theme: {
    container: {
      center: true,
      padding:  '2rem'
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
