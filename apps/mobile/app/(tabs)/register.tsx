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

export default function RegisterScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!termsAccepted) {
      Alert.alert('Terms required', 'Please accept the terms to continue');
      return;
    }

    if (password.trim().length < 8) {
      Alert.alert('Password too short', 'Use at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        username: username.trim(),
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        password: password.trim(),
      });

      Alert.alert('Account created', 'You can now log in.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/login') },
      ]);
    } catch (error) {
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = Boolean(
    firstName.trim() &&
      lastName.trim() &&
      username.trim() &&
      email.trim() &&
      password.trim() &&
      confirmPassword.trim() &&
      termsAccepted,
  );

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
          <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Start your journey together</Text>
      </View>

      <Card theme={theme} style={styles.card}>
        <View style={styles.nameRow}>
          <View style={{ flex: 1 }}>
            <AuthTextField
              label="First name"
              theme={theme}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              leadingIconName="person-outline"
            />
          </View>
          <View style={{ flex: 1 }}>
            <AuthTextField
              label="Last name"
              theme={theme}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>
        </View>

        <AuthTextField
          label="Username"
          theme={theme}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          leadingIconName="at-outline"
        />

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

        <Text style={styles.passwordHint}>
          Use at least 8 characters. Mix letters, numbers, and a symbol.
        </Text>

        <AuthPasswordField
          label="Confirm password"
          theme={theme}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCapitalize="none"
          autoComplete="password"
        />

        <Pressable
          onPress={() => setTermsAccepted((v) => !v)}
          style={({ pressed }) => [styles.termsRow, pressed && styles.pressed]}
        >
          <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
            {termsAccepted ? (
              <Ionicons name="checkmark" size={16} color={theme.colors.onPrimary} />
            ) : null}
          </View>
          <Text style={styles.termsText}>
            I agree to the <Text style={styles.termsLink}>Terms</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
        </Pressable>

        <Button
          title={loading ? 'Creating…' : 'Create account'}
          variant="primary"
          disabled={!isFormValid || loading}
          onPress={handleRegister}
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
        <Text style={styles.footerText}>Already have an account?</Text>
        <Pressable onPress={() => router.push('/(tabs)/login')} hitSlop={10}>
          <Text style={styles.footerLink}>Log in</Text>
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
    nameRow: {
      flexDirection: 'row',
      gap: theme.spacing[3],
    },
    passwordHint: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
      lineHeight: Math.round(theme.typography.fontSize.sm * theme.typography.lineHeight.relaxed),
      marginTop: -theme.spacing[2],
    },
    termsRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing[3],
      marginTop: theme.spacing[1],
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.border, 0.9),
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    termsText: {
      flex: 1,
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
      lineHeight: Math.round(theme.typography.fontSize.sm * theme.typography.lineHeight.relaxed),
    },
    termsLink: {
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
