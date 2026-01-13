/**
 * RegisterForm - Form fields with validation and password strength
 * 
 * Single Responsibility: Compose form inputs, delegate logic to viewmodel.
 */
import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { RegisterViewModel } from '../../../../viewmodels/auth/useRegisterViewModel';
import { lightTheme } from '../../../../styles/theme';
import AnimatedTextField from '../../../../components/form/AnimatedTextField';
import AnimatedPasswordField from '../../../../components/form/AnimatedPasswordField';
import PasswordStrengthIndicator from '../../../../components/form/PasswordStrengthIndicator';
import GradientButton from '../../../../components/ui/GradientButton';

type Theme = typeof lightTheme;

type Props = {
  vm: RegisterViewModel;
  theme: Theme;
};

const RegisterForm: React.FC<Props> = ({ vm, theme }) => {
  const styles = createStyles(theme);

  const formTranslateY = vm.formAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const formOpacity = vm.formAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: formOpacity,
          transform: [
            { translateY: formTranslateY },
            { translateX: vm.shakeAnimation },
          ],
        },
      ]}
    >
      <AnimatedTextField
        label="Full Name"
        placeholder="First & Last"
        value={vm.name}
        onChangeText={vm.setName}
        onBlur={() => vm.markTouched('name')}
        error={vm.errors.name}
        autoCapitalize="words"
        autoComplete="name"
        theme={theme}
      />

      <AnimatedTextField
        label="Email Address"
        placeholder="your@email.com"
        value={vm.email}
        onChangeText={vm.setEmail}
        onBlur={() => vm.markTouched('email')}
        error={vm.errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        theme={theme}
      />

      <AnimatedPasswordField
        label="Password"
        placeholder="Make it strong"
        value={vm.password}
        onChangeText={vm.setPassword}
        onBlur={() => vm.markTouched('password')}
        error={vm.errors.password}
        theme={theme}
      />

      {vm.password.length > 0 && (
        <PasswordStrengthIndicator strength={vm.passwordStrength} theme={theme} />
      )}

      <View style={styles.buttonContainer}>
        <GradientButton
          title={vm.isSubmitting ? 'Setting up...' : 'Get Started'}
          onPress={vm.submit}
          disabled={vm.isSubmitting}
          loading={vm.isSubmitting}
          theme={theme}
        />
      </View>
    </Animated.View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing[3],
    },
    buttonContainer: {
      marginTop: theme.spacing[4],
    },
  });

export default RegisterForm;
