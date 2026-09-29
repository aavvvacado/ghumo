import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

export const GhumoCenterBrand: React.FC = () => {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.logoWrapper}>
        <Image
          source={require('@/assets/images/ghumo-logo-standalone.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 1,
  },
  logoWrapper: {
    width: 260,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
});
