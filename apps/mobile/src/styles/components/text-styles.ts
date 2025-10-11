import { TextStyle } from "react-native";
import { fontFamilies, fontWeights } from "../tokens/font-tokens";

/**
 * Predefiend text style for consistency
 */

export const textStyles: Record<string, TextStyle> = {
  // Display styles (largest)
  displayLarge: {
    fontFamily: fontFamilies.system,
    fontWeight: fontWeights.regular,
    fontSize: 57,
    lineHeight: 64,
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontFamily: fontFamilies.system,
    fontWeight: fontWeights.regular,
    fontSize: 45,
    lineHeight: 52,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: fontFamilies.system,
    fontWeight: fontWeights.regular,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0,
  },

  // Headline styles
  headlineLarge: {
    fontFamily: fontFamilies.system,
    fontWeight: fontWeights.regular,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: fontFamilies.system,
    fontWeight: fontWeights.regular,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily: fontFamilies.system,
    fontWeight: fontWeights.regular,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
  },

  // Title styles
  titleLarge: {
    fontFamily: fontFamilies.system,
    fontWeight: fontWeights.regular,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily: fontFamilies.system,
    fontWeight: fontWeights.medium,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily: fontFamilies.system,
    fontWeight: fontWeights.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  // Body styles
  bodyLarge: {
    fontFamily: fontFamilies.system,
    fontWeight: fontWeights.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontFamily: fontFamilies.system,
    fontWeight: fontWeights.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: fontFamilies.system,
    fontWeight: fontWeights.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },

  // Label styles
  labelLarge: {
    fontFamily: fontFamilies.system,
    fontWeight: fontWeights.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: fontFamilies.system,
    fontWeight: fontWeights.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: fontFamilies.system,
    fontWeight: fontWeights.medium,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
  },

  // Monospace styles
  codeBlock: {
    fontFamily: fontFamilies.mono,
    fontWeight: fontWeights.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  codeInline: {
    fontFamily: fontFamilies.mono,
    fontWeight: fontWeights.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
} as const;
