import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface RouteParams {
  serviceName: string;
  servicePrice: number;
  depositPrice: number;
  fullPrice: number;
  serviceDuration: string;
  professionalName: string;
  selectedDate: string;
  selectedTime: string;
  professionalId: string;
  serviceId: string;
  isRescheduling?: boolean;
  originalBookingId?: string;
  originalBookingStatus?: string;
}

type RootStackParamList = {
  CustomerBookings: undefined;
  // ... other routes
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'CustomerBookings'>;

export const BookingPayment = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const {
    serviceName,
    servicePrice,
    depositPrice,
    fullPrice,
    serviceDuration,
    professionalName,
    selectedDate,
    selectedTime,
    professionalId,
    serviceId,
    isRescheduling,
    originalBookingId,
    originalBookingStatus
  } = route.params as RouteParams;

  console.log('=== BookingPayment State ===');
  console.log('Route Params:', route.params);
  console.log('Is Rescheduling:', isRescheduling);
  console.log('Original Booking ID:', originalBookingId);
  console.log('Original Booking Status:', originalBookingStatus);
  console.log('Booking Details:', {
    serviceName,
    depositPrice,
    fullPrice,
    serviceDuration,
    professionalName,
    selectedDate,
    selectedTime,
    professionalId,
    serviceId
  });
  console.log('========================');

  const { user } = useAuth();

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="#333" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Payment</Text>
      <View style={styles.backButton} />
    </View>
  );

  const handlePaymentSuccess = async () => {
    try {
      if (!user) {
        console.log('No user found');
        return;
      }

      console.log('Starting booking process...', {
        selectedDate,
        selectedTime,
        serviceDuration,
        professionalId,
        isRescheduling,
        originalBookingId,
        originalBookingStatus
      });

      // Get customer profile id
      const { data: customerProfile, error: customerError } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (customerError || !customerProfile) {
        console.error('Error getting customer profile:', customerError);
        return;
      }

      console.log('Found customer profile:', customerProfile);

      // Verify professional exists and get their user_id
      const { data: professional, error: professionalError } = await supabase
        .from('professionals')
        .select('id, user_id, business_name')
        .eq('id', professionalId)
        .single();

      if (professionalError || !professional) {
        console.error('Error verifying professional:', professionalError);
        Alert.alert('Error', 'Could not verify professional. Please try again.');
        return;
      }

      console.log('Verified professional exists:', professional);

      // Check if professional_profile exists
      const { data: professionalProfile, error: profileError } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', professional.user_id)
        .single();

      let professionalProfileId;

      if (!professionalProfile) {
        console.log('Creating professional profile...');
        // Create professional_profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('professional_profiles')
          .insert([
            {
              user_id: professional.user_id,
              business_name: professional.business_name || 'Unknown Business',
            }
          ])
          .select()
          .single();

        if (createError) {
          console.error('Error creating professional profile:', createError);
          Alert.alert('Error', 'Could not create professional profile. Please try again.');
          return;
        }

        professionalProfileId = newProfile.id;
        console.log('Created professional profile:', newProfile);
      } else {
        professionalProfileId = professionalProfile.id;
        console.log('Found existing professional profile:', professionalProfile);
      }

      // Calculate end time
      const [selectedHours, selectedMinutes] = selectedTime.split(':').map(Number);
      const durationInMinutes = parseInt(serviceDuration);
      
      // Create a new date object from selectedDate
      const startDateTime = new Date(selectedDate);
      // Set the hours and minutes from the selected time
      startDateTime.setUTCHours(selectedHours);
      startDateTime.setUTCMinutes(selectedMinutes);
      startDateTime.setUTCSeconds(0);
      startDateTime.setUTCMilliseconds(0);
      
      // Create end time by adding duration
      const endDateTime = new Date(startDateTime);
      endDateTime.setUTCMinutes(endDateTime.getUTCMinutes() + durationInMinutes);

      console.log('Time details:', {
        selectedTime,
        selectedTimeHours: selectedHours,
        selectedTimeMinutes: selectedMinutes,
        serviceDuration: durationInMinutes,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        localStartTime: startDateTime.toLocaleString(),
        localEndTime: endDateTime.toLocaleString()
      });

      if (isRescheduling && originalBookingId) {
        // Call the reschedule_booking RPC function
        const { data: rescheduledBooking, error: bookingError } = await supabase
          .rpc('reschedule_booking', {
            p_booking_id: originalBookingId,
            p_new_start_time: startDateTime.toISOString(),
            p_new_end_time: endDateTime.toISOString()
          });

        if (bookingError) {
          console.error('Booking reschedule error details:', {
            code: bookingError.code,
            message: bookingError.message,
            details: bookingError.details
          });
          Alert.alert('Error', 'Failed to reschedule booking. Please try again.');
          return;
        }

        console.log('Booking rescheduled successfully:', rescheduledBooking);
        
        // Show success message before navigation
        Alert.alert(
          'Success',
          'Your booking has been rescheduled!',
          [{
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'CustomerBookings',
                    params: {
                      initialTab: 'upcoming',
                      selectedBookingId: originalBookingId,
                      refresh: true
                    }
                  }
                ]
              });
            }
          }]
        );
      } else {
        // Create a new booking
        const { data: newBooking, error: bookingError } = await supabase
          .rpc('create_simple_booking', {
            p_customer_id: customerProfile.id,
            p_professional_id: professionalProfileId,
            p_service_id: serviceId,
            p_start_time: startDateTime.toISOString(),
            p_end_time: endDateTime.toISOString()
          });

        if (bookingError) {
          console.error('Booking creation error details:', {
            code: bookingError.code,
            message: bookingError.message,
            details: bookingError.details
          });
          Alert.alert('Error', 'Failed to create booking. Please try again.');
          return;
        }

        console.log('Booking created successfully:', newBooking);
        
        // Show success message before navigation
        Alert.alert(
          'Success',
          'Your booking has been created!',
          [{
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'CustomerBookings',
                    params: {
                      initialTab: 'upcoming',
                      selectedBookingId: newBooking?.id,
                      refresh: true
                    }
                  }
                ]
              });
            }
          }]
        );
      }
    } catch (error) {
      console.error('Error in booking creation:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {renderHeader()}
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Service:</Text>
              <Text style={styles.detailText}>{serviceName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Professional:</Text>
              <Text style={styles.detailText}>{professionalName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailText}>
                {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailText}>
                {selectedTime} - {format(
                  new Date(
                    new Date(selectedDate).setHours(
                      parseInt(selectedTime.split(':')[0]),
                      parseInt(selectedTime.split(':')[1]) + parseInt(serviceDuration)
                    )
                  ),
                  'HH:mm'
                )}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration:</Text>
              <Text style={styles.detailText}>{serviceDuration} minutes</Text>
            </View>
            <View style={[styles.detailRow, styles.totalRow]}>
              <View style={styles.priceContainer}>
                <View style={styles.priceRow}>
                  <Text style={styles.totalLabel}>Full Price:</Text>
                  <Text style={styles.totalAmount}>£{fullPrice}</Text>
                </View>
                <Text style={styles.paymentNote}>Pay to service provider</Text>
                <View style={[styles.priceRow, styles.depositRow]}>
                  <Text style={styles.totalLabel}>Deposit:</Text>
                  <Text style={styles.totalAmount}>£{depositPrice}</Text>
                </View>
                <Text style={styles.paymentNote}>Pay on <Text style={styles.primText}>Priim</Text></Text>
              </View>
            </View>
          </View>

          <View style={styles.paymentMethodsContainer}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            {/* TODO: Add payment method selection */}
            <TouchableOpacity style={styles.paymentMethodCard}>
              <Ionicons name="card-outline" size={24} color="#666" />
              <Text style={styles.paymentMethodText}>Add Payment Method</Text>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.payButton}
            onPress={handlePaymentSuccess}
          >
            <Text style={styles.payButtonText}>Pay Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 70,
  },
  backText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF5722',
  },
  paymentMethodsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  payButton: {
    backgroundColor: '#FF5722',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  priceContainer: {
    width: '100%',
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  depositRow: {
    marginTop: 12,
  },
  paymentNote: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'right',
  },
  primText: {
    color: '#FF5722',
    fontWeight: '600',
  },
}); 