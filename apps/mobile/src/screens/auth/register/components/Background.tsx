/**
 * Background - Decorative background for auth screens
 * 
 * Single Responsibility: Draw a polished backdrop behind content.
 */
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { lightTheme } from '@styles/theme';

type Theme = typeof lightTheme;

type Props = {
  theme: Theme;
};

const { width } = Dimensions.get('window');

const Background: React.FC<Props> = ({ theme }) => {
  const styles = createStyles(theme);
  const isDark = theme.colors.background === "#1C1310";

  return (
    <View style={styles.container} pointerEvents="none">
      <LinearGradient
        colors={
          isDark
            ? ["#1C1310", "#2A1915", "#1C1310"]
            : ["#FBF7F5", "#FFF0E8", "#FBF7F5"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />
      <View style={[styles.orb, styles.orb3]} />

      {/* subtle grid */}
      <View style={styles.grid}>
        <View key="grid-line-1" style={styles.gridLine} />
        <View key="grid-line-2" style={styles.gridLine} />
        <View key="grid-line-3" style={styles.gridLine} />
        <View key="grid-line-4" style={styles.gridLine} />
        <View key="grid-line-5" style={styles.gridLine} />
        <View key="grid-line-6" style={styles.gridLine} />
        <View key="grid-line-7" style={styles.gridLine} />
        <View key="grid-line-8" style={styles.gridLine} />
        <View key="grid-line-9" style={styles.gridLine} />
        <View key="grid-line-10" style={styles.gridLine} />
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) => {
  const isDark = theme.colors.background === "#1C1310";
  const orbBase = {
    position: 'absolute' as const,
    borderRadius: 9999,
    opacity: isDark ? 0.18 : 0.14,
  };

  return StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
    },
    orb: {
      ...orbBase,
      backgroundColor: theme.colors.primary,
    },
    orb1: {
      width: width * 0.9,
      height: width * 0.9,
      top: -width * 0.35,
      left: -width * 0.25,
      backgroundColor: theme.colors.primary,
    },
    orb2: {
      width: width * 0.75,
      height: width * 0.75,
      top: width * 0.05,
      right: -width * 0.35,
      backgroundColor: theme.colors.secondary,
    },
    orb3: {
      width: width * 0.6,
      height: width * 0.6,
      bottom: -width * 0.3,
      left: width * 0.2,
      backgroundColor: theme.colors.accent,
    },
    grid: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      paddingTop: 40,
      opacity: isDark ? 0.06 : 0.05,
    },
    gridLine: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 22,
    },
  });
};

export default Background;
