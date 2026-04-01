import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#40B59D',
        'background-light': '#f6f8f7',
        'background-dark': '#12201d',
        'foreground-light': '#1f2937',
        'foreground-dark': '#f9fafb',
        'muted-light': '#6b7280',
        'muted-dark': '#9ca3af',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
