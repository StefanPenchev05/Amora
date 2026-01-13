/**
 * PasswordStrengthIndicator - Visual password strength feedback
 * 
 * Single Responsibility: Display password strength visually.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { lightTheme } from '../../styles/theme';

type Theme = typeof lightTheme;

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

type Props = {
  strength: PasswordStrength;
  theme: Theme;
};

const strengthConfig: Record<PasswordStrength, { label: string; bars: number }> = {
  weak: { label: 'Weak', bars: 1 },
  fair: { label: 'Fair', bars: 2 },
  good: { label: 'Good', bars: 3 },
  strong: { label: 'Strong', bars: 4 },
};

const PasswordStrengthIndicator: React.FC<Props> = ({ strength, theme }) => {
  const styles = createStyles(theme);
  const config = strengthConfig[strength];
  let strengthColor = theme.colors.error;
  if (strength === 'fair') strengthColor = theme.colors.warning;
  if (strength === 'good') strengthColor = theme.colors.primary;
  if (strength === 'strong') strengthColor = theme.colors.secondary;

  return (
    <View style={styles.container}>
      <View style={styles.barsContainer}>
        {[1, 2, 3, 4].map((bar) => (
          <View
            key={bar}
            style={[
              styles.bar,
              {
                backgroundColor: bar <= config.bars ? strengthColor : theme.colors.border,
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: strengthColor }]}>{config.label}</Text>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing[1],
      gap: theme.spacing[2],
    },
    barsContainer: {
      flexDirection: 'row',
      gap: theme.spacing[1],
      flex: 1,
    },
    bar: {
      flex: 1,
      height: 4,
      borderRadius: 2,
    },
    label: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.medium,
    },
  });

export default PasswordStrengthIndicator;
