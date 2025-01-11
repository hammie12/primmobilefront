import React from 'react';
import { StripeProvider as StripeProviderBase } from '@stripe/stripe-react-native';

if (!process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Missing Stripe publishable key in environment variables');
}

export const StripeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StripeProviderBase publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY}>
      {children}
    </StripeProviderBase>
  );
}; 