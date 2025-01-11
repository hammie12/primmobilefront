import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'body1' | 'body2' | 'caption';
  style?: TextStyle;
  children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  style,
  children,
}) => {
  return (
    <Text style={[styles[variant], style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  body1: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333333',
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666666',
  },
});
