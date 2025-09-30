/**
 * Investec-inspired professional dark theme
 * Sophisticated black-to-gray gradients with premium accents
 */

export const theme = {
  // Background colors - Deep blacks and grays for premium feel
  background: {
    primary: '#000000',      // Pure black
    secondary: '#0A0A0A',    // Near black
    tertiary: '#121212',     // Dark gray
    card: '#1A1A1A',         // Card background
    elevated: '#1E1E1E',     // Elevated surfaces
    input: '#252525',        // Input fields
  },

  // Gradient colors - Investec zebra-inspired
  gradients: {
    primary: ['#000000', '#1A1A1A', '#2A2A2A'],
    secondary: ['#1A1A1A', '#252525', '#2F2F2F'],
    card: ['#1A1A1A', '#1E1E1E'],
    accent: ['#2A2A2A', '#3A3A3A'],
    subtle: ['#0A0A0A', '#141414'],
  },

  // Text colors
  text: {
    primary: '#FFFFFF',      // White
    secondary: '#B0B0B0',    // Light gray
    tertiary: '#808080',     // Medium gray
    disabled: '#4A4A4A',     // Dark gray
    inverse: '#000000',      // Black (for light backgrounds)
  },

  // Accent colors - Subtle and professional
  accent: {
    primary: '#D4AF37',      // Gold - premium feel
    secondary: '#8B7355',    // Bronze
    tertiary: '#4A4A4A',     // Charcoal
  },

  // Semantic colors - Muted for sophistication
  semantic: {
    success: '#2D5F3F',      // Muted green
    successBright: '#3D8B57', // Slightly brighter for text
    warning: '#8B6914',      // Muted gold/yellow
    warningBright: '#B8860B', // Slightly brighter for text
    error: '#6B2C2C',        // Muted red
    errorBright: '#8B3A3A',  // Slightly brighter for text
    info: '#2C4A6B',         // Muted blue
    infoBright: '#3A5F8B',   // Slightly brighter for text
  },

  // Border colors
  border: {
    primary: '#2A2A2A',      // Subtle border
    secondary: '#3A3A3A',    // Medium border
    focus: '#4A4A4A',        // Focused state
    accent: '#D4AF37',       // Gold accent border
  },

  // Transaction colors
  transaction: {
    positive: '#3D8B57',     // Income/positive
    negative: '#8B3A3A',     // Expense/negative
    neutral: '#4A4A4A',      // Neutral
  },

  // Category badge colors - Muted but distinguishable
  categories: {
    food: '#6B4423',
    transport: '#2C4A6B',
    shopping: '#6B2C5A',
    entertainment: '#4A2C6B',
    utilities: '#4A6B2C',
    health: '#6B2C2C',
    default: '#3A3A3A',
  },

  // Shadow and overlay
  shadow: 'rgba(0, 0, 0, 0.6)',
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
};
