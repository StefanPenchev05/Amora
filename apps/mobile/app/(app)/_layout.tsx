import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';

import QuickActionsFooter from '../../src/components/layout/QuickActionsFooter';
import { lightTheme } from '../../src/styles/theme';

export default function AppLayout() {
  return (
    <View style={styles.root}>
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

      <QuickActionsFooter theme={lightTheme} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  content: {
    flex: 1,
  },
});
