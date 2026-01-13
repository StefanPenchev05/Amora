import React from "react";
import { Stack } from "expo-router";
import { ErrorBoundary } from "@presentation/components/common/ErrorBoundary";
import { ThemeProvider } from "@/src/providers/theme";

export default function RootLayout() {

  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}
