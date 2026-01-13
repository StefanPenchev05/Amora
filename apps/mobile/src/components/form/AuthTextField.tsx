import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme } from '../../styles/theme';
import { withOpacity } from './color';

type Theme = typeof lightTheme;

type Props = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string;
  theme: Theme;
  leadingIconName?: keyof typeof Ionicons.glyphMap;
};

const AuthTextField: React.FC<Props> = ({
  label,
  error,
  theme,
  value,
  onFocus,
  onBlur,
  leadingIconName,
  ...inputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const setFocused = (next: boolean) => {
    setIsFocused(next);
    Animated.timing(focusAnim, {
      toValue: next ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  const handleFocus = (e: any) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setFocused(false);
    onBlur?.(e);
  };

  const showError = Boolean(error);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, showError && { color: theme.colors.primaryHover }]}>
        {label}
      </Text>

      <Pressable
        style={[
          styles.field,
          isFocused && styles.fieldFocused,
          showError && styles.fieldError,
        ]}
      >
        {leadingIconName ? (
          <View style={styles.leadingIcon}>
            <Ionicons
              name={leadingIconName}
              size={18}
              color={isFocused ? theme.colors.primary : theme.colors.textMuted}
            />
          </View>
        ) : null}

        <TextInput
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          {...inputProps}
        />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.focusRing,
            { opacity: focusAnim },
          ]}
        />
      </Pressable>

      {showError ? <Text style={styles.error}>{error}</Text> : null}

      {isFocused ? (
        <View style={[styles.helpDot, { backgroundColor: withOpacity(theme.colors.accent, 0.15) }]} />
      ) : null}
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    wrap: {
      gap: theme.spacing[2],
    },
    label: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
      letterSpacing: 0.2,
    },
    field: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      minHeight: 54,
      paddingHorizontal: theme.spacing[4],
      ...theme.shadow.sm,
    },
    fieldFocused: {
      borderColor: withOpacity(theme.colors.primary, 0.55),
    },
    fieldError: {
      borderColor: withOpacity(theme.colors.primaryHover, 0.55),
    },
    leadingIcon: {
      marginRight: theme.spacing[3],
    },
    input: {
      flex: 1,
      paddingVertical: theme.spacing[3],
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textPrimary,
    },
    focusRing: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      borderRadius: theme.radius.lg,
      borderWidth: 2,
      borderColor: withOpacity(theme.colors.primary, 0.45),
    },
    error: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.primaryHover,
    },
    helpDot: {
      width: 8,
      height: 8,
      borderRadius: 99,
      marginLeft: theme.spacing[1],
    },
  });

export default AuthTextField;
