/**
 * GradientButton - Primary action button with gradient background
 * 
 * Single Responsibility: Button with gradient and loading state.
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { lightTheme } from '../../styles/theme';

type Theme = typeof lightTheme;

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  theme: Theme;
};

const GradientButton: React.FC<Props> = ({
  title,
  onPress,
  disabled,
  loading,
  style,
  theme,
}) => {
  const styles = createStyles(theme);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[styles.container, style]}
    >
      <LinearGradient
        colors={
          disabled
            ? [theme.colors.border, theme.colors.border]
            : [theme.colors.primary, theme.colors.secondary]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      borderRadius: theme.radius.lg,
      overflow: 'hidden',
      ...theme.shadow.sm,
    },
    gradient: {
      paddingVertical: theme.spacing[4],
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: '#FFFFFF',
    },
  });

export default GradientButton;
