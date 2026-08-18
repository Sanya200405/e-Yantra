/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#2563eb',
          foreground: '#ffffff',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        eyantra: {
          orange: '#ff6600',
          amber: '#f59e0b',
          cyan: '#06b6d4',
          blue: '#2563eb',
          electricBlue: '#3b82f6',
          violet: '#8b5cf6',
          purple: '#7c3aed',
          teal: '#14b8a6',
          emerald: '#10b981',
          gold: '#eab308',
          dark: '#070b14',
          darkCard: '#0f172a',
          darkBorder: '#1e293b',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'neon-orange': '0 0 20px -3px rgba(255, 102, 0, 0.45)',
        'neon-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.45)',
        'neon-blue': '0 0 20px -3px rgba(37, 99, 235, 0.45)',
        'neon-purple': '0 0 20px -3px rgba(139, 92, 246, 0.45)',
        'neon-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.45)',
        'tech-glow': '0 4px 20px -2px rgba(37, 99, 235, 0.12)',
        'tech-card': '0 8px 30px -4px rgba(15, 23, 42, 0.08)',
        'tech-card-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.55)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.03)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up': 'fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulseSlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
