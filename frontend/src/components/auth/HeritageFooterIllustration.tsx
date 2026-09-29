import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/context/themeContext';

export const HeritageFooterIllustration: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width="100%" height="90" viewBox="0 0 400 90" preserveAspectRatio="none">
        {/* Layer 1 - Background Silhouettes */}
        <Path
          d="M0 90V46h16v-8h12v8h22v-14h18v14h30v-10h16v10h40v-22h14c0-6 4-10 8-10s8 4 8 10h14v22h46v-12h18v12h42v-32h14c0-10 6-16 12-16s12 6 12 16h14v32h40v-14h16v14h36V90H0z"
          fill={isDark ? '#23201D' : '#F5EFE6'}
          opacity={isDark ? 0.4 : 0.9}
        />

        {/* Layer 2 - Midground Temples & Steps */}
        <Path
          d="M0 90V60h30v-12h14v12h40v-18h18v18h36v-8h16v8h50v-16h8c0-8 6-12 12-12s12 4 12 12h8v16h60v-24h10c0-12 8-18 16-18s16 6 16 18h10v24h60v-10h20V90H0z"
          fill={isDark ? '#1D1A18' : '#EDE4D8'}
          opacity={isDark ? 0.6 : 0.95}
        />

        {/* Layer 3 - Foreground Gentle Wash */}
        <Path
          d="M0 90V74h45v-10h18v10h55v-6h20v6h65v-14h12c0-6 5-9 10-9s10 3 10 9h12v14h75v-18h14c0-8 6-12 12-12s12 4 12 12h14v18h46V90H0z"
          fill={isDark ? '#171614' : '#E5DACB'}
          opacity={isDark ? 0.8 : 0.75}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
});
