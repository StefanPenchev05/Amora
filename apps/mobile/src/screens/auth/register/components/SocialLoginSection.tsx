/**
 * SocialLoginSection - OAuth login buttons
 * 
 * Single Responsibility: Display social login options.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme } from '../../../../styles/theme';

type Theme = typeof lightTheme;

type Props = {
  theme: Theme;
  onGooglePress?: () => void;
  onApplePress?: () => void;
};

const SocialLoginSection: React.FC<Props> = ({ theme, onGooglePress, onApplePress }) => {
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or as a couple</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={onGooglePress}
          activeOpacity={0.7}
        >
          <Ionicons name="logo-google" size={22} color={theme.colors.textPrimary} />
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={onApplePress}
          activeOpacity={0.7}
        >
          <Ionicons name="logo-apple" size={22} color={theme.colors.textPrimary} />
          <Text style={styles.socialButtonText}>Apple</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginTop: theme.spacing[6],
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing[4],
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    dividerText: {
      marginHorizontal: theme.spacing[3],
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
    },
    buttonsRow: {
      flexDirection: 'row',
      gap: theme.spacing[3],
    },
    socialButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing[2],
      paddingVertical: theme.spacing[3],
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    socialButtonText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
    },
  });

export default SocialLoginSection;
