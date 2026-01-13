/**
 * RegisterHeader - Animated header with gradient and floating shapes
 * 
 * Single Responsibility: Visual header presentation only.
 */
import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { lightTheme } from '@styles/theme';

type Theme = typeof lightTheme;

type Props = {
  animatedValue: Animated.Value;
  theme: Theme;
};

const RegisterHeader: React.FC<Props> = ({ animatedValue, theme }) => {
  const styles = createStyles(theme);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      >
        {/* Decorative floating shapes */}
        <View style={[styles.floatingShape, styles.shape1]} />
        <View style={[styles.floatingShape, styles.shape2]} />
        <View style={[styles.floatingShape, styles.shape3]} />

        <View style={styles.content}>
          <Text style={styles.kicker}>Welcome to Amora</Text>
          <Text style={styles.title}>Grow together</Text>
          <Text style={styles.subtitle}>
            A private space for you and your partner to strengthen your bond
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginTop: theme.spacing[4],
      borderRadius: theme.radius.xl,
      overflow: 'hidden',
    },
    gradientBg: {
      paddingVertical: theme.spacing[8],
      paddingHorizontal: theme.spacing[5],
      position: 'relative',
    },
    content: {
      alignItems: 'center',
      zIndex: 1,
    },
    kicker: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: 'rgba(255, 255, 255, 0.9)',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginBottom: theme.spacing[2],
    },
    title: {
      fontSize: theme.typography.fontSize['3xl'],
      fontFamily: theme.typography.fontFamily.bold,
      color: '#FFFFFF',
      textAlign: 'center',
      lineHeight: Math.round(theme.typography.fontSize['3xl'] * 1.1),
      marginBottom: theme.spacing[2],
    },
    subtitle: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: 'rgba(255, 255, 255, 0.85)',
      textAlign: 'center',
      lineHeight: Math.round(theme.typography.fontSize.sm * 1.55),
    },
    floatingShape: {
      position: 'absolute',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 999,
    },
    shape1: {
      width: 120,
      height: 120,
      top: -40,
      right: -30,
    },
    shape2: {
      width: 80,
      height: 80,
      bottom: -20,
      left: -20,
    },
    shape3: {
      width: 50,
      height: 50,
      top: 30,
      left: 20,
    },
  });

export default RegisterHeader;
