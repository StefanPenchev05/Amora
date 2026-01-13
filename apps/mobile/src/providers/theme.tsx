import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { darkTheme, lightTheme } from '../styles/theme';

export type ThemeMode = 'system' | 'light' | 'dark';

type Theme = typeof lightTheme;

type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
  resolvedMode: Exclude<ThemeMode, 'system'>;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleDark: () => void;
};

const STORAGE_KEY = 'viki.theme.mode';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (cancelled) return;
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setModeState(saved);
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const resolvedMode: Exclude<ThemeMode, 'system'> =
    mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const theme = resolvedMode === 'dark' ? darkTheme : lightTheme;

  const setMode = (nextMode: ThemeMode) => {
    setModeState(nextMode);
    AsyncStorage.setItem(STORAGE_KEY, nextMode).catch(() => undefined);
  };

  const toggleDark = () => {
    const next: ThemeMode = resolvedMode === 'dark' ? 'light' : 'dark';
    setMode(next);
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      mode,
      resolvedMode,
      isDark: resolvedMode === 'dark',
      setMode,
      toggleDark,
    }),
    [theme, mode, resolvedMode]
  );

  // Render immediately (no splash gating). Hydration just prevents flicker in UI that reads `mode`.
  // Theme itself still resolves deterministically via `resolvedMode`.
  void hydrated;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
