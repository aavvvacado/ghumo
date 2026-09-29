import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { useTheme } from '@/context/themeContext';
import { ArrowRightIcon } from './BrandIcons';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  showArrow?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  showArrow = true,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.button,
        {
          backgroundColor: theme.colors.primary.default,
          shadowColor: theme.colors.primary.default,
        },
        (disabled || isLoading) && {
          backgroundColor: theme.colors.primary.disabled,
          shadowOpacity: 0,
          elevation: 0,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      accessibilityRole="button"
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <View style={styles.content}>
          <Text style={[styles.text, textStyle]}>{title}</Text>
          {showArrow && (
            <View style={styles.arrowContainer}>
              <ArrowRightIcon size={16} color="#FFFFFF" />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
