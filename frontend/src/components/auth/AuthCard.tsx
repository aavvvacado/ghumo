import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { useAuth } from '@/context/authContext';
import { useTheme } from '@/context/themeContext';
import { OAuthProvider } from '@/domain/models/auth';
import { AuthTabSwitch, AuthMode } from './AuthTabSwitch';
import { ThemeToggle } from './ThemeToggle';
import { AuthInput } from './AuthInput';
import { SocialButton } from './SocialButton';
import { Divider } from './Divider';
import { Checkbox } from './Checkbox';
import { PrimaryButton } from './PrimaryButton';
import { HeritageFooterIllustration } from './HeritageFooterIllustration';

export const AuthCard: React.FC = () => {
  const { login, signUp, loginWithOAuth, skipAuth, isLoading, authAction, error, clearError } = useAuth();
  const { theme, isDark } = useTheme();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);

  const isAuthProcessing = isLoading || Boolean(authAction);

  // Animation values for smooth tab transition
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleTabChange = (newMode: AuthMode) => {
    if (newMode === mode) return;

    clearError();
    setMode(newMode);

    // Instant snappy transition without spring bounce
    fadeAnim.setValue(0.35);
    slideAnim.setValue(newMode === 'signup' ? 10 : -10);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 130,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      showAlert('Required', 'Please enter your email address.');
      return;
    }
    if (!password) {
      showAlert('Required', 'Please enter your password.');
      return;
    }

    try {
      if (mode === 'login') {
        await login({ email: email.trim(), password });
      } else {
        await signUp({
          email: email.trim(),
          password,
          newsletterConsent,
        });
      }
    } catch {
      // Error handled in auth context
    }
  };

  const handleOAuth = async (provider: OAuthProvider) => {
    setLoadingProvider(provider);
    try {
      await loginWithOAuth(provider);
    } catch {
      // Handled in context
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleForgotPassword = () => {
    showAlert(
      'Reset Password',
      email.trim()
        ? `A password reset link will be sent to ${email.trim()}.`
        : 'Please enter your email address to receive reset instructions.'
    );
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: theme.colors.background.surface,
          borderColor: isDark ? '#2D2A27' : '#EFEAE2',
        },
      ]}
    >
      <View style={styles.cardContent} pointerEvents={isAuthProcessing ? 'none' : 'auto'}>
        {/* Top Tab Pill Switch + Modular Theme Toggle beside it */}
        <View style={styles.topSwitchRow}>
          <AuthTabSwitch activeTab={mode} onTabChange={handleTabChange} />
          <ThemeToggle />
        </View>

        {/* Global Error Banner */}
        {Boolean(error) && (
          <View style={[styles.errorBanner, { backgroundColor: isDark ? '#2A1414' : '#FEF2F2', borderColor: isDark ? '#5C2222' : '#FCA5A5' }]}>
            <Text style={[styles.errorBannerText, { color: theme.colors.status.error }]}>{error}</Text>
          </View>
        )}

        {/* Animated Tab Form Body */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          }}
        >
          {mode === 'login' ? (
            /* ================= LOGIN FORM ================= */
            <View style={styles.formContainer}>
              <AuthInput
                label="Email address"
                placeholder="Enter your email address"
                keyboardType="email-address"
                isEmail
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) clearError();
                }}
              />

              <AuthInput
                label="Password"
                placeholder="Enter your password"
                isPassword
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) clearError();
                }}
                rightLabelAction={{
                  text: 'Forgot password?',
                  onPress: handleForgotPassword,
                }}
              />

              <PrimaryButton
                title="Log In"
                onPress={handleEmailSubmit}
                isLoading={isLoading && !loadingProvider}
                showArrow
              />

              <Divider />

              <SocialButton
                provider="google"
                onPress={handleOAuth}
                isLoading={loadingProvider === 'google'}
              />
              <SocialButton
                provider="apple"
                onPress={handleOAuth}
                isLoading={loadingProvider === 'apple'}
              />
              <SocialButton
                provider="binance"
                onPress={handleOAuth}
                isLoading={loadingProvider === 'binance'}
              />
              <SocialButton
                provider="wallet"
                onPress={handleOAuth}
                isLoading={loadingProvider === 'wallet'}
              />

              {/* Exact spacer matching the Checkbox height in Sign Up */}
              <View style={styles.checkboxSpacer} />
            </View>
          ) : (
            /* ================= SIGN UP FORM ================= */
            <View style={styles.formContainer}>
              <SocialButton
                provider="google"
                onPress={handleOAuth}
                isLoading={loadingProvider === 'google'}
              />
              <SocialButton
                provider="apple"
                onPress={handleOAuth}
                isLoading={loadingProvider === 'apple'}
              />
              <SocialButton
                provider="binance"
                onPress={handleOAuth}
                isLoading={loadingProvider === 'binance'}
              />
              <SocialButton
                provider="wallet"
                onPress={handleOAuth}
                isLoading={loadingProvider === 'wallet'}
              />

              <Divider />

              <AuthInput
                label="Email address"
                placeholder="Enter your email address"
                keyboardType="email-address"
                isEmail
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) clearError();
                }}
              />

              <AuthInput
                label="Password"
                placeholder="Enter your password"
                isPassword
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) clearError();
                }}
              />

              <PrimaryButton
                title="Create an account"
                onPress={handleEmailSubmit}
                isLoading={isLoading && !loadingProvider}
                showArrow
              />

              <Checkbox
                checked={newsletterConsent}
                onChange={setNewsletterConsent}
                label="Please keep me updated by email with the latest news, research findings, reward programs, event updates."
              />
            </View>
          )}
        </Animated.View>

        {/* Footer Navigation & Links */}
        <View style={styles.footerSection}>
          {mode === 'login' ? (
            <Text style={[styles.footerPromptText, { color: theme.colors.text.secondary }]}>
              Don't have an account yet?{' '}
              <Text
                style={[styles.footerHighlightLink, { color: theme.colors.text.link }]}
                onPress={() => handleTabChange('signup')}
              >
                Sign up
              </Text>
            </Text>
          ) : (
            <Text style={[styles.footerPromptText, { color: theme.colors.text.secondary }]}>
              Already have an account?{' '}
              <Text
                style={[styles.footerHighlightLink, { color: theme.colors.text.link }]}
                onPress={() => handleTabChange('login')}
              >
                Login
              </Text>
            </Text>
          )}

          {/* Skip Login Action */}
          <TouchableOpacity
            style={styles.skipActionButton}
            activeOpacity={0.7}
            onPress={skipAuth}
            accessibilityRole="button"
            accessibilityLabel="Skip login for now"
          >
            <Text style={[styles.skipActionText, { color: theme.colors.text.secondary }]}>
              Skip login for now →
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Heritage Architecture Skyline Background */}
      <HeritageFooterIllustration />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
    marginTop: -24,
    borderWidth: 1,
  },
  cardContent: {
    paddingTop: 24,
    paddingHorizontal: 22,
    paddingBottom: 40,
    zIndex: 2,
  },
  topSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
    gap: 12,
  },
  formContainer: {
    width: '100%',
  },
  checkboxSpacer: {
    height: 38,
    marginTop: 14,
    marginBottom: 6,
  },
  errorBanner: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  footerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    gap: 12,
  },
  footerPromptText: {
    fontSize: 13.5,
    fontWeight: '400',
  },
  footerHighlightLink: {
    fontWeight: '700',
  },
  skipActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipActionText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
