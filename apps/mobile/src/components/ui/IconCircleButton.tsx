import React from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme } from '../../styles/theme';

type Theme = typeof lightTheme;

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  theme?: Theme;
  style?: StyleProp<ViewStyle>;
};

const IconCircleButton: React.FC<Props> = ({ icon, onPress, theme = lightTheme, style }) => {
  const styles = createStyles(theme);
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed, style]}
    >
      <Ionicons name={icon} size={22} color={theme.colors.primary} />
    </Pressable>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    btn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      ...theme.shadow.xs,
    },
    pressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
  });

export default IconCircleButton;
