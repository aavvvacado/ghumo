import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useTheme } from '@/context/themeContext';

export const BrandHeader: React.FC = () => {
  const { isDark, theme } = useTheme();
  const headerBg = isDark ? '#191816' : '#ECE8E1';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: headerBg },
      ]}
    >
      <Image
        source={require('@/assets/images/ghumo-logo-standalone.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 440,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  logoImage: {
    width: 220,
    height: 90,
  },
});
