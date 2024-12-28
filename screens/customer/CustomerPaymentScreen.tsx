import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';
import { Typography } from '../../components/Typography';
import { useAuth } from '../../contexts/AuthContext';
import { createSetupIntent, deletePaymentMethod } from '../../lib/stripe';
import { supabase } from '../../lib/supabase';
import { useStripe } from '@stripe/stripe-react-native';

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiryDate?: string;
  isDefault: boolean;
}

export const CustomerPaymentScreen = () => {
  const { user } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
    }
  }, [user]);

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching payment methods for user:', user?.id);
      
      const { data: methods, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user?.id);

      console.log('Fetched payment methods:', methods);
      console.log('Fetch error:', error);

      if (error) throw error;

      if (methods) {
        const formattedMethods = methods.map(method => ({
          id: method.payment_method_id,
          type: method.type,
          last4: method.last4,
          expiryDate: method.expiry_date,
          isDefault: method.is_default,
        }));
        console.log('Formatted payment methods:', formattedMethods);
        setPaymentMethods(formattedMethods);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      Alert.alert('Error', 'Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCard = async () => {
    try {
      if (!user) {
        Alert.alert('Error', 'You must be logged in to add a payment method');
        return;
      }
      
      setIsLoading(true);
      console.log('Creating setup intent...');
      const { clientSecret } = await createSetupIntent();
      
      if (!clientSecret) {
        console.error('No client secret received');
        Alert.alert('Error', 'Failed to initialize payment setup');
        return;
      }

      console.log('Initializing payment sheet with client secret:', clientSecret);
      const { error: initError } = await initPaymentSheet({
        setupIntentClientSecret: clientSecret,
        merchantDisplayName: 'Prim Beauty',
        style: 'automatic',
        returnURL: 'primmobile://stripe-redirect',
        defaultBillingDetails: {
          name: user.email,
          address: {
            country: 'GB'
          }
        },
        appearance: {
          colors: {
            primary: '#FF5722',
          },
        },
        allowsDelayedPaymentMethods: false,
        billingDetailsCollectionConfiguration: {
          name: 'required',
          phone: 'required',
          email: 'required',
          address: 'full',
          defaultValues: {
            address: {
              country: 'GB'
            }
          }
        },
      });

      if (initError) {
        console.error('Error initializing payment sheet:', initError);
        Alert.alert('Error', 'Failed to initialize payment setup');
        return;
      }

      console.log('Presenting payment sheet...');
      const { paymentOption, error: presentError } = await presentPaymentSheet();
      console.log('Payment sheet response:', { paymentOption, presentError });

      if (presentError) {
        if (presentError.code === 'Canceled') {
          console.log('User canceled payment sheet');
          return;
        }
        console.error('Error presenting payment sheet:', presentError);
        Alert.alert('Error', 'Failed to setup payment method');
        return;
      }

      // Extract setup intent ID from client secret
      const setupIntentId = clientSecret.split('_secret_')[0];
      console.log('Setup intent ID:', setupIntentId);

      // Get setup intent details from Stripe
      const { data: setupIntent, error: setupError } = await supabase.rpc('get_setup_intent', {
        client_secret: clientSecret
      });

      console.log('Setup intent details:', setupIntent);
      if (setupError) {
        console.error('Error getting setup intent:', setupError);
        Alert.alert('Error', 'Failed to confirm payment method setup');
        return;
      }

      const paymentMethodId = setupIntent?.payment_method;
      if (!paymentMethodId) {
        console.error('No payment method ID in setup intent');
        Alert.alert('Error', 'Failed to get payment method details');
        return;
      }

      // Get payment method details from Stripe
      const { data: paymentMethod, error: paymentMethodError } = await supabase.rpc('get_payment_method', {
        payment_method_id: paymentMethodId
      });

      console.log('Payment method details:', paymentMethod);
      if (paymentMethodError) {
        console.error('Error getting payment method:', paymentMethodError);
        Alert.alert('Error', 'Failed to get payment method details');
        return;
      }

      // Save the payment method to our database
      const { error: saveError } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id,
          payment_method_id: paymentMethodId,
          type: 'card',
          last4: paymentMethod?.card?.last4 || '',
          expiry_date: paymentMethod?.card?.exp_month && paymentMethod?.card?.exp_year
            ? `${String(paymentMethod.card.exp_month).padStart(2, '0')}/${paymentMethod.card.exp_year}`
            : undefined,
          is_default: (await supabase
            .from('payment_methods')
            .select('id')
            .eq('user_id', user.id)
          ).data?.length === 0, // Make it default if it's the first one
        });

      if (saveError) {
        console.error('Error saving payment method:', saveError);
        Alert.alert('Error', 'Payment method was added but failed to save to database');
        return;
      }

      console.log('Payment method saved successfully');
      Alert.alert('Success', 'Card added successfully');
      await fetchPaymentMethods();
    } catch (error) {
      console.error('Error adding payment method:', error);
      Alert.alert('Error', error.message || 'Failed to add payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    try {
      setIsLoading(true);
      await deletePaymentMethod(methodId);
      
      // Remove from local state
      setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
      Alert.alert('Success', 'Payment method removed');
    } catch (error) {
      console.error('Error deleting payment method:', error);
      Alert.alert('Error', 'Failed to remove payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('payment_method_id', methodId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Update local state
      setPaymentMethods(prev => prev.map(method => ({
        ...method,
        isDefault: method.id === methodId,
      })));

      Alert.alert('Success', 'Default payment method updated');
    } catch (error) {
      console.error('Error setting default payment method:', error);
      Alert.alert('Error', 'Failed to update default payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSettingItem = (method: PaymentMethod) => (
    <TouchableOpacity
      key={method.id}
      style={styles.methodItem}
      onPress={() => {
        Alert.alert(
          'Payment Method Options',
          'What would you like to do?',
          [
            {
              text: 'Set as Default',
              onPress: () => handleSetDefault(method.id),
              style: 'default',
            },
            {
              text: 'Remove',
              onPress: () => handleDeletePaymentMethod(method.id),
              style: 'destructive',
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ],
        );
      }}
    >
      <View style={styles.methodLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name="card" size={24} color="#FF5722" />
        </View>
        <View style={styles.methodInfo}>
          <Typography variant="body1" style={styles.methodTitle}>
            •••• {method.last4}
          </Typography>
          {method.expiryDate && (
            <Typography variant="body2" style={styles.methodExpiry}>
              Expires {method.expiryDate}
            </Typography>
          )}
        </View>
      </View>
      <View style={styles.methodRight}>
        {method.isDefault && (
          <View style={styles.defaultBadge}>
            <Typography variant="caption" style={styles.defaultText}>
              Default
            </Typography>
          </View>
        )}
        <Ionicons name="ellipsis-vertical" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  return (
    <BaseSettingsScreen 
      title="Payment Methods"
      isLoading={isLoading}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Typography variant="h2" style={styles.sectionTitle}>
            Your Payment Methods
          </Typography>
          <View style={styles.card}>
            {paymentMethods.length > 0 ? (
              paymentMethods.map(renderSettingItem)
            ) : (
              <View style={styles.emptyState}>
                <Typography variant="body1" style={styles.emptyStateText}>
                  No payment methods added yet
                </Typography>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Typography variant="h2" style={styles.sectionTitle}>
            Add Payment Method
          </Typography>
          <View style={styles.addMethodsCard}>
            <TouchableOpacity 
              style={styles.addMethodButton}
              onPress={handleAddCard}
            >
              <View style={styles.addMethodIcon}>
                <Ionicons name="card-outline" size={24} color="#FF5722" />
              </View>
              <View style={styles.addMethodInfo}>
                <Typography variant="body1" style={styles.addMethodTitle}>
                  Add Credit Card
                </Typography>
                <Typography variant="body2" style={styles.addMethodDescription}>
                  Add a credit or debit card
                </Typography>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FF5722" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </BaseSettingsScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#666',
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    color: '#1a1a1a',
  },
  methodExpiry: {
    color: '#666',
    marginTop: 2,
  },
  methodRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultBadge: {
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  defaultText: {
    color: '#FF5722',
  },
  addMethodsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addMethodInfo: {
    flex: 1,
  },
  addMethodTitle: {
    color: '#1a1a1a',
  },
  addMethodDescription: {
    color: '#666',
    marginTop: 2,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#666',
  },
});
