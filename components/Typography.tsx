import React from 'react';
import { Text, TextStyle } from 'react-native';

type TypographyProps = {
  variant?: 'h1' | 'h2' | 'body1' | 'button' | 'caption';
  style?: TextStyle;
  children: React.ReactNode;
};

export const Typography: React.FC<TypographyProps> = ({ 
  variant = 'body1', 
  style, 
  children 
}) => {
  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return {
          fontSize: 24,
          fontWeight: '700',
        };
      case 'h2':
        return {
          fontSize: 20,
          fontWeight: '600',
        };
      case 'button':
        return {
          fontSize: 16,
          fontWeight: '600',
        };
      case 'caption':
        return {
          fontSize: 12,
          fontWeight: '400',
        };
      default:
        return {
          fontSize: 16,
          fontWeight: '400',
        };
    }
  };

  return (
    <Text style={[getVariantStyle(), style]}>
      {children}
    </Text>
  );
};
