import React from 'react';
import { Platform, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { lightTheme } from '../../styles/theme';
import { withOpacity } from '../form/color';
import { useTheme } from '../../providers/theme';

type Theme = typeof lightTheme;

type Props = {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  theme?: Theme;
  style?: StyleProp<ViewStyle>;
};

const AppHeader: React.FC<Props> = ({
  title,
  subtitle,
  onBack,
  right,
  theme: themeProp,
  style,
}) => {
  const { theme: ctxTheme, isDark } = useTheme();
  const theme = themeProp ?? ctxTheme ?? lightTheme;
  const styles = createStyles(theme);

  return (
    <View style={[styles.root, style]}>
      <View style={styles.chrome}>
        <LinearGradient
          colors={[
            withOpacity(theme.colors.primary, 0.08),
            withOpacity(theme.colors.accent, 0.06),
            withOpacity(theme.colors.background, 0),
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {Platform.OS === 'ios' ? (
          <BlurView intensity={18} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        ) : null}

        <View style={styles.row}>
          {onBack ? (
            <Pressable onPress={onBack} hitSlop={10} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
              <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
            </Pressable>
          ) : (
            <View style={styles.sideSpace} />
          )}

          <View style={styles.center}>
            {title ? (
              <>
                <Text style={[styles.title, subtitle ? styles.titleLarge : styles.titleDefault]} numberOfLines={2}>
                  {title}
                </Text>
                <View style={styles.accent} />
              </>
            ) : null}
            {subtitle ? <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text> : null}
          </View>

          <View style={styles.right}>
            {right ?? <View style={styles.sideSpace} />}
          </View>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      paddingVertical: theme.spacing[2],
    },
    chrome: {
      borderRadius: theme.radius.xl,
      paddingVertical: theme.spacing[3],
      paddingHorizontal: theme.spacing[3],
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.border, 0.9),
      backgroundColor: withOpacity(theme.colors.surface, Platform.OS === 'ios' ? 0.6 : 1),
      overflow: 'hidden',
      ...theme.shadow.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withOpacity(theme.colors.surface, 0.85),
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.border, 0.9),
    },
    pressed: {
      opacity: 0.92,
      transform: [{ scale: 0.98 }],
    },
    sideSpace: {
      width: 40,
      height: 40,
    },
    center: {
      flex: 1,
      paddingHorizontal: theme.spacing[4],
    },
    title: {
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
    },
    titleDefault: {
      fontSize: theme.typography.fontSize.xl,
      lineHeight: Math.round(theme.typography.fontSize.xl * theme.typography.lineHeight.tight),
    },
    titleLarge: {
      fontSize: theme.typography.fontSize['2xl'],
      lineHeight: Math.round(theme.typography.fontSize['2xl'] * theme.typography.lineHeight.tight),
    },
    accent: {
      marginTop: theme.spacing[2],
      width: 44,
      height: 4,
      borderRadius: 4,
      backgroundColor: withOpacity(theme.colors.primary, 0.65),
    },
    subtitle: {
      marginTop: theme.spacing[2],
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
    },
    right: {
      minWidth: 40,
      height: 40,
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
  });

export default AppHeader;
