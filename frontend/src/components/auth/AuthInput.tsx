import React, { useState, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { useTheme } from '@/context/themeContext';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from './BrandIcons';

interface AuthInputProps extends TextInputProps {
  label: string;
  isPassword?: boolean;
  isEmail?: boolean;
  rightLabelAction?: {
    text: string;
    onPress: () => void;
  };
  error?: string;
}

export const AuthInput: React.FC<AuthInputProps> = memo(({
  label,
  isPassword = false,
  isEmail = false,
  rightLabelAction,
  error,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const { theme, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus: TextInputProps['onFocus'] = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur: TextInputProps['onBlur'] = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const inputBgColor = isFocused
    ? isDark
      ? '#24211F'
      : '#FFFFFF'
    : isDark
    ? '#201E1C'
    : theme.colors.background.surface;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>{label}</Text>
        {rightLabelAction && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={rightLabelAction.onPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.rightActionText, { color: theme.colors.text.link }]}>
              {rightLabelAction.text}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: inputBgColor,
            borderColor: isFocused
              ? theme.colors.primary.default
              : Boolean(error)
              ? theme.colors.status.error
              : theme.colors.border.default,
            borderWidth: isFocused ? 1.5 : 1,
          },
        ]}
      >
        {/* Leading Icon (Mail or Lock) */}
        {isEmail && (
          <View style={styles.leadingIcon}>
            <MailIcon
              size={18}
              color={isFocused ? theme.colors.primary.default : theme.colors.text.muted}
            />
          </View>
        )}
        {isPassword && (
          <View style={styles.leadingIcon}>
            <LockIcon
              size={18}
              color={isFocused ? theme.colors.primary.default : theme.colors.text.muted}
            />
          </View>
        )}

        <TextInput
          style={[styles.input, { color: theme.colors.text.primary }, style]}
          placeholderTextColor={theme.colors.text.muted}
          secureTextEntry={isPassword && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize={isPassword ? 'none' : props.autoCapitalize ?? 'none'}
          autoCorrect={false}
          blurOnSubmit={false}
          selectionColor={theme.colors.primary.default}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {showPassword ? (
              <EyeOffIcon size={20} color={theme.colors.text.secondary} />
            ) : (
              <EyeIcon size={20} color={theme.colors.text.secondary} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {Boolean(error) && (
        <Text style={[styles.errorText, { color: theme.colors.status.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  rightActionText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  leadingIcon: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 6,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
