/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': {
          DEFAULT: '#3B82F6', // Azul principal para botões e links
          dark: '#263B6A',   // Azul escuro da sidebar e seções
          light: '#EFF6FF',  // Azul muito claro para fundos
        },
        'brand-gray': {
          DEFAULT: '#6B7280', // Cinza para texto
          light: '#F3F4F6',   // Cinza para inputs e fundos de cards
          dark: '#374151',    // Cinza escuro
        },
        'status': {
          'green': '#10B981', // Disponível
          'red': '#EF4444',   // Ocupado
          'yellow': '#F59E0B',// Atrasado
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};