import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { authService } from '../../src/services/api/auth';
import Screen from '../../src/components/layout/Screen';
import Card from '../../src/components/ui/Card';
import AuthTextField from '../../src/components/form/AuthTextField';
import AuthPasswordField from '../../src/components/form/AuthPasswordField';
import { Button } from '../../src/components/Button';
import { useTheme } from '../../src/providers/theme';
import { withOpacity } from '../../src/components/form/color';
import { lightTheme } from '../../src/styles/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await authService.login({ email: email.trim(), password: password.trim() });
      router.replace('/(app)/dashboard');
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = Boolean(email.trim() && password.trim());

  return (
    <Screen scroll variant="gradient" contentStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.replace('/')}
          hitSlop={10}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
        </Pressable>
        <View style={{ width: 40, height: 40 }} />
      </View>

      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="heart" size={22} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to continue</Text>
      </View>

      <Card theme={theme} style={styles.card}>
        <AuthTextField
          label="Email"
          theme={theme}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          leadingIconName="mail-outline"
        />

        <AuthPasswordField
          label="Password"
          theme={theme}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          autoComplete="password"
        />

        <Pressable
          onPress={() => Alert.alert('Forgot password', 'Coming soon')}
          style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
        >
          <Text style={styles.linkText}>Forgot password?</Text>
        </Pressable>

        <Button
          title={loading ? 'Logging in…' : 'Log in'}
          variant="primary"
          disabled={!isFormValid || loading}
          onPress={handleLogin}
        />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          onPress={() => Alert.alert('Google', 'Coming soon')}
          style={({ pressed }) => [styles.socialBtn, pressed && styles.pressed]}
        >
          <Ionicons name="logo-google" size={18} color={theme.colors.textPrimary} />
          <Text style={styles.socialText}>Continue with Google</Text>
        </Pressable>

        <Pressable
          onPress={() => Alert.alert('Apple', 'Coming soon')}
          style={({ pressed }) => [styles.socialBtn, pressed && styles.pressed]}
        >
          <Ionicons name="logo-apple" size={18} color={theme.colors.textPrimary} />
          <Text style={styles.socialText}>Continue with Apple</Text>
        </Pressable>
      </Card>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Don’t have an account?</Text>
        <Pressable onPress={() => router.push('/(tabs)/register')} hitSlop={10}>
          <Text style={styles.footerLink}>Create one</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const createStyles = (theme: typeof lightTheme) =>
  StyleSheet.create({
    content: {
      paddingTop: theme.spacing[6],
      paddingBottom: theme.spacing[8],
      gap: theme.spacing[4],
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.border, 0.9),
      ...theme.shadow.xs,
    },
    pressed: {
      opacity: 0.92,
      transform: [{ scale: 0.98 }],
    },
    hero: {
      alignItems: 'center',
      gap: theme.spacing[2],
      paddingTop: theme.spacing[1],
    },
    heroIcon: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withOpacity(theme.colors.primary, 0.1),
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.border, 0.9),
    },
    title: {
      fontSize: theme.typography.fontSize['2xl'],
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
    },
    card: {
      padding: theme.spacing[5],
      gap: theme.spacing[4],
    },
    linkRow: {
      alignSelf: 'flex-end',
      marginTop: -theme.spacing[1],
    },
    linkText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
      marginTop: theme.spacing[1],
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: withOpacity(theme.colors.border, 0.9),
    },
    dividerText: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    socialBtn: {
      height: 52,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.border, 0.9),
      backgroundColor: theme.colors.background,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing[2],
    },
    socialText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.spacing[1],
      paddingTop: theme.spacing[1],
    },
    footerText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
    },
    footerLink: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
    },
  });
