const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--aw-color-primary)',
        secondary: 'var(--aw-color-secondary)',
        accent: 'var(--aw-color-accent)',
        default: 'var(--aw-color-text-default)',
        heading: 'var(--aw-color-text-heading)',
        muted: 'var(--aw-color-text-muted)',
        ink: 'var(--wq-ink)',
        face: 'var(--wq-face)',
        track: 'var(--wq-track)',
        poster: 'var(--wq-poster)',
        band: 'var(--wq-band)',
        brand: '#1e5eff',
        highlight: '#ffc83d',
        navy: '#14163a',
      },
      boxShadow: {
        comic: '4px 4px 0 var(--wq-shadow)',
        'comic-sm': '2px 2px 0 var(--wq-shadow)',
        'comic-lg': '6px 6px 0 var(--wq-shadow)',
      },
      borderRadius: {
        control: '12px',
        card: '16px',
        sheet: '20px',
      },
      fontFamily: {
        sans: ['var(--aw-font-sans)', ...defaultTheme.fontFamily.sans],
        serif: ['var(--aw-font-serif)', ...defaultTheme.fontFamily.serif],
        heading: ['var(--aw-font-heading)', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
  darkMode: 'class',
};
