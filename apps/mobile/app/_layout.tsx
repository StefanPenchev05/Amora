import React from "react";
import { Stack } from "expo-router";
import { ErrorBoundary } from "@presentation/components/common/ErrorBoundary";

export default function RootLayout() {

  return (
    <ErrorBoundary>
      <Stack
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Home",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(app)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </ErrorBoundary>
  );
}
