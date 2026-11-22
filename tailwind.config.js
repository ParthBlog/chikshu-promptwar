// Tailwind configuration for StudyPocket AI – Cosmic Violet & Electric Cyan theme
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0D1117',          // 60% background
        surface: '#161B22',         // cards & sidebars (30%)
        'surface-border': '#30363D',
        primary: '#8B5CF6',        // Vibrant Violet (10% primary accent)
        secondary: '#06B6D4',      // Electric Cyan (secondary/highlight)
        heading: '#F8FAFC',
        'secondary-text': '#94A3B8',
      },
    },
  },
  plugins: [],
};