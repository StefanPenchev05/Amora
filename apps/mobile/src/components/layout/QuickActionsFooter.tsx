import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import { lightTheme } from '../../styles/theme';
import { withOpacity } from '../form/color';
import { useTheme } from '../../providers/theme';

type Theme = typeof lightTheme;

type Props = {
  theme?: Theme;
};

const QuickActionsFooter: React.FC<Props> = ({ theme: themeProp }) => {
  const { theme: ctxTheme, isDark } = useTheme();
  const theme = themeProp ?? ctxTheme ?? lightTheme;
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const actions = useMemo(
    () =>
      [
        {
          key: 'calendar',
          title: 'Calendar',
          route: '/(app)/calendar',
          icon: 'calendar-outline' as const,
        },
        {
          key: 'mood',
          title: 'Mood',
          route: '/(app)/mood',
          icon: 'happy-outline' as const,
        },
        {
          key: 'notes',
          title: 'Notes',
          route: '/(app)/notes',
          icon: 'heart-outline' as const,
        },
        {
          key: 'memories',
          title: 'Memories',
          route: '/(app)/memories',
          icon: 'images-outline' as const,
        },
        {
          key: 'expenses',
          title: 'Expenses',
          route: '/(app)/expenses',
          icon: 'wallet-outline' as const,
        },
      ] as const,
    [],
  );

  const styles = createStyles(theme);

  return (
    <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, theme.spacing[2]) }]}>
      <BlurView intensity={18} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View style={styles.tint} pointerEvents="none" />
      <View style={styles.bar}>
        {actions.map((a) => {
          const active = pathname === a.route;
          return (
            <Pressable
              key={a.key}
              onPress={() => router.push(a.route)}
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              hitSlop={8}
            >
              <View
                style={[
                  styles.iconWrap,
                  active && styles.iconWrapActive,
                ]}
              >
                <Ionicons
                  name={a.icon}
                  size={20}
                  color={active ? theme.colors.primary : theme.colors.textMuted}
                />
              </View>
              <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
                {a.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      backgroundColor: 'transparent',
      width: '100%',
      borderTopWidth: 1,
      borderTopColor: withOpacity(theme.colors.border, 0.9),
    },
    tint: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: withOpacity(theme.colors.surface, 0.72),
    },
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingTop: theme.spacing[2],
      paddingHorizontal: theme.spacing[5],
    },
    item: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing[1],
      gap: 6,
    },
    itemPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.99 }],
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withOpacity(theme.colors.textMuted, 0.06),
    },
    iconWrapActive: {
      backgroundColor: withOpacity(theme.colors.primary, 0.12),
    },
    label: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textMuted,
    },
    labelActive: {
      color: theme.colors.textPrimary,
    },
  });

export default QuickActionsFooter;
