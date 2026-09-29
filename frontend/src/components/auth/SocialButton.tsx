import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/themeContext';
import { OAuthProvider } from '@/domain/models/auth';
import { AppleIcon, BinanceIcon, GoogleIcon, WalletIcon } from './BrandIcons';

interface SocialButtonProps {
  provider: OAuthProvider;
  onPress: (provider: OAuthProvider) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  onPress,
  isLoading = false,
  disabled = false,
}) => {
  const { theme, isDark } = useTheme();

  const renderIcon = () => {
    switch (provider) {
      case 'google':
        return <GoogleIcon size={19} />;
      case 'apple':
        return <AppleIcon size={19} color={theme.colors.text.primary} />;
      case 'binance':
        return <BinanceIcon size={19} />;
      case 'wallet':
        return <WalletIcon size={19} color={theme.colors.text.primary} />;
    }
  };

  const labels: Record<OAuthProvider, string> = {
    google: 'Continue with Google',
    apple: 'Continue with Apple',
    binance: 'Continue with Binance',
    wallet: 'Continue with Wallet',
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[
        styles.button,
        {
          backgroundColor: isDark ? '#1B1A18' : theme.colors.background.surface,
          borderColor: theme.colors.border.default,
        },
        disabled && styles.buttonDisabled,
      ]}
      onPress={() => onPress(provider)}
      disabled={disabled || isLoading}
      accessibilityRole="button"
      accessibilityLabel={labels[provider]}
    >
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.colors.primary.default} />
        ) : (
          <>
            <View style={styles.iconContainer}>{renderIcon()}</View>
            <Text style={[styles.text, { color: theme.colors.text.primary }]}>
              {labels[provider]}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 9,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});
