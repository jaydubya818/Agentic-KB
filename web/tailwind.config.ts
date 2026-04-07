import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'wiki-bg': '#f8f9fa',
        'wiki-border': '#a2a9b1',
        'wiki-link': '#0645ad',
        'wiki-link-visited': '#0b0080',
        'wiki-heading': '#202122',
        'wiki-muted': '#54595d',
        'wiki-sidebar': '#eaecf0',
        'wiki-infobox': '#f8f9fa',
      },
      fontFamily: {
        serif: ['Georgia', 'Linux Libertine', 'serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: {
        'article': '960px',
      },
    },
  },
  plugins: [],
}

export default config
