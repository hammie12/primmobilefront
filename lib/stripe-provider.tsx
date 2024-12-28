import React from 'react';
import { StripeProvider as StripeProviderBase } from '@stripe/stripe-react-native';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'YOUR_STRIPE_PUBLISHABLE_KEY';

export const StripeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StripeProviderBase publishableKey={STRIPE_PUBLISHABLE_KEY}>
      {children}
    </StripeProviderBase>
  );
}; 