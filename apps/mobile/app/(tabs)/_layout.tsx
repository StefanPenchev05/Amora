import { Tabs } from "expo-router";
import React from "react";

/**
 * Auth tabs layout
 * 
 * Tab bar is hidden for auth screens (register/login).
 * This provides a clean, focused authentication experience.
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" }, // Hide tab bar for auth flow
      }}
    >
      <Tabs.Screen
        name="register"
        options={{
          title: "Create Account",
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          title: "Sign In",
        }}
      />
    </Tabs>
  );
}
