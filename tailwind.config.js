/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#FFD700', // Vibrant Metallic Gold
          'accent-gold': '#FFD700', // NEW: Primary accent color
          neon: '#CCFF00', // Neon Gold (New CTA)
          red: '#D32F2F', // Logo Red (approximate)
          dark: '#0a0a0a', // Deep Black
          midnight: '#0F172A', // Midnight Blue
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to bottom, #0a0a0a, #0F172A)',
      },
      dropShadow: {
        'gold': '0 0 15px rgba(255, 215, 0, 0.3)', // Softened opacity from 0.5 to 0.3
      }
    },
  },
  plugins: [],
}
