import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { BookingService } from '../../lib/services/bookingService';
import { supabase } from '../../lib/supabase';

interface RouteParams {
  professionalId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: string;
  professionalName: string;
  serviceId: string;
}

type RootStackParamList = {
  CustomerBookings: undefined;
  BookingPayment: {
    serviceName: string;
    servicePrice: number;
    serviceDuration: string;
    professionalName: string;
    selectedDate: string;
    selectedTime: string;
    professionalId: string;
    serviceId: string;
  };
  // ... other routes
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'CustomerBookings'>;

type BusinessHours = {
  [key: string]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
};

export const BookingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { professionalId, serviceName, servicePrice, serviceDuration, professionalName, serviceId } = route.params as RouteParams;
  console.log('BookingScreen received professionalId:', professionalId);
  const { user } = useAuth();
  const bookingService = new BookingService();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [workingHours, setWorkingHours] = useState<BusinessHours | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchWorkingHours();
  }, []);

  const fetchWorkingHours = async () => {
    try {
      setLoading(true);
      setError(null);
      const hours = await bookingService.getWorkingHours(professionalId);
      
      if (!hours) {
        setError('Professional has not set their working hours');
        return;
      }
      
      setWorkingHours(hours);
    } catch (error) {
      console.error('Error fetching working hours:', error);
      setError('Failed to load professional\'s working hours');
      Alert.alert('Error', 'Failed to load professional\'s working hours');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!workingHours) {
        setError('Working hours not available');
        return;
      }

      // First get the professional profile ID
      const { data: professional, error: profError } = await supabase
        .from('professionals')
        .select('id, user_id')
        .eq('id', professionalId)
        .single();

      if (profError) {
        console.error('Error getting professional:', profError);
        throw profError;
      }

      // Get the professional profile ID
      const { data: profProfile, error: profileError } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', professional.user_id)
        .single();

      if (profileError) {
        console.error('Error getting professional profile:', profileError);
        throw profileError;
      }

      const professionalProfileId = profProfile.id;
      console.log('Using professional profile ID for bookings:', professionalProfileId);

      const dayOfWeek = selectedDate.getDay();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const daySchedule = workingHours[days[dayOfWeek]];

      if (!daySchedule || !daySchedule.isOpen) {
        setAvailableSlots([]);
        setBookedSlots([]);
        return;
      }

      // Get existing bookings for the selected date and professional
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      console.log('Fetching bookings for date range:', {
        start: startOfDay.toISOString(),
        end: endOfDay.toISOString(),
        professionalProfileId
      });

      const { data: existingBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('professional_id', professionalProfileId)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .in('status', ['CONFIRMED', 'PENDING']);

      if (bookingsError) {
        console.error('Error fetching existing bookings:', bookingsError);
        throw bookingsError;
      }

      console.log('Existing bookings:', existingBookings);

      // Convert booking times to Date objects
      const bookings = (existingBookings || []).map(booking => ({
        start: new Date(booking.start_time),
        end: new Date(booking.end_time)
      }));

      const availableSlots: string[] = [];
      const unavailableSlots: string[] = [];
      const [openHour, openMinute] = daySchedule.openTime.split(':').map(Number);
      const [closeHour, closeMinute] = daySchedule.closeTime.split(':').map(Number);

      // Current time
      const now = new Date();
      const isToday = selectedDate.toDateString() === now.toDateString();

      for (let hour = openHour; hour < closeHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          // Skip if before opening time or after closing time
          if (hour === openHour && minute < openMinute) continue;
          if (hour === closeHour && minute > closeMinute) continue;

          const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          
          // Create a date object for this slot
          const slotDate = new Date(selectedDate);
          slotDate.setHours(hour, minute, 0, 0);

          // Skip if the slot is in the past
          if (isToday && slotDate < now) {
            continue;
          }

          // Calculate slot end time (add service duration)
          const slotEndDate = new Date(slotDate);
          slotEndDate.setMinutes(slotEndDate.getMinutes() + parseInt(serviceDuration));

          // Check if slot overlaps with any existing booking
          const isOverlapping = bookings.some(booking => {
            const overlap = (
              (slotDate >= booking.start && slotDate < booking.end) ||
              (slotEndDate > booking.start && slotEndDate <= booking.end) ||
              (slotDate <= booking.start && slotEndDate >= booking.end)
            );

            if (overlap) {
              console.log('Slot overlap detected:', {
                slot: {
                  start: slotDate.toISOString(),
                  end: slotEndDate.toISOString()
                },
                booking: {
                  start: booking.start.toISOString(),
                  end: booking.end.toISOString()
                }
              });
            }

            return overlap;
          });

          if (isOverlapping) {
            unavailableSlots.push(slotTime);
          } else {
            availableSlots.push(slotTime);
          }
        }
      }

      console.log('Available slots:', availableSlots);
      console.log('Booked slots:', unavailableSlots);
      setAvailableSlots(availableSlots);
      setBookedSlots(unavailableSlots);
    } catch (error) {
      console.error('Error generating time slots:', error);
      setError('Failed to generate time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotPress = (time: string) => {
    // Check if the slot is still available before setting it
    const [hours, minutes] = time.split(':').map(Number);
    const slotDate = new Date(selectedDate);
    slotDate.setHours(hours, minutes, 0, 0);
    
    const now = new Date();
    if (slotDate < now) {
      console.log('Time slot selection failed:', {
        selectedTime: time,
        reason: 'Time is in the past',
        slotDate: slotDate.toISOString(),
        currentTime: now.toISOString()
      });
      Alert.alert('Invalid Selection', 'Cannot book a time slot in the past');
      return;
    }

    console.log('Time slot selected:', {
      time,
      date: selectedDate.toISOString(),
      isAvailable: availableSlots.includes(time),
      isBooked: bookedSlots.includes(time)
    });

    setSelectedTime(time);
  };

  const handleConfirmBooking = () => {
    if (!selectedTime) return;
    
    console.log('Confirming booking:', {
      date: selectedDate.toISOString(),
      time: selectedTime,
      serviceName,
      serviceDuration,
      professionalId,
      serviceId
    });
    
    navigation.navigate('BookingPayment', {
      serviceName,
      servicePrice,
      serviceDuration,
      professionalName,
      selectedDate: selectedDate.toISOString(),
      selectedTime,
      professionalId,
      serviceId,
    });
  };

  const renderTimeSlots = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#FF5722" style={styles.loader} />;
    }

    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }

    // Get all possible time slots for the day
    const allTimeSlots: string[] = [];
    if (workingHours) {
      const dayOfWeek = selectedDate.getDay();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const daySchedule = workingHours[days[dayOfWeek]];

      if (daySchedule && daySchedule.isOpen) {
        const [openHour, openMinute] = daySchedule.openTime.split(':').map(Number);
        const [closeHour, closeMinute] = daySchedule.closeTime.split(':').map(Number);

        for (let hour = openHour; hour < closeHour; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            if (hour === openHour && minute < openMinute) continue;
            if (hour === closeHour && minute > closeMinute) continue;

            const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            allTimeSlots.push(timeSlot);
          }
        }
      }
    }

    if (allTimeSlots.length === 0) {
      console.log('No time slots available for date:', selectedDate.toISOString());
      return (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="calendar-outline" size={48} color="#666" />
          <Text style={styles.noSlots}>No available slots for this day</Text>
          <Text style={styles.emptyStateSubtext}>Please select another date</Text>
        </View>
      );
    }

    return (
      <View style={styles.slotsGrid}>
        {allTimeSlots.map((slot) => {
          const isAvailable = availableSlots.includes(slot);
          const isBooked = bookedSlots.includes(slot);
          const isSelected = selectedTime === slot;

          // Create a date object for this slot to check if it's in the past
          const [hours, minutes] = slot.split(':').map(Number);
          const slotDate = new Date(selectedDate);
          slotDate.setHours(hours, minutes, 0, 0);
          const now = new Date();
          const isPast = slotDate < now;

          // Log the status of each time slot
          console.log('Time slot status:', {
            time: slot,
            date: selectedDate.toISOString(),
            isAvailable,
            isBooked,
            isPast,
            isSelected
          });

          return (
            <TouchableOpacity
              key={slot}
              style={[
                styles.slot,
                (isBooked || !isAvailable) && styles.unavailableSlot,
                isSelected && styles.selectedSlot,
                isPast && styles.pastSlot
              ]}
              onPress={() => isAvailable && !isPast && !isBooked && handleTimeSlotPress(slot)}
              disabled={!isAvailable || isPast || isBooked}
            >
              <Text style={[
                styles.slotText,
                (isBooked || !isAvailable) && styles.unavailableSlotText,
                isSelected && styles.selectedSlotText,
                isPast && styles.pastSlotText
              ]}>
                {slot}
              </Text>
              {isBooked && !isPast && (
                <Text style={styles.bookedText}>Booked</Text>
              )}
              {isPast && (
                <Text style={styles.pastText}>Past</Text>
              )}
              {isAvailable && !isPast && !isBooked && (
                <Text style={styles.availableText}>Available</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderAppointmentDetails = () => {
    if (!selectedTime) return null;

    const formattedDate = format(selectedDate, 'EEEE, MMMM d, yyyy');
    
    // Calculate end time
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(hours, minutes, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + parseInt(serviceDuration));
    
    const timeRange = `${selectedTime} - ${format(endTime, 'HH:mm')}`;
    
    return (
      <View style={styles.appointmentDetails}>
        <Text style={styles.sectionTitle}>Appointment Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.detailRowText}>{formattedDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.detailRowText}>{timeRange}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="cut-outline" size={20} color="#666" />
            <Text style={styles.detailRowText}>{serviceName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <Text style={styles.detailRowText}>{professionalName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="timer-outline" size={20} color="#666" />
            <Text style={styles.detailRowText}>{serviceDuration} minutes</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={20} color="#666" />
            <Text style={styles.detailRowText}>£{servicePrice}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={handleConfirmBooking}
        >
          <Text style={styles.confirmButtonText}>Confirm Booking</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="#333" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Book Appointment</Text>
      <View style={styles.backButton} /> {/* Empty view for flex spacing */}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {renderHeader()}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.serviceInfo}>
            <Text style={styles.title}>{serviceName}</Text>
            <Text style={styles.subtitle}>with {professionalName}</Text>
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.detailText}>{serviceDuration} mins</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="cash-outline" size={20} color="#666" />
                <Text style={styles.detailText}>£{servicePrice}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.calendarContainer}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <Calendar
            onDayPress={(day) => setSelectedDate(new Date(day.timestamp))}
            markedDates={{
              [format(selectedDate, 'yyyy-MM-dd')]: {
                selected: true,
                selectedColor: '#FF5722',
              },
            }}
            minDate={format(new Date(), 'yyyy-MM-dd')}
            theme={{
              todayTextColor: '#FF5722',
              selectedDayBackgroundColor: '#FF5722',
              arrowColor: '#FF5722',
              dotColor: '#FF5722',
              textDayFontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
              textMonthFontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
              textDayHeaderFontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
            }}
          />
        </View>

        <View style={styles.slotsContainer}>
          <Text style={styles.sectionTitle}>Available Times</Text>
          {renderTimeSlots()}
        </View>
        {renderAppointmentDetails()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  serviceInfo: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#666',
  },
  calendarContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  slotsContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  loader: {
    marginTop: 20,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slot: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF5722',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  selectedSlot: {
    backgroundColor: '#FF5722',
  },
  slotText: {
    color: '#FF5722',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedSlotText: {
    color: '#fff',
  },
  noSlots: {
    textAlign: 'center',
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateSubtext: {
    color: '#999',
    fontSize: 14,
    marginTop: 8,
  },
  errorText: {
    textAlign: 'center',
    color: '#FF3B30',
    fontSize: 16,
    padding: 20,
  },
  appointmentDetails: {
    padding: 20,
    backgroundColor: '#fff',
  },
  detailsCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  detailRowText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  confirmButton: {
    backgroundColor: '#FF5722',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
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
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  unavailableSlot: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  unavailableSlotText: {
    color: '#999999',
  },
  pastSlot: {
    backgroundColor: '#F0F0F0',
    borderColor: '#E0E0E0',
  },
  pastSlotText: {
    color: '#BBBBBB',
  },
  bookedText: {
    fontSize: 10,
    color: '#999999',
    marginTop: 4,
  },
  pastText: {
    fontSize: 10,
    color: '#BBBBBB',
    marginTop: 4,
  },
  availableText: {
    fontSize: 10,
    color: '#4CAF50',
    marginTop: 4,
  },
}); 