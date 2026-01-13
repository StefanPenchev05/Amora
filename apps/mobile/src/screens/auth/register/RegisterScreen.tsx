import React from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRegisterViewModel, RegisterPayload } from '../../../viewmodels/auth/useRegisterViewModel';
import { darkTheme, lightTheme } from '../../../styles/theme';
import AuthTextField from '../../../components/form/AuthTextField';
import AuthPasswordField from '../../../components/form/AuthPasswordField';
import { withOpacity } from '../../../components/form/color';
import GradientButton from '../../../components/ui/GradientButton';

export type RegisterScreenProps = {
  onRegister?: (payload: RegisterPayload) => Promise<void>;
  onNavigateToLogin?: () => void;
  onGoogleLogin?: () => Promise<void>;
  onAppleLogin?: () => Promise<void>;
};

const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegister,
  onNavigateToLogin,
  onGoogleLogin,
  onAppleLogin,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = createStyles(theme);
  const vm = useRegisterViewModel({ register: onRegister });

  const [isAnyFieldFocused, setIsAnyFieldFocused] = React.useState(false);
  const focusCountRef = React.useRef(0);
  const glassFocusAnim = React.useRef(new Animated.Value(0)).current;

  const orb1Anim = React.useRef(new Animated.Value(0)).current;
  const orb2Anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const orb1Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, {
          toValue: 1,
          duration: 9200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orb1Anim, {
          toValue: 0,
          duration: 9200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const orb2Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, {
          toValue: 1,
          duration: 10800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orb2Anim, {
          toValue: 0,
          duration: 10800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    orb1Loop.start();
    orb2Loop.start();

    return () => {
      orb1Loop.stop();
      orb2Loop.stop();
    };
  }, [orb1Anim, orb2Anim]);

  const orb1TranslateX = orb1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 18],
  });
  const orb1TranslateY = orb1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 16],
  });
  const orb1Scale = orb1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const orb2TranslateX = orb2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [14, -12],
  });
  const orb2TranslateY = orb2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14],
  });
  const orb2Scale = orb2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });

  const glassGlowOpacity = glassFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const glassGlowScale = glassFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.015],
  });

  const animateGlassFocus = (nextFocused: boolean) => {
    Animated.timing(glassFocusAnim, {
      toValue: nextFocused ? 1 : 0,
      duration: nextFocused ? 220 : 180,
      easing: nextFocused ? Easing.out(Easing.cubic) : Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const handleAnyFieldFocus = () => {
    focusCountRef.current += 1;
    if (focusCountRef.current === 1) {
      setIsAnyFieldFocused(true);
      animateGlassFocus(true);
    }
  };

  const handleAnyFieldBlur = () => {
    focusCountRef.current = Math.max(0, focusCountRef.current - 1);
    if (focusCountRef.current === 0) {
      setIsAnyFieldFocused(false);
      animateGlassFocus(false);
    }
  };

  const headerTranslateY = vm.headerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 0],
  });

  const headerOpacity = vm.headerAnimation;

  const cardTranslateY = vm.formAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const cardOpacity = vm.formAnimation;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.orb,
          {
            backgroundColor: withOpacity(theme.colors.primary, 0.12),
            transform: [
              { translateX: orb1TranslateX },
              { translateY: orb1TranslateY },
              { scale: orb1Scale },
            ],
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.orb2,
          {
            backgroundColor: withOpacity(theme.colors.accent, 0.1),
            transform: [
              { translateX: orb2TranslateX },
              { translateY: orb2TranslateY },
              { scale: orb2Scale },
            ],
          },
        ]}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslateY }],
            }}
          >
            <View style={styles.headerBadgeRow}>
              <View
                style={[
                  styles.headerBadge,
                  { backgroundColor: withOpacity(theme.colors.primary, 0.14) },
                ]}
              >
                <Ionicons name="heart-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.headerBadgeText}>Amora</Text>
              </View>
            </View>

            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>A warm place to connect — start in a minute.</Text>
          </Animated.View>

          <Animated.View
            style={{
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslateY }, { translateX: vm.shakeAnimation }],
            }}
          >
            <View
              style={[
                styles.glassCard,
                isAnyFieldFocused && {
                  borderColor: withOpacity(theme.colors.primary, 0.35),
                },
              ]}
            >
              <BlurView
                intensity={Platform.OS === 'android' ? 40 : 55}
                tint={colorScheme === 'dark' ? 'systemThinMaterialDark' : 'systemThinMaterialLight'}
                experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : 'none'}
                style={StyleSheet.absoluteFill}
              />

              <LinearGradient
                pointerEvents="none"
                colors={[
                  withOpacity(theme.colors.surface, colorScheme === 'dark' ? 0.42 : 0.62),
                  withOpacity(theme.colors.surface, colorScheme === 'dark' ? 0.2 : 0.28),
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              <Animated.View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  {
                    opacity: glassGlowOpacity,
                    transform: [{ scale: glassGlowScale }],
                  },
                ]}
              >
                <LinearGradient
                  colors={[
                    withOpacity(theme.colors.primary, 0.18),
                    withOpacity(theme.colors.accent, 0.06),
                    'transparent',
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>

              <View style={styles.cardContent}>
              <AuthTextField
                theme={theme}
                label="Full name"
                placeholder="First & last"
                value={vm.name}
                onChangeText={vm.setName}
                onFocus={handleAnyFieldFocus}
                onBlur={() => {
                  vm.markTouched('name');
                  handleAnyFieldBlur();
                }}
                error={vm.errors.name}
                autoCapitalize="words"
                autoComplete="name"
                leadingIconName="person-outline"
              />

              <AuthTextField
                theme={theme}
                label="Email"
                placeholder="you@example.com"
                value={vm.email}
                onChangeText={vm.setEmail}
                onFocus={handleAnyFieldFocus}
                onBlur={() => {
                  vm.markTouched('email');
                  handleAnyFieldBlur();
                }}
                error={vm.errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                leadingIconName="mail-outline"
              />

              <AuthPasswordField
                theme={theme}
                label="Password"
                placeholder="At least 8 characters"
                value={vm.password}
                onChangeText={vm.setPassword}
                onFocus={handleAnyFieldFocus}
                onBlur={() => {
                  vm.markTouched('password');
                  handleAnyFieldBlur();
                }}
                error={vm.errors.password}
                autoCapitalize="none"
                autoComplete="password"
              />

              <GradientButton
                title={vm.isSubmitting ? 'Creating…' : 'Create account'}
                onPress={vm.submit}
                disabled={vm.isSubmitting}
                loading={vm.isSubmitting}
                theme={theme}
              />

              {(onGoogleLogin || onAppleLogin) && (
                <View style={styles.socialWrap}>
                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <View style={styles.socialRow}>
                    {onGoogleLogin ? (
                      <Pressable style={styles.socialButton} onPress={onGoogleLogin}>
                        <Ionicons name="logo-google" size={18} color={theme.colors.textPrimary} />
                        <Text style={styles.socialText}>Google</Text>
                      </Pressable>
                    ) : null}
                    {onAppleLogin ? (
                      <Pressable style={styles.socialButton} onPress={onAppleLogin}>
                        <Ionicons name="logo-apple" size={18} color={theme.colors.textPrimary} />
                        <Text style={styles.socialText}>Apple</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              )}
              </View>
            </View>
          </Animated.View>

          <Pressable onPress={onNavigateToLogin} style={styles.footerPressable}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Text style={styles.footerLink}>Sign in</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: typeof lightTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing[5],
      paddingTop: theme.spacing[6],
      paddingBottom: theme.spacing[8],
      gap: theme.spacing[5],
    },
    orb: {
      position: 'absolute',
      width: 260,
      height: 260,
      borderRadius: 999,
      left: -110,
      top: 40,
    },
    orb2: {
      position: 'absolute',
      width: 240,
      height: 240,
      borderRadius: 999,
      right: -120,
      top: 220,
    },
    headerBadgeRow: {
      flexDirection: 'row',
      marginBottom: theme.spacing[3],
    },
    headerBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
      paddingHorizontal: theme.spacing[3],
      paddingVertical: theme.spacing[2],
      borderRadius: 999,
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.primary, 0.22),
    },
    headerBadgeText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.primary,
      letterSpacing: 0.2,
    },
    title: {
      fontSize: theme.typography.fontSize['3xl'],
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
      letterSpacing: -0.5,
    },
    subtitle: {
      marginTop: theme.spacing[2],
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
      lineHeight: 22,
    },
    glassCard: {
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadow.md,
    },
    cardContent: {
      padding: theme.spacing[5],
      gap: theme.spacing[4],
    },
    socialWrap: {
      marginTop: theme.spacing[2],
      gap: theme.spacing[3],
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    dividerText: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    socialRow: {
      flexDirection: 'row',
      gap: theme.spacing[3],
    },
    socialButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing[2],
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: withOpacity(theme.colors.surface, 0.86),
      paddingVertical: theme.spacing[3],
    },
    socialText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
    },
    footerPressable: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing[1],
    },
    footerText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
    },
    footerLink: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.primary,
    },
  });

export default RegisterScreen;
