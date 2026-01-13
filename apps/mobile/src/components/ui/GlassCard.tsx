import React from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { lightTheme } from '../../styles/theme';
import { withOpacity } from '../form/color';

type Theme = typeof lightTheme;

type Props = ViewProps & {
  theme: Theme;
  isDark: boolean;
};

const GlassCard: React.FC<Props> = ({ theme, isDark, style, children, ...rest }) => {
  const styles = createStyles(theme);

  return (
    <View style={[styles.card, style]} {...rest}>
      <BlurView
        intensity={Platform.OS === 'android' ? 40 : 55}
        tint={isDark ? 'systemThinMaterialDark' : 'systemThinMaterialLight'}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : 'none'}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        pointerEvents="none"
        colors={[
          withOpacity(theme.colors.surface, isDark ? 0.42 : 0.62),
          withOpacity(theme.colors.surface, isDark ? 0.2 : 0.28),
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>{children}</View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadow.md,
    },
    content: {
      padding: theme.spacing[5],
      gap: theme.spacing[3],
    },
  });

export default GlassCard;
