/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        cinetica: {
          orange: '#FF5A00',
          'orange-hover': '#E04E00',
          'orange-light': '#FFF0E6',
          blue: {
            deep: '#062B45',
            dark: '#031726',
            navy: '#0B3B5C',
            electric: '#139FC7',
            light: '#E6F6FA'
          },
          dark: '#171B1F',
          muted: '#6B7280',
          light: '#F3F5F6',
          white: '#FFFFFF'
        }
      },
      fontFamily: {
        heading: ['"Barlow Condensed"', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
};
