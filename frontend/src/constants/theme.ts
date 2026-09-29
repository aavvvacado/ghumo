/**
 * Ghumo Travel Theme System
 * Supports Light & Dark modes based on ghumo-theme.json & ghumo-theme-dark.json
 */

import { Platform } from 'react-native';
import { ThemeTokens } from '@/domain/models/theme';

export const LightThemeTokens: ThemeTokens = {
  mode: 'light',
  colors: {
    primary: {
      default: '#C25732',
      dark: '#A64629',
      light: '#D97954',
      pressed: '#9F4328',
      disabled: '#E7B7A5',
    },
    background: {
      screen: '#FBF7F2',
      surface: '#FFFDF9',
      elevated: '#FFFFFF',
      hero: '#B85B3A',
      heroDark: '#9E4B2E',
      footer: '#F8F5F0',
    },
    text: {
      primary: '#1F2328',
      secondary: '#686B6E',
      muted: '#9A9A98',
      inverse: '#FFFFFF',
      link: '#A64629',
    },
    border: {
      default: '#DED8D1',
      strong: '#CFC6BD',
      focus: '#C25732',
    },
    brand: {
      logoBackground: '#C25732',
      logoForeground: '#FFF8EE',
      heritageAccent: '#E7A44B',
      heritageGreen: '#2E6F62',
    },
    status: {
      success: '#2E8B72',
      warning: '#F59E0B',
      error: '#E04444',
    },
    overlay: {
      scrim: 'rgba(31,35,40,0.40)',
      pressed: 'rgba(194,87,50,0.08)',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    section: 40,
    screenHorizontal: 20,
  },
  radii: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    cardTop: 28,
    pill: 9999,
  },
  borders: {
    thin: 1,
    medium: 1.5,
  },
  elevation: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
      elevation: 3,
    },
    button: {
      shadowColor: '#C25732',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 3,
    },
  },
};

export const DarkThemeTokens: ThemeTokens = {
  mode: 'dark',
  colors: {
    primary: {
      default: '#D46A42',
      dark: '#B94F2D',
      light: '#E58A67',
      pressed: '#A94729',
      disabled: '#6F4336',
    },
    background: {
      screen: '#121212',
      surface: '#1B1A18',
      elevated: '#201E1C',
      hero: '#1E1A15',
      heroDark: '#141210',
      footer: '#171614',
    },
    text: {
      primary: '#F5F0E9',
      secondary: '#B9B2AA',
      muted: '#827B74',
      inverse: '#171412',
      link: '#E58A67',
    },
    border: {
      default: '#393531',
      strong: '#4A443F',
      focus: '#D46A42',
    },
    brand: {
      logoBackground: '#C25732',
      logoForeground: '#FFF8EE',
      heritageAccent: '#E7A44B',
      heritageGreen: '#4D8A7D',
    },
    status: {
      success: '#58A68E',
      warning: '#F2B84B',
      error: '#F06A6A',
    },
    overlay: {
      scrim: 'rgba(0,0,0,0.60)',
      pressed: 'rgba(212,106,66,0.12)',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    section: 40,
    screenHorizontal: 20,
  },
  radii: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    cardTop: 28,
    pill: 9999,
  },
  borders: {
    thin: 1,
    medium: 1.5,
  },
  elevation: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.32,
      shadowRadius: 20,
      elevation: 6,
    },
    button: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 3,
    },
  },
};

export const GhumoTheme = LightThemeTokens;

export const Colors = {
  light: {
    text: LightThemeTokens.colors.text.primary,
    background: LightThemeTokens.colors.background.screen,
    backgroundElement: '#F0EFEC',
    backgroundSelected: '#E4E1DC',
    textSecondary: LightThemeTokens.colors.text.secondary,
    primary: LightThemeTokens.colors.primary.default,
  },
  dark: {
    text: DarkThemeTokens.colors.text.primary,
    background: DarkThemeTokens.colors.background.screen,
    backgroundElement: '#242220',
    backgroundSelected: '#35312D',
    textSecondary: DarkThemeTokens.colors.text.secondary,
    primary: DarkThemeTokens.colors.primary.default,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = 70;
export const MaxContentWidth = 440;
