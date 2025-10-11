export const lightColors = {
  background: "#FFFFFF",
  surface: "#FFF8FC",
  primary: "#E48CC4",
  primaryHover: "#D977B6",
  secondary: "#A78BFA",
  accent: "#FFD6E8",
  textPrimary: "#1F1F1F",
  textMuted: "#4B5563", // WCAG AA compliant - darker for 4.5:1 ratio
  success: "#A7F3D0",
  warning: "#FDE68A",
  error: "#FCA5A5",
  border: "#E5E7EB",
  // WCAG AA compliant "on-*" tokens for text/icons on colored backgrounds
  onPrimary: "#1F1F1F",     // dark text on primary bg (≈6-7:1 contrast)
  onSecondary: "#1F1F1F",   // dark text on secondary bg (≈6-7:1 contrast)
  onAccent: "#1F1F1F",      // dark text on accent bg (for chips/pills)
};

export const darkColors = {
  background: '#1B1B1F',
  surface: '#2A2A30',
  primary: '#F2A8D8',
  primaryHover: '#E891C7',
  secondary: '#C4B5FD',
  accent: '#F5A3C6',
  textPrimary: '#F8FAFC',
  textMuted: '#B0B0BA', // Already passes in dark mode
  success: '#34D399',
  warning: '#EAB308',
  error: '#F87171',
  border: '#3F3F46',
  // WCAG AA compliant "on-*" tokens for text/icons on light brand fills
  onPrimary: '#1B1B1F',     // dark text on light primary bg (≈9.3:1 contrast)
  onSecondary: '#1B1B1F',   // dark text on light secondary bg (≈9.3:1 contrast)
  onAccent: '#1B1B1F',      // dark text on light accent bg
};
