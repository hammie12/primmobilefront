import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'body1' | 'body2' | 'caption';

interface TypographyProps {
  variant?: TypographyVariant;
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
    fontWeight: '600',
    lineHeight: 32,
    color: '#000000',
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: '#000000',
  },
  h3: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
    color: '#000000',
  },
  body1: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#000000',
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#000000',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#666666',
  },
});

export default Typography;
