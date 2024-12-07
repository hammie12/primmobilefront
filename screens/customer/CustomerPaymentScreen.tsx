import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Typography } from '../../components/Typography';

type PaymentMethod = {
  id: string;
  type: 'card' | 'paypal';
  last4?: string;
  expiryDate?: string;
  cardType?: string;
  email?: string;
  isDefault: boolean;
};

export const CustomerPaymentScreen = () => {
  const [paymentMethods] = React.useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      last4: '4242',
      expiryDate: '12/24',
      cardType: 'Visa',
      isDefault: true,
    },
    {
      id: '2',
      type: 'paypal',
      email: 'jane.smith@example.com',
      isDefault: false,
    },
  ]);

  const renderPaymentMethod = (method: PaymentMethod) => (
    <TouchableOpacity key={method.id} style={styles.paymentMethod}>
      <View style={styles.paymentMethodLeft}>
        <View style={styles.paymentMethodIcon}>
          <MaterialCommunityIcons
            name={method.type === 'card' ? 'credit-card' : 'paypal'}
            size={24}
            color="#FF5722"
          />
        </View>
        <View style={styles.paymentMethodInfo}>
          <Typography variant="body1" style={styles.paymentMethodTitle}>
            {method.type === 'card'
              ? `${method.cardType} ending in ${method.last4}`
              : 'PayPal'}
          </Typography>
          <Typography variant="body2" style={styles.paymentMethodSubtitle}>
            {method.type === 'card'
              ? `Expires ${method.expiryDate}`
              : method.email}
          </Typography>
          {method.isDefault && (
            <View style={styles.defaultBadge}>
              <Typography variant="body2" style={styles.defaultBadgeText}>
                Default
              </Typography>
            </View>
          )}
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#666666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.paymentMethods}>
          {paymentMethods.map(renderPaymentMethod)}
        </View>

        <TouchableOpacity style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={24} color="#FF5722" />
          <Typography variant="body1" style={styles.addButtonText}>
            Add Payment Method
          </Typography>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <View style={styles.infoIcon}>
            <MaterialCommunityIcons name="shield-check" size={24} color="#FF5722" />
          </View>
          <Typography variant="body2" style={styles.infoText}>
            Your payment information is encrypted and secure. We use industry-standard
            security measures to protect your data.
          </Typography>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  paymentMethods: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  paymentMethodSubtitle: {
    color: '#666666',
  },
  defaultBadge: {
    backgroundColor: '#FFF5F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  defaultBadgeText: {
    color: '#FF5722',
    fontSize: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFF5F2',
  },
  addButtonText: {
    color: '#FF5722',
    marginLeft: 8,
    fontWeight: '600',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    color: '#666666',
    lineHeight: 20,
  },
});
