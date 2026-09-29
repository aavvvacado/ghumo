import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Modal,
  Platform,
} from 'react-native';
import { useAuth } from '@/context/authContext';
import { useTheme } from '@/context/themeContext';

export const AuthLoadingOverlay: React.FC = () => {
  const { authAction, loadingMessage } = useAuth();
  const { theme, isDark } = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const visible = Boolean(authAction || loadingMessage);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous pulse effect for the loading badge
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      return () => {
        pulseLoop.stop();
      };
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const defaultMessage =
    authAction === 'logout'
      ? 'Logging out...'
      : authAction === 'signup'
      ? 'Creating your Ghumo account...'
      : authAction === 'oauth'
      ? 'Connecting...'
      : 'Signing in...';

  const displayMessage = loadingMessage || defaultMessage;

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: fadeAnim,
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(15, 12, 8, 0.45)',
          },
        ]}
      >
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: scaleAnim }],
              backgroundColor: theme.colors.background.surface,
              borderColor: isDark ? '#2D2A27' : '#EFEAE2',
            },
          ]}
        >
          {/* Animated Glow Ring around Spinner */}
          <View style={styles.spinnerWrapper}>
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseAnim }],
                  backgroundColor: isDark ? 'rgba(217, 83, 56, 0.15)' : 'rgba(217, 83, 56, 0.1)',
                },
              ]}
            />
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: isDark ? '#242220' : '#FAF6F0' },
              ]}
            >
              <ActivityIndicator
                size={Platform.OS === 'ios' ? 'large' : 32}
                color={theme.colors.primary.default || '#D95338'}
              />
            </View>
          </View>

          {/* Loading Message & Subtle Subtext */}
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {displayMessage}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Please wait a moment...
          </Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  spinnerWrapper: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
  },
});
