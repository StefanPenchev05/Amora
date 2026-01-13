/**
 * RegisterFooter - Login navigation link
 * 
 * Single Responsibility: Footer with login link.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { lightTheme } from '../../../../styles/theme';

type Theme = typeof lightTheme;

type Props = {
  theme: Theme;
  onLoginPress?: () => void;
};

const RegisterFooter: React.FC<Props> = ({ theme, onLoginPress }) => {
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Already together here?</Text>
      <TouchableOpacity onPress={onLoginPress} activeOpacity={0.7}>
        <Text style={styles.link}> Sign in</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing[5],
      paddingBottom: theme.spacing[4],
    },
    text: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
    },
    link: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.primary,
    },
  });

export default RegisterFooter;
