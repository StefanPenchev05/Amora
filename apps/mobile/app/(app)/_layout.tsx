import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';

import QuickActionsFooter from '../../src/components/layout/QuickActionsFooter';
import { useTheme } from '../../src/providers/theme';

export default function AppLayout() {
  const { theme } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="calendar" />
          <Stack.Screen name="mood" />
          <Stack.Screen name="notes" />
          <Stack.Screen name="memories" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="expenses" />
        </Stack>
      </View>

      <QuickActionsFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
