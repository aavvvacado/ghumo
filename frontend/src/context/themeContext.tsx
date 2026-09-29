/**
 * Theme Context & State Management
 * Clean theme provider following SOLID principles with smooth fade animation support.
 */

import React, { createContext, useContext, useState, useMemo, useRef, useEffect } from 'react';
import { Animated, useColorScheme } from 'react-native';
import { ThemeMode, ThemeTokens } from '@/domain/models/theme';
import { DarkThemeTokens, LightThemeTokens } from '@/constants/theme';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  theme: ThemeTokens;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  fadeAnim: Animated.Value;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialMode }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(
    initialMode || (systemScheme === 'dark' ? 'dark' : 'light')
  );

  const isDark = themeMode === 'dark';
  const theme = isDark ? DarkThemeTokens : LightThemeTokens;

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const toggleTheme = () => {
    // Smooth fade transition
    Animated.timing(fadeAnim, {
      toValue: 0.2,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setThemeModeState((prev) => (prev === 'light' ? 'dark' : 'light'));
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const setThemeMode = (mode: ThemeMode) => {
    if (mode === themeMode) return;
    Animated.timing(fadeAnim, {
      toValue: 0.2,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setThemeModeState(mode);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const value = useMemo(
    () => ({
      themeMode,
      isDark,
      theme,
      toggleTheme,
      setThemeMode,
      fadeAnim,
    }),
    [themeMode, isDark, theme, fadeAnim]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
