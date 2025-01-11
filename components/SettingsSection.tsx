import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface SettingsSectionProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    marginBottom: 24,
    borderRadius: 12,
  },
}); 