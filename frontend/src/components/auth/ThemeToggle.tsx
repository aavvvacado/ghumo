/**
 * Theme Toggle Button
 * Modular standalone component placed beside the pill switch or top bar.
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '@/context/themeContext';

interface ThemeToggleProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = 34, style }) => {
  const { isDark, toggleTheme, theme } = useTheme();
  const iconSize = Math.round(size * 0.48);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={toggleTheme}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isDark ? '#242220' : '#F0EBE1',
          borderColor: isDark ? '#35312D' : '#E2DBD0',
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        /* Sun Icon for switching to light */
        <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="#E7A44B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <Circle cx="12" cy="12" r="5" />
          <Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </Svg>
      ) : (
        /* Moon Icon for switching to dark */
        <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={theme.colors.text.secondary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </Svg>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

