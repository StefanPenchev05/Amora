import { StyleSheet } from 'react-native';
import { lightTheme } from '../../styles/theme';

type Theme = typeof lightTheme;

export const createAuthStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing[5],
      paddingTop: theme.spacing[6],
    },
    headerWrap: { marginBottom: theme.spacing[5] },
    title: {
      fontSize: theme.typography.fontSize['2xl'],
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing[2],
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
    },
    card: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing[5],
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow.sm,
    },
    footerText: {
      marginTop: theme.spacing[2],
      color: theme.colors.textMuted,
      textAlign: 'center',
      fontFamily: theme.typography.fontFamily.regular,
    },
  });

export default createAuthStyles;
