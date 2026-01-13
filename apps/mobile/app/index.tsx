import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Screen from '../src/components/layout/Screen';
import Card from '../src/components/ui/Card';
import { Button } from '../src/components/Button';
import { withOpacity } from '../src/components/form/color';
import { useTheme } from '../src/providers/theme';
import { lightTheme } from '../src/styles/theme';

export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Screen scroll variant="gradient" contentStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.logoCircle}>
          <View style={styles.logoGlow} />
          <Text style={styles.logoEmoji}>💕</Text>
        </View>

        <Text style={styles.title}>Amora</Text>
        <Text style={styles.subtitle}>
          Share moments, track moods, and celebrate your love.
        </Text>
      </View>

      <Card theme={theme} style={styles.featureCard}>
        <FeatureRow
          icon="sparkles"
          title="Daily connection"
          desc="A gentle prompt to stay close."
          theme={theme}
        />
        <View style={styles.divider} />
        <FeatureRow
          icon="happy"
          title="Mood check-ins"
          desc="Understand patterns, support each other."
          theme={theme}
        />
        <View style={styles.divider} />
        <FeatureRow
          icon="images"
          title="Memories"
          desc="Capture the little wins together."
          theme={theme}
        />
      </Card>

      <View style={styles.ctaStack}>
        <Button title="Create account" variant="primary" onPress={() => router.push('/(tabs)/register')} />

        <Pressable
          onPress={() => router.push('/(tabs)/login')}
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
        >
          <Ionicons name="log-in-outline" size={18} color={theme.colors.textPrimary} />
          <Text style={styles.secondaryBtnText}>I already have an account</Text>
        </Pressable>
      </View>

      <Text style={styles.footerNote}>
        By continuing you agree to our Terms & Privacy Policy.
      </Text>
    </Screen>
  );
}

function FeatureRow(props: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
  theme: typeof lightTheme;
}) {
  const { icon, title, desc, theme } = props;
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const createStyles = (theme: typeof lightTheme) =>
  StyleSheet.create({
    content: {
      paddingTop: theme.spacing[6],
      paddingBottom: theme.spacing[8],
      gap: theme.spacing[4],
    },
    hero: {
      alignItems: 'center',
      paddingTop: theme.spacing[3],
      gap: theme.spacing[2],
    },
    logoCircle: {
      width: 92,
      height: 92,
      borderRadius: 46,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.border, 0.9),
      overflow: 'hidden',
      ...theme.shadow.md,
    },
    logoGlow: {
      position: 'absolute',
      inset: -30,
      backgroundColor: withOpacity(theme.colors.primary, 0.12),
    },
    logoEmoji: {
      fontSize: 44,
    },
    title: {
      fontSize: theme.typography.fontSize['3xl'],
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
      letterSpacing: -0.3,
    },
    subtitle: {
      textAlign: 'center',
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
      paddingHorizontal: theme.spacing[6],
      lineHeight: Math.round(
        theme.typography.fontSize.base * theme.typography.lineHeight.relaxed,
      ),
    },
    featureCard: {
      padding: theme.spacing[5],
      gap: theme.spacing[4],
    },
    featureRow: {
      flexDirection: 'row',
      gap: theme.spacing[3],
      alignItems: 'flex-start',
    },
    featureIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withOpacity(theme.colors.primary, 0.1),
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.border, 0.9),
    },
    featureText: {
      flex: 1,
      gap: 2,
    },
    featureTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
    },
    featureDesc: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
      lineHeight: Math.round(
        theme.typography.fontSize.sm * theme.typography.lineHeight.relaxed,
      ),
    },
    divider: {
      height: 1,
      backgroundColor: withOpacity(theme.colors.border, 0.9),
    },
    ctaStack: {
      gap: theme.spacing[3],
    },
    secondaryBtn: {
      height: 52,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.border, 0.9),
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: theme.spacing[2],
      ...theme.shadow.sm,
    },
    secondaryBtnText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
    },
    pressed: {
      opacity: 0.92,
      transform: [{ scale: 0.99 }],
    },
    footerNote: {
      textAlign: 'center',
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
      paddingHorizontal: theme.spacing[6],
    },
  });
