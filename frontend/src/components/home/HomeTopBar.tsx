import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/authContext';
import { useTheme } from '@/context/themeContext';
import { LegalTermsModal } from './LegalTermsModal';

export const HomeTopBar: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, logout, authAction } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);

  const isLoggingOut = authAction === 'logout';

  // Smooth scale and opacity animation for dropdown menu items
  const menuAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isMenuOpen) {
      Animated.spring(menuAnim, {
        toValue: 1,
        tension: 80,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      menuAnim.setValue(0);
    }
  }, [isMenuOpen, menuAnim]);

  const closeMenuAnimated = (callback?: () => void) => {
    Animated.timing(menuAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setIsMenuOpen(false);
      if (callback) callback();
    });
  };

  // Dynamic top offset: accounts for status bar insets on Android & iOS, with a clean top margin
  const topInset = insets.top > 0
    ? insets.top + (Platform.OS === 'android' ? 8 : 4)
    : (Platform.OS === 'web' ? 12 : 16);

  const handleToggleTheme = () => {
    toggleTheme();
  };

  const handleAuthAction = async () => {
    closeMenuAnimated(async () => {
      await logout();
    });
  };

  const handleOpenLegal = () => {
    closeMenuAnimated(() => {
      setIsLegalOpen(true);
    });
  };

  return (
    <>
      <View style={[styles.outerWrapper, { paddingTop: topInset }]} pointerEvents="box-none">
        <View style={styles.islandsRow} pointerEvents="box-none">
          {/* Left Island: Bon Voyage, username */}
          <View
            style={[
              styles.leftIsland,
              {
                backgroundColor: isDark ? 'rgba(27,26,24,0.95)' : 'rgba(255,253,249,0.95)',
                borderColor: isDark ? '#38332E' : theme.colors.border.default,
              },
            ]}
          >
            <Text style={[styles.userText, { color: theme.colors.text.primary }]} numberOfLines={1}>
              {`Bon Voyage, ${isAuthenticated ? user?.email?.split('@')[0] || 'Traveler' : 'Guest'}`}
            </Text>
          </View>

          {/* Right Island: Menu Trigger Button (Single clean outer circle, no inner circle) */}
          <TouchableOpacity
            style={[
              styles.rightIsland,
              {
                backgroundColor: isDark ? 'rgba(27,26,24,0.95)' : 'rgba(255,253,249,0.95)',
                borderColor: isDark ? '#38332E' : theme.colors.border.default,
              },
            ]}
            onPress={() => setIsMenuOpen(true)}
            activeOpacity={0.75}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Open settings menu"
          >
            <Feather name="more-horizontal" size={20} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Options Dropdown Modal without dark background */}
      <Modal visible={isMenuOpen} transparent animationType="none" onRequestClose={() => closeMenuAnimated()}>
        <TouchableWithoutFeedback onPress={() => closeMenuAnimated()}>
          <View style={styles.menuOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.dropdownCard,
                  {
                    top: topInset + 56,
                    backgroundColor: isDark ? '#23211F' : '#FAF6EE',
                    borderColor: isDark ? '#38332E' : '#E5DDD1',
                    opacity: menuAnim,
                    transform: [
                      {
                        scale: menuAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.75, 1],
                        }),
                      },
                      {
                        translateY: menuAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-12, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {/* 1. Theme Toggle Row */}
                <TouchableOpacity
                  style={styles.menuRow}
                  onPress={handleToggleTheme}
                  activeOpacity={0.75}
                >
                  <View style={[styles.menuIconBadge, { backgroundColor: isDark ? '#332E2A' : '#EFE8DE' }]}>
                    <Feather
                      name={isDark ? 'sun' : 'moon'}
                      size={16}
                      color={isDark ? '#E7A44B' : theme.colors.text.secondary}
                    />
                  </View>
                  <View style={styles.menuTextGroup}>
                    <Text style={[styles.menuRowTitle, { color: theme.colors.text.primary }]}>
                      {isDark ? 'Light Theme' : 'Dark Theme'}
                    </Text>
                    <Text style={[styles.menuRowSub, { color: theme.colors.text.muted }]}>
                      Switch visual style
                    </Text>
                  </View>
                </TouchableOpacity>

                <View style={[styles.menuDivider, { backgroundColor: isDark ? '#332E2A' : '#E8E1D5' }]} />

                {/* 2. Log In / Log Out */}
                <TouchableOpacity
                  style={styles.menuRow}
                  onPress={handleAuthAction}
                  disabled={isLoggingOut}
                  activeOpacity={0.75}
                >
                  <View style={[styles.menuIconBadge, { backgroundColor: isDark ? '#332E2A' : '#EFE8DE' }]}>
                    {isLoggingOut ? (
                      <ActivityIndicator size="small" color={theme.colors.primary.default} />
                    ) : (
                      <Feather
                        name={isAuthenticated ? 'log-out' : 'log-in'}
                        size={16}
                        color={theme.colors.primary.default}
                      />
                    )}
                  </View>
                  <View style={styles.menuTextGroup}>
                    <Text style={[styles.menuRowTitle, { color: theme.colors.text.primary }]}>
                      {isAuthenticated ? 'Log Out' : 'Sign In / Register'}
                    </Text>
                    <Text style={[styles.menuRowSub, { color: theme.colors.text.muted }]}>
                      {isAuthenticated ? user?.email || 'Active Account' : 'Save itineraries to cloud'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <View style={[styles.menuDivider, { backgroundColor: isDark ? '#332E2A' : '#E8E1D5' }]} />

                {/* 3. Legal & Terms */}
                <TouchableOpacity
                  style={styles.menuRow}
                  onPress={handleOpenLegal}
                  activeOpacity={0.75}
                >
                  <View style={[styles.menuIconBadge, { backgroundColor: isDark ? '#332E2A' : '#EFE8DE' }]}>
                    <Feather name="file-text" size={16} color={theme.colors.text.secondary} />
                  </View>
                  <View style={styles.menuTextGroup}>
                    <Text style={[styles.menuRowTitle, { color: theme.colors.text.primary }]}>
                      Terms & Privacy
                    </Text>
                    <Text style={[styles.menuRowSub, { color: theme.colors.text.muted }]}>
                      Legal notices & disclaimers
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Legal & Terms Modal */}
      <LegalTermsModal visible={isLegalOpen} onClose={() => setIsLegalOpen(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    width: '100%',
    zIndex: 99,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    pointerEvents: 'box-none',
  },
  islandsRow: {
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 540,
    alignSelf: 'center',
    width: '93%',
    pointerEvents: 'box-none',
  },
  leftIsland: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 9999,
    borderWidth: 1.2,
    minHeight: 50,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
    justifyContent: 'center',
  },
  userText: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  rightIsland: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  dropdownCard: {
    position: 'absolute',
    right: 20,
    width: 230,
    borderRadius: 18,
    borderWidth: 1.2,
    paddingVertical: 6,
    paddingHorizontal: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 10,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 10,
  },
  menuIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextGroup: {
    flex: 1,
  },
  menuRowTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  menuRowSub: {
    fontSize: 10.5,
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    marginVertical: 4,
    marginHorizontal: 8,
  },
});

