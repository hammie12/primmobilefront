import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiryDate?: string;
  isDefault: boolean;
}

const PaymentMethodsScreen = ({ navigation }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'stripe',
      last4: '4242',
      expiryDate: '12/24',
      isDefault: true,
    },
    {
      id: '2',
      type: 'paypal',
      last4: 'mail@example.com',
      isDefault: false,
    },
  ]);

  const renderPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'stripe':
        return <Ionicons name="card-outline" size={24} color="#FF5722" />;
      case 'paypal':
        return <Ionicons name="logo-paypal" size={24} color="#FF5722" />;
      default:
        return <Ionicons name="wallet-outline" size={24} color="#FF5722" />;
    }
  };

  const PaymentMethodItem = ({ method }: { method: PaymentMethod }) => (
    <TouchableOpacity style={styles.methodItem}>
      <View style={styles.methodLeft}>
        <View style={styles.iconContainer}>
          {renderPaymentMethodIcon(method.type)}
        </View>
        <View style={styles.methodInfo}>
          <Text style={styles.methodTitle}>
            {method.type === 'stripe' ? '•••• ' + method.last4 : method.last4}
          </Text>
          {method.expiryDate && (
            <Text style={styles.methodExpiry}>Expires {method.expiryDate}</Text>
          )}
        </View>
      </View>
      <View style={styles.methodRight}>
        {method.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
        <Ionicons name="ellipsis-vertical" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  return (
    <BaseSettingsScreen title="Payment Methods" navigation={navigation}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Payment Methods</Text>
          <View style={styles.card}>
            {paymentMethods.map((method) => (
              <PaymentMethodItem key={method.id} method={method} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Payment Method</Text>
          <View style={styles.addMethodsCard}>
            <TouchableOpacity style={styles.addMethodButton}>
              <View style={styles.addMethodIcon}>
                <Ionicons name="card-outline" size={24} color="#FF5722" />
              </View>
              <View style={styles.addMethodInfo}>
                <Text style={styles.addMethodTitle}>Add Credit Card</Text>
                <Text style={styles.addMethodDescription}>
                  Add a credit or debit card
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FF5722" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.addMethodButton}>
              <View style={styles.addMethodIcon}>
                <Ionicons name="logo-paypal" size={24} color="#FF5722" />
              </View>
              <View style={styles.addMethodInfo}>
                <Text style={styles.addMethodTitle}>Connect PayPal</Text>
                <Text style={styles.addMethodDescription}>
                  Link your PayPal account
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FF5722" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Settings</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Currency</Text>
                <Text style={styles.settingValue}>GBP (£)</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FF5722" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Billing Address</Text>
                <Text style={styles.settingValue}>Add address</Text>
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
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  methodExpiry: {
    fontSize: 14,
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
    fontSize: 12,
    color: '#FF5722',
    fontWeight: '500',
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
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  addMethodDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export { PaymentMethodsScreen };
