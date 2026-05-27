// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{html,ts,scss}',  // adjust these paths to where your templates and styles are
  ],
  // Disable Tailwind's Preflight (CSS reset) to prevent conflicts with Bootstrap
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
}
