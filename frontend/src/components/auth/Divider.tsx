import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/themeContext';

interface DividerProps {
  label?: string;
}

export const Divider: React.FC<DividerProps> = ({ label = 'OR' }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: theme.colors.border.default }]} />
      <Text style={[styles.text, { color: theme.colors.text.muted }]}>{label}</Text>
      <View style={[styles.line, { backgroundColor: theme.colors.border.default }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    width: '100%',
  },
  line: {
    flex: 1,
    height: 1,
  },
  text: {
    marginHorizontal: 12,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
});
