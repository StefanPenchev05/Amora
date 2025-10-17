import React from "react";
import { Stack } from "expo-router";
import { ErrorBoundary } from "@presentation/components/common/ErrorBoundary";

export default function RootLayout() {


  return (
    <ErrorBoundary>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#f4511e",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
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
            headerShown: true,
          }}
        />
      </Stack>
    </ErrorBoundary>
  );
}
