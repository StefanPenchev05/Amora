import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { Slot } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Import providers from clean architecture
// import { ThemeProvider } from './src/stores/themeStore';
// import { AuthProvider } from './src/stores/authStore';

/**
 * Root App Component
 * 
 * This is the main entry point that:
 * 1. Sets up global providers (theme, auth, etc.)
 * 2. Configures app-wide settings
 * 3. Renders Expo Router via <Slot />
 */
export default function App() {
  return (
    <SafeAreaProvider>
      {/* Global Providers - Uncomment when implemented */}
      {/* <ThemeProvider> */}
        {/* <AuthProvider> */}
          <StatusBar style="auto" />
          {/* Expo Router renders here */}
          <Slot />
        {/* </AuthProvider> */}
      {/* </ThemeProvider> */}
    </SafeAreaProvider>
  );
}

// Register the main component
registerRootComponent(App);
