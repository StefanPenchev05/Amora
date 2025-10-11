import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '@styles/theme';
import { textStyles } from '@styles/components/text-styles';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
}

/**
 * WCAG AA compliant button component
 * Uses proper contrast ratios for text on colored backgrounds
 */
export const Button: React.FC<ButtonProps> = ({ 
  title, 
  variant = 'primary',
  size = 'medium',
  style,
  ...props 
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  const getButtonStyles = () => {
    let paddingVertical = theme.spacing[3]; // medium default
    if (size === 'small') paddingVertical = theme.spacing[2];
    else if (size === 'large') paddingVertical = theme.spacing[4];

    let paddingHorizontal = theme.spacing[5]; // medium default
    if (size === 'small') paddingHorizontal = theme.spacing[4];
    else if (size === 'large') paddingHorizontal = theme.spacing[6];

    const baseStyle = {
      backgroundColor: theme.colors[variant],
      paddingVertical,
      paddingHorizontal,
      borderRadius: theme.radius.md,
    };

    return baseStyle;
  };

  const getTextStyles = () => {
    // Use proper "on-*" colors for WCAG AA compliance
    let textColor = theme.colors.onAccent; // default
    if (variant === 'primary') textColor = theme.colors.onPrimary;
    else if (variant === 'secondary') textColor = theme.colors.onSecondary;

    let textSize = textStyles.labelMedium; // default
    if (size === 'small') textSize = textStyles.labelSmall;
    else if (size === 'large') textSize = textStyles.labelLarge;

    return [textSize, { color: textColor }];
  };

  return (
    <TouchableOpacity 
      style={[getButtonStyles(), style]} 
      {...props}
    >
      <Text style={getTextStyles()}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * Example usage with WCAG AA compliant contrast:
 * 
 * Light Mode:
 * - Primary button: #E48CC4 background with #1F1F1F text (≈6-7:1 contrast)
 * - Secondary button: #A78BFA background with #1F1F1F text (≈6-7:1 contrast)
 * 
 * Dark Mode:
 * - Primary button: #F2A8D8 background with #1B1B1F text (≈9.3:1 contrast)
 * - Secondary button: #C4B5FD background with #1B1B1F text (≈9.3:1 contrast)
 */
