/**
 * Register screen styles factory
 * 
 * Uses theme tokens for consistent styling across light/dark modes.
 */
import { StyleSheet } from 'react-native';
import { lightTheme } from '@styles/theme';

type Theme = typeof lightTheme;

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing[5],
      paddingBottom: theme.spacing[8],
    },
    formCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      padding: theme.spacing[5],
      marginTop: theme.spacing[4],
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow.lg,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: theme.colors.background === "#1C1310" ? 0.25 : 0.08,
      shadowRadius: 16,
    },
  });

export default createStyles;
