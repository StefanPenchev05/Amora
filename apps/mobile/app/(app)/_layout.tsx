import React from 'react';
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
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
  );
}
