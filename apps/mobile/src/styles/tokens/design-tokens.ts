/**
 * Core design system tokens
 */

export const designTokens = {
  // Sapcing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  // Border radius
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 9999,
  },

  // Border widths
  borderWidth: {
    none: 0,
    thin: 1,
    medium: 2,
    thick: 4,
  },

  // Opacity values
  opacity: {
    transparent: 0,
    low: 0.1,
    medium: 0.5,
    high: 0.8,
    opaque: 1,
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    base: 0,
    raised: 1,
    dropdown: 10,
    overlay: 100,
    modal: 1000,
    toast: 9999,
  },
} as const;

export type DesignTokens = typeof designTokens;