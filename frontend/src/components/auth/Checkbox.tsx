import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/context/themeContext';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.container}
      onPress={() => !disabled && onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      disabled={disabled}
    >
      <View
        style={[
          styles.box,
          {
            backgroundColor: isDark ? '#201E1C' : theme.colors.background.surface,
            borderColor: theme.colors.border.strong,
          },
          checked && {
            backgroundColor: theme.colors.primary.default,
            borderColor: theme.colors.primary.default,
          },
        ]}
      >
        {checked && (
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M20 6L9 17l-5-5" />
          </Svg>
        )}
      </View>
      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
    marginBottom: 6,
    gap: 10,
  },
  box: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  label: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
});
