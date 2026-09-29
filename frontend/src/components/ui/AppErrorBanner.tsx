import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useError } from '@/context/errorContext';
import { useTheme } from '@/context/themeContext';

export const AppErrorBanner: React.FC = () => {
  const { activeError, clearError } = useError();
  const { theme, isDark } = useTheme();

  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (activeError) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: Platform.OS === 'android' ? 12 : 0,
          damping: 20,
          stiffness: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 4.5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 4500);

      return () => clearTimeout(timer);
    } else {
      handleDismiss();
    }
  }, [activeError]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      clearError();
    });
  };

  if (!activeError) return null;

  const isWarning = activeError.severity === 'warning';
  const isInfo = activeError.severity === 'info';

  const badgeColor = isWarning
    ? '#D97706'
    : isInfo
    ? '#2563EB'
    : theme.colors.status.error || '#DC2626';

  const bgColor = isDark
    ? isWarning
      ? 'rgba(40, 25, 10, 0.95)'
      : isInfo
      ? 'rgba(15, 25, 45, 0.95)'
      : 'rgba(45, 15, 15, 0.95)'
    : isWarning
    ? 'rgba(254, 243, 199, 0.96)'
    : isInfo
    ? 'rgba(219, 234, 254, 0.96)'
    : 'rgba(254, 226, 226, 0.96)';

  return (
    <SafeAreaView style={styles.safeContainer} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.bannerCard,
          {
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
            backgroundColor: bgColor,
            borderColor: badgeColor,
          },
        ]}
      >
        <View style={[styles.iconDot, { backgroundColor: badgeColor }]} />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#1F2937' }]}>
            {activeError.title}
          </Text>
          <Text style={[styles.message, { color: isDark ? '#D1D5DB' : '#4B5563' }]} numberOfLines={2}>
            {activeError.message}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.closeBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.closeText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>✕</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 36 : 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  bannerCard: {
    width: '92%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    gap: 10,
  },
  iconDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  message: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
