import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CustomerNavigationBar } from '../../components/CustomerNavigationBar';
import { Typography } from '../../components/Typography';
import { useNavigation } from '@react-navigation/native';

export const BookingConfirmationScreen = ({ route }) => {
  const navigation = useNavigation();
  const { 
    professionalId,
    serviceName,
    servicePrice,
    serviceDuration,
    professionalName,
    date,
    time
  } = route.params;

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'apple', 'google'
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);
  const [isGooglePayAvailable, setIsGooglePayAvailable] = useState(false);

  useEffect(() => {
    // In a real app, you would check if the device supports Apple Pay/Google Pay
    setIsApplePayAvailable(Platform.OS === 'ios');
    setIsGooglePayAvailable(Platform.OS === 'android');
  }, []);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handlePayment = () => {
    let message = '';
    switch(paymentMethod) {
      case 'apple':
        message = 'Processing Apple Pay payment...';
        break;
      case 'google':
        message = 'Processing Google Pay payment...';
        break;
      default:
        message = 'Processing card payment...';
    }

    Alert.alert(
      'Booking Confirmed!',
      'Your appointment has been successfully booked.',
      [
        {
          text: 'View My Bookings',
          onPress: () => navigation.navigate('CustomerBookings'),
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
      </TouchableOpacity>
      <Typography variant="h1" style={styles.headerTitle}>
        Confirm Booking
      </Typography>
    </View>
  );

  const renderBookingSummary = () => (
    <View style={styles.summaryContainer}>
      <Typography variant="h2" style={styles.sectionTitle}>
        Booking Summary
      </Typography>
      <View style={styles.summaryItem}>
        <Typography variant="body2" style={styles.summaryLabel}>Service</Typography>
        <Typography variant="body1" style={styles.summaryValue}>{serviceName}</Typography>
      </View>
      <View style={styles.summaryItem}>
        <Typography variant="body2" style={styles.summaryLabel}>Professional</Typography>
        <Typography variant="body1" style={styles.summaryValue}>{professionalName}</Typography>
      </View>
      <View style={styles.summaryItem}>
        <Typography variant="body2" style={styles.summaryLabel}>Date</Typography>
        <Typography variant="body1" style={styles.summaryValue}>{date}</Typography>
      </View>
      <View style={styles.summaryItem}>
        <Typography variant="body2" style={styles.summaryLabel}>Time</Typography>
        <Typography variant="body1" style={styles.summaryValue}>{time}</Typography>
      </View>
      <View style={styles.summaryItem}>
        <Typography variant="body2" style={styles.summaryLabel}>Duration</Typography>
        <Typography variant="body1" style={styles.summaryValue}>{serviceDuration}</Typography>
      </View>
      <View style={[styles.summaryItem, styles.totalItem]}>
        <Typography variant="h3" style={styles.totalLabel}>Total</Typography>
        <Typography variant="h3" style={styles.totalValue}>{servicePrice}</Typography>
      </View>
    </View>
  );

  const renderPaymentForm = () => (
    <View style={styles.paymentContainer}>
      <Typography variant="h2" style={styles.sectionTitle}>
        Payment Details
      </Typography>
      
      <View style={styles.inputContainer}>
        <Typography variant="body2" style={styles.inputLabel}>Card Number</Typography>
        <TextInput
          style={styles.input}
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChangeText={(text) => setCardNumber(formatCardNumber(text))}
          keyboardType="numeric"
          maxLength={19}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
          <Typography variant="body2" style={styles.inputLabel}>Expiry Date</Typography>
          <TextInput
            style={styles.input}
            placeholder="MM/YY"
            value={expiryDate}
            onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
          <Typography variant="body2" style={styles.inputLabel}>CVV</Typography>
          <TextInput
            style={styles.input}
            placeholder="123"
            value={cvv}
            onChangeText={setCvv}
            keyboardType="numeric"
            maxLength={3}
            secureTextEntry
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Typography variant="body2" style={styles.inputLabel}>Name on Card</Typography>
        <TextInput
          style={styles.input}
          placeholder="JOHN SMITH"
          value={cardName}
          onChangeText={setCardName}
          autoCapitalize="characters"
        />
      </View>
    </View>
  );

  const renderPaymentMethods = () => (
    <View style={styles.paymentMethodsContainer}>
      <Typography variant="h2" style={styles.sectionTitle}>
        Payment Method
      </Typography>

      <TouchableOpacity
        style={[
          styles.paymentMethodButton,
          paymentMethod === 'card' && styles.selectedPaymentMethod
        ]}
        onPress={() => setPaymentMethod('card')}
      >
        <MaterialCommunityIcons name="credit-card" size={24} color={paymentMethod === 'card' ? '#FF5722' : '#666'} />
        <Typography
          variant="body1"
          style={[
            styles.paymentMethodText,
            paymentMethod === 'card' && styles.selectedPaymentMethodText
          ]}
        >
          Credit/Debit Card
        </Typography>
      </TouchableOpacity>

      {isApplePayAvailable && (
        <TouchableOpacity
          style={[
            styles.paymentMethodButton,
            paymentMethod === 'apple' && styles.selectedPaymentMethod
          ]}
          onPress={() => setPaymentMethod('apple')}
        >
          <MaterialCommunityIcons name="apple" size={24} color={paymentMethod === 'apple' ? '#FF5722' : '#666'} />
          <Typography
            variant="body1"
            style={[
              styles.paymentMethodText,
              paymentMethod === 'apple' && styles.selectedPaymentMethodText
            ]}
          >
            Apple Pay
          </Typography>
        </TouchableOpacity>
      )}

      {isGooglePayAvailable && (
        <TouchableOpacity
          style={[
            styles.paymentMethodButton,
            paymentMethod === 'google' && styles.selectedPaymentMethod
          ]}
          onPress={() => setPaymentMethod('google')}
        >
          <MaterialCommunityIcons name="google-pay" size={24} color={paymentMethod === 'google' ? '#FF5722' : '#666'} />
          <Typography
            variant="body1"
            style={[
              styles.paymentMethodText,
              paymentMethod === 'google' && styles.selectedPaymentMethodText
            ]}
          >
            Google Pay
          </Typography>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {renderHeader()}
      
      <ScrollView style={styles.content}>
        {renderBookingSummary()}
        {renderPaymentMethods()}
        {paymentMethod === 'card' && renderPaymentForm()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.payButton,
            (paymentMethod === 'card' && (!cardNumber || !expiryDate || !cvv || !cardName)) && 
            styles.payButtonDisabled
          ]}
          disabled={paymentMethod === 'card' && (!cardNumber || !expiryDate || !cvv || !cardName)}
          onPress={handlePayment}
        >
          <Typography variant="button" style={styles.payButtonText}>
            {paymentMethod === 'apple' ? 'Pay with Apple Pay' :
             paymentMethod === 'google' ? 'Pay with Google Pay' :
             `Pay ${servicePrice}`}
          </Typography>
        </TouchableOpacity>
      </View>

      <CustomerNavigationBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  summaryContainer: {
    padding: 16,
    backgroundColor: '#F8F8F8',
    margin: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#666666',
  },
  summaryValue: {
    fontWeight: '500',
  },
  totalItem: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF5722',
  },
  paymentContainer: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
    color: '#666666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  payButton: {
    backgroundColor: '#FF5722',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentMethodsContainer: {
    padding: 16,
    marginBottom: 16,
  },
  paymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedPaymentMethod: {
    borderColor: '#FF5722',
    backgroundColor: '#FFF5F2',
  },
  paymentMethodText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333333',
  },
  selectedPaymentMethodText: {
    color: '#FF5722',
    fontWeight: '500',
  },
});
