import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { useTheme } from '@/context/themeContext';
import { LoginTabIcon, SignUpTabIcon } from './BrandIcons';

export type AuthMode = 'login' | 'signup';

interface AuthTabSwitchProps {
  activeTab: AuthMode;
  onTabChange: (tab: AuthMode) => void;
}

export const AuthTabSwitch: React.FC<AuthTabSwitchProps> = ({ activeTab, onTabChange }) => {
  const { theme, isDark } = useTheme();
  const [containerWidth, setContainerWidth] = useState(250);
  const slideAnim = useRef(new Animated.Value(activeTab === 'login' ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: activeTab === 'login' ? 0 : 1,
      duration: 160,
      useNativeDriver: true,
    }).start();
  }, [activeTab, slideAnim]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0) {
      setContainerWidth(width);
    }
  };

  const padding = 4;
  const tabWidth = (containerWidth - padding * 2) / 2;

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [padding, padding + tabWidth],
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#242220' : '#F0EBE1',
          borderColor: isDark ? '#35312D' : '#E2DBD0',
        },
      ]}
      onLayout={handleLayout}
    >
      {/* Sliding Active Pill */}
      <Animated.View
        style={[
          styles.activePill,
          {
            width: tabWidth,
            transform: [{ translateX }],
            backgroundColor: theme.colors.primary.default,
            shadowColor: theme.colors.primary.default,
          },
        ]}
      />

      {/* Login Tab */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onTabChange('login')}
        style={styles.tabButton}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'login' }}
      >
        <LoginTabIcon
          size={18}
          color={activeTab === 'login' ? '#FFFFFF' : theme.colors.text.secondary}
        />
        <Text
          style={[
            styles.tabText,
            { color: activeTab === 'login' ? '#FFFFFF' : theme.colors.text.secondary },
            activeTab === 'login' && styles.activeTabText,
          ]}
        >
          Login
        </Text>
      </TouchableOpacity>

      {/* Sign Up Tab */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onTabChange('signup')}
        style={styles.tabButton}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'signup' }}
      >
        <SignUpTabIcon
          size={18}
          color={activeTab === 'signup' ? '#FFFFFF' : theme.colors.text.secondary}
        />
        <Text
          style={[
            styles.tabText,
            { color: activeTab === 'signup' ? '#FFFFFF' : theme.colors.text.secondary },
            activeTab === 'signup' && styles.activeTabText,
          ]}
        >
          Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 9999,
    padding: 4,
    borderWidth: 1,
    height: 46,
    position: 'relative',
    alignItems: 'center',
  },
  activePill: {
    position: 'absolute',
    top: 4,
    left: 0,
    bottom: 4,
    borderRadius: 9999,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    borderRadius: 9999,
    gap: 8,
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  },
});
