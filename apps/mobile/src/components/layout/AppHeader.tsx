import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme } from '../../styles/theme';

type Theme = typeof lightTheme;

type Props = {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  theme?: Theme;
  style?: ViewStyle;
};

const AppHeader: React.FC<Props> = ({
  title,
  subtitle,
  onBack,
  right,
  theme = lightTheme,
  style,
}) => {
  const styles = createStyles(theme);

  return (
    <View style={[styles.root, style]}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={10} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
          </Pressable>
        ) : (
          <View style={styles.backSpace} />
        )}

        <View style={styles.center}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <View style={styles.right}>{right ?? <View style={styles.backSpace} />}</View>
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      paddingVertical: theme.spacing[2],
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
      backgroundColor: theme.colors.surface,
      ...theme.shadow.xs,
    },
    backSpace: {
      width: 40,
      height: 40,
    },
    center: {
      flex: 1,
      paddingHorizontal: theme.spacing[4],
    },
    title: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
    },
    subtitle: {
      marginTop: 2,
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
    },
    right: {
      width: 40,
      height: 40,
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
  });

export default AppHeader;
