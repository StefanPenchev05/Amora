/**
 * Enhanced Register ViewModel
 * 
 * Single Responsibility: Manages form state, validation, password strength, and animations.
 * Open/Closed: Easy to extend validation rules without modifying core logic.
 */
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Animated, Easing } from 'react-native';

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

type Props = {
  register?: (payload: RegisterPayload) => Promise<void>;
};

/** Calculate password strength based on multiple criteria */
const calculatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  
  if (score <= 1) return 'weak';
  if (score === 2) return 'fair';
  if (score === 3) return 'good';
  return 'strong';
};

export const useRegisterViewModel = ({ register }: Props) => {
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Animations
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const formAnimation = useRef(new Animated.Value(0)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  // Password strength (memoized for performance)
  const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);

  // Entrance animations
  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(headerAnimation, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(formAnimation, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerAnimation, formAnimation]);

  // Shake animation for errors
  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnimation]);

  // Mark field as touched on blur
  const markTouched = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  // Validate single field (for real-time feedback)
  const validateField = useCallback((field: keyof FieldErrors, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Please enter your full name';
        if (value.trim().length < 2) return 'Name is too short';
        return undefined;
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
        return undefined;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return undefined;
      default:
        return undefined;
    }
  }, []);

  // Validate all fields
  const validate = useCallback((): boolean => {
    const newErrors: FieldErrors = {
      name: validateField('name', name),
      email: validateField('email', email),
      password: validateField('password', password),
    };
    
    // Remove undefined errors
    for (const key of Object.keys(newErrors)) {
      if (newErrors[key as keyof FieldErrors] === undefined) {
        delete newErrors[key as keyof FieldErrors];
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, email, password, validateField]);

  // Handle field change with real-time validation for touched fields
  const handleNameChange = useCallback((value: string) => {
    setName(value);
    if (touched.name) {
      setErrors((prev) => ({ ...prev, name: validateField('name', value) }));
    }
  }, [touched.name, validateField]);

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateField('email', value) }));
    }
  }, [touched.email, validateField]);

  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validateField('password', value) }));
    }
  }, [touched.password, validateField]);

  // Submit handler
  const submit = useCallback(async () => {
    if (isSubmitting) return;

    // Mark all fields as touched
    setTouched({ name: true, email: true, password: true });

    if (!validate()) {
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    try {
      if (register) {
        await register({ name: name.trim(), email: email.trim(), password });
      } else {
        console.warn('Register handler not provided');
      }
    } catch (err: unknown) {
      const error = err as { field?: string; message?: string };
      if (error?.field && typeof error.field === 'string') {
        setErrors((prev) => ({ ...prev, [error.field as string]: error.message || 'Invalid' }));
      } else {
        setErrors((prev) => ({ ...prev, email: error?.message || 'Registration failed' }));
      }
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, validate, register, name, email, password, triggerShake]);

  return {
    // State
    name,
    email,
    password,
    isSubmitting,
    errors,
    passwordStrength,
    
    // Handlers
    setName: handleNameChange,
    setEmail: handleEmailChange,
    setPassword: handlePasswordChange,
    markTouched,
    submit,
    
    // Animations
    headerAnimation,
    formAnimation,
    shakeAnimation,
  } as const;
};

export type RegisterViewModel = ReturnType<typeof useRegisterViewModel>;

export default useRegisterViewModel;
