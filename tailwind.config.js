/**
 * MVM Explorer — Design Tokens
 * ─────────────────────────────
 * Backgrounds:  void (#0D0221)  → abyss (#150734)  → deep (#1A0A45)
 * Primary:      cyber (#7B2CBF) → neon (#9D4EDD)   → glow (#E040FB)
 * Accent:       electric (#00F0FF) → ice (#00D4E4)
 * Text:         ghost (#E0E0FF) → mist (#9090B0)   → shadow (#505070)
 * Semantic:     success (#00FF88) · warning (#FFB800) · error (#FF3366)
 *
 * Usage: always reference these tokens (e.g. `text-ghost`, `bg-void`).
 * Never use raw hex values in components.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#0D0221',
        abyss: '#150734',
        deep: '#1A0A45',
        cyber: '#7B2CBF',
        neon: '#9D4EDD',
        glow: '#E040FB',
        electric: '#00F0FF',
        ice: '#00D4E4',
        ghost: '#E0E0FF',
        mist: '#9090B0',
        shadow: '#505070',
        success: '#00FF88',
        warning: '#FFB800',
        error: '#FF3366',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'tx-rain': 'tx-rain 4s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(123, 44, 191, 0.5), 0 0 40px rgba(157, 78, 221, 0.3), 0 0 60px rgba(224, 64, 251, 0.2)',
            filter: 'brightness(1)',
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(123, 44, 191, 0.8), 0 0 60px rgba(157, 78, 221, 0.5), 0 0 90px rgba(224, 64, 251, 0.3)',
            filter: 'brightness(1.2)',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'tx-rain': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(123, 44, 191, 0.5)',
        'glow-lg': '0 0 40px rgba(123, 44, 191, 0.6)',
        'neon': '0 0 10px rgba(0, 240, 255, 0.5)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
