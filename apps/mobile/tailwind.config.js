/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // BIGHEAD Brand Colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        success: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        error: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        warning: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Game specific colors
        chain: {
          1: '#6b7280',   // 1x - gray
          2: '#22c55e',   // 2x - green
          3: '#3b82f6',   // 3x - blue
          5: '#8b5cf6',   // 5x - purple
          8: '#f97316',   // 8x - orange
          10: '#ef4444',  // 10x - red (max)
        },
        // Arena/Duel specific colors (from Stitch design)
        arena: {
          teal: '#00c2cc',        // Electric Teal - primary arena color
          'teal-dim': 'rgba(0, 194, 204, 0.15)',
          coral: '#FF6B6B',       // Coral - opponent/danger
          purple: '#A16EFF',      // Electric Purple - accent
          bg: '#161a1d',          // Deep dark background
          surface: '#22282c',     // Card/surface background
          'surface-light': '#2c3339', // Lighter surface for highlights
        },
        // Streak colors
        streak: {
          fire: '#ec4899',        // Pink fire for streak
          glow: 'rgba(236, 72, 153, 0.3)',
        },
      },
      fontFamily: {
        sans: ['System'],
        heading: ['System'],
      },
    },
  },
  plugins: [],
};
