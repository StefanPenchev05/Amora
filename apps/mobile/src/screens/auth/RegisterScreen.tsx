import React from 'react';
import { KeyboardAvoidingView, Platform, View, Text } from 'react-native';
import { useRegisterViewModel } from '../../viewmodels/auth/useRegisterViewModel';
import TextField from '../../components/form/TextField';
import PasswordField from '../../components/form/PasswordField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import createAuthStyles from './styles';
import { lightTheme } from '../../styles/theme';

type Props = {
  /**
   * register handler is injected so this screen stays presentation-only.
   * It receives a domain command-like object: { name, email, password }
   */
  register?: (payload: { name: string; email: string; password: string }) => Promise<void>;
  onNavigateToLogin?: () => void;
};

const RegisterScreen: React.FC<Props> = ({ register, onNavigateToLogin }) => {
  const vm = useRegisterViewModel({ register });
  const styles = createAuthStyles(lightTheme);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.headerWrap}>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Quick, secure sign up — join the community</Text>
      </View>

      <View style={styles.card}>
        <TextField
          label="Full name"
          value={vm.name}
          onChangeText={vm.setName}
          error={vm.errors.name}
        />

        <TextField
          label="Email"
          value={vm.email}
          onChangeText={vm.setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={vm.errors.email}
        />

        <PasswordField
          label="Password"
          value={vm.password}
          onChangeText={vm.setPassword}
          error={vm.errors.password}
        />

        <PrimaryButton
          title={vm.isSubmitting ? 'Creating account…' : 'Create account'}
          onPress={vm.submit}
          disabled={vm.isSubmitting}
        />

        <Text style={styles.footerText} onPress={onNavigateToLogin}>
          Already have an account? Sign in
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
