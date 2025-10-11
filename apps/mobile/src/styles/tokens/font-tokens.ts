import { Platform } from "react-native";

/**
 * Font family definitions with platform-specific fallbacks
 */

export const fontFamilies = {
  // System fonts
  system: Platform.select({
    ios: "System",
    android: "Roboto",
    default: "System",
  }),

  mono: Platform.select({
    ios: "Courier New",
    android: "monospace",
    default: "monospace",
  }),
} as const;

/**
 * Font weights with platform-specific values
 */

export const fontWeights = {
  light: Platform.select({
    ios: "300",
    android: "300",
    default: "300",
  }) as "300",
  regular: Platform.select({
    ios: "400",
    android: "400",
    default: "400",
  }) as "400",
  medium: Platform.select({
    ios: "500",
    android: "500",
    default: "500",
  }) as "500",
  semibold: Platform.select({
    ios: "600",
    android: "600",
    default: "600",
  }) as "600",
  bold: Platform.select({
    ios: "700",
    android: "700",
    default: "700",
  }) as "700",
} as const;

export type FontFamily = keyof typeof fontFamilies;
export type FontWeight = keyof typeof fontWeights;
