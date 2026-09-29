/**
 * Domain Models for Theme & Styling
 * Follows Clean Architecture and Open/Closed Principle
 */

export type ThemeMode = 'light' | 'dark';

export interface ColorPalette {
  primary: {
    default: string;
    dark: string;
    light: string;
    pressed: string;
    disabled: string;
  };
  background: {
    screen: string;
    surface: string;
    elevated?: string;
    hero: string;
    heroDark: string;
    footer: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
    link: string;
  };
  border: {
    default: string;
    strong: string;
    focus: string;
  };
  brand: {
    logoBackground: string;
    logoForeground: string;
    heritageAccent: string;
    heritageGreen: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
  };
  overlay: {
    scrim: string;
    pressed: string;
  };
}

export interface ThemeTokens {
  mode: ThemeMode;
  colors: ColorPalette;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    section: number;
    screenHorizontal: number;
  };
  radii: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    cardTop: number;
    pill: number;
  };
  borders: {
    thin: number;
    medium: number;
  };
  elevation: {
    card: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    button: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
}
