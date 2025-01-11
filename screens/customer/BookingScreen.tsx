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
import { showMessage } from 'react-native-flash-message';

interface RouteParams {
  professionalId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: string;
  professionalName: string;
  serviceId: string;
  depositPrice: number;
  fullPrice: number;
  isRescheduling?: boolean;
  originalBookingId?: string;
  originalBookingStatus?: string;
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
    depositPrice: number;
    fullPrice: number;
    isRescheduling?: boolean;
    originalBookingId?: string;
    originalBookingStatus?: string;
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

const DAYS_OF_WEEK = [
  'Monday',    // 1
  'Tuesday',   // 2
  'Wednesday', // 3
  'Thursday',  // 4
  'Friday',    // 5
  'Saturday',  // 6
  'Sunday'     // 7
];

export const BookingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { 
    professionalId, 
    serviceName, 
    servicePrice,
    depositPrice,
    fullPrice,
    serviceDuration, 
    professionalName, 
    serviceId, 
    isRescheduling = false,
    originalBookingId,
    originalBookingStatus 
  } = route.params as RouteParams;
  
  console.log('=== BookingScreen State ===');
  console.log('Route Params:', route.params);
  console.log('Is Rescheduling:', isRescheduling);
  console.log('Original Booking ID:', originalBookingId);
  console.log('Original Booking Status:', originalBookingStatus);
  console.log('Professional ID:', professionalId);
  console.log('Service Details:', {
    name: serviceName,
    depositPrice,
    fullPrice,
    duration: serviceDuration,
    id: serviceId
  });
  console.log('Professional Name:', professionalName);
  console.log('========================');

  useEffect(() => {
    // Update screen title based on mode
    navigation.setOptions({
      title: isRescheduling ? 'Reschedule Booking' : 'New Booking',
      headerTitle: isRescheduling ? 'Reschedule Booking' : 'New Booking'
    });
  }, [isRescheduling, navigation]);

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
      
      // Fetch working hours from the working_hours table
      const { data: workingHours, error: workingHoursError } = await supabase
        .from('working_hours')
        .select('*')
        .eq('professional_id', professionalId);

      if (workingHoursError) {
        console.error('Error fetching working hours:', workingHoursError);
        throw workingHoursError;
      }

      // Transform working hours into the expected format
      const businessHours = DAYS_OF_WEEK.reduce((acc, day, index) => {
        // Add 1 to index to match 1-7 range
        const dayHours = workingHours?.find(wh => wh.day_of_week === index + 1);
        acc[day] = {
          isOpen: dayHours?.is_open ?? false,
          openTime: dayHours?.start_time ?? '09:00',
          closeTime: dayHours?.end_time ?? '17:00'
        };
        return acc;
      }, {} as Record<string, { isOpen: boolean; openTime: string; closeTime: string }>);

      console.log('Transformed business hours:', businessHours);
      setWorkingHours(businessHours);
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

      // Call BookingService to get available and booked slots
      const bookingService = new BookingService();
      const slots = await bookingService.getAvailableTimeSlots(
        professionalId,
        selectedDate,
        parseInt(serviceDuration),
        isRescheduling ? originalBookingId : undefined
      );

      // Update state with the fetched slots
      setAvailableSlots(slots.available);
      setBookedSlots(slots.booked);
      
      console.log('Slots fetched:', {
        available: slots.available.length,
        booked: slots.booked.length
      });
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setError('Failed to load available time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotPress = (time: string) => {
    // Create date objects for comparison
    const [hours, minutes] = time.split(':').map(Number);
    const slotStartTime = new Date(selectedDate);
    slotStartTime.setHours(hours, minutes, 0, 0);
    
    const slotEndTime = new Date(slotStartTime);
    slotEndTime.setMinutes(slotEndTime.getMinutes() + parseInt(serviceDuration));
    
    const now = new Date();
    if (slotStartTime < now) {
      console.log('Time slot selection failed:', {
        selectedTime: time,
        reason: 'Time is in the past',
        slotDate: slotStartTime.toISOString(),
        currentTime: now.toISOString()
      });
      Alert.alert('Invalid Selection', 'Cannot book a time slot in the past');
      return;
    }

    // Check if the slot is actually available
    if (!availableSlots.includes(time) || bookedSlots.includes(time)) {
      console.log('Time slot selection failed:', {
        selectedTime: time,
        reason: 'Slot is not available',
        isAvailable: availableSlots.includes(time),
        isBooked: bookedSlots.includes(time)
      });
      Alert.alert('Invalid Selection', 'This time slot is not available');
      return;
    }

    console.log('Time slot selected:', {
      time,
      date: selectedDate.toISOString(),
      startTime: slotStartTime.toISOString(),
      endTime: slotEndTime.toISOString(),
      duration: serviceDuration,
      isAvailable: availableSlots.includes(time),
      isBooked: bookedSlots.includes(time)
    });

    setSelectedTime(time);
  };

  const handleConfirmBooking = async () => {
    if (!selectedTime) return;
    
    try {
      // Calculate start and end times
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + parseInt(serviceDuration));

      console.log('Attempting booking confirmation:', {
        selectedTime,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        isRescheduling,
        originalBookingId
      });

      if (isRescheduling && originalBookingId) {
        // Handle rescheduling
        const result = await bookingService.rescheduleBooking({
          bookingId: originalBookingId,
          newStartTime: startTime.toISOString(),
          newEndTime: endTime.toISOString(),
          status: 'CONFIRMED'
        });

        if (result.success) {
          try {
            showMessage({
              message: "Booking Rescheduled",
              type: "success",
              description: `Your appointment has been rescheduled to ${result.formattedDateTime}`
            });
          } catch (messageError) {
            Alert.alert(
              "Booking Rescheduled",
              `Your appointment has been rescheduled to ${result.formattedDateTime}`
            );
          }

          // Update navigation to go back to CustomerBookings and reset the stack
          navigation.reset({
            index: 0,
            routes: [
              { 
                name: 'CustomerBookings',
                params: {
                  refresh: true,
                  selectedBookingId: originalBookingId,
                  initialTab: 'upcoming'
                }
              }
            ],
          });
        } else {
          throw new Error(result.error?.message || 'Failed to reschedule booking');
        }
      } else {
        // Get the professional profile ID
        const { data: professional, error: profError } = await supabase
          .from('professionals')
          .select('id, user_id')
          .eq('id', professionalId)
          .single();

        if (profError) throw profError;

        console.log('Found professional:', professional);

        const { data: profProfile, error: profileError } = await supabase
          .from('professional_profiles')
          .select('id')
          .eq('user_id', professional.user_id)
          .single();

        if (profileError) throw profileError;

        console.log('Found professional profile:', profProfile);

        // Check for overlapping bookings one final time
        const { data: existingBookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('start_time, end_time')
          .eq('professional_id', profProfile.id)
          .in('status', ['CONFIRMED', 'PENDING'])
          .or(`start_time.lte.${endTime.toISOString()},end_time.gte.${startTime.toISOString()}`);

        if (bookingsError) throw bookingsError;

        console.log('Checking for overlaps with existing bookings:', {
          attemptedBookingStart: startTime.toISOString(),
          attemptedBookingEnd: endTime.toISOString(),
          existingBookings: existingBookings?.map(booking => ({
            start: booking.start_time,
            end: booking.end_time
          }))
        });

        // Check for overlaps
        const hasOverlap = existingBookings?.some(booking => {
          const bookingStart = new Date(booking.start_time);
          const bookingEnd = new Date(booking.end_time);
          
          console.log('Checking overlap for booking:', {
            attemptedBooking: {
              start: startTime.toISOString(),
              end: endTime.toISOString()
            },
            existingBooking: {
              start: bookingStart.toISOString(),
              end: bookingEnd.toISOString()
            },
            conditions: {
              condition1: startTime >= bookingStart && startTime < bookingEnd,
              condition2: endTime > bookingStart && endTime <= bookingEnd,
              condition3: startTime <= bookingStart && endTime >= bookingEnd,
              condition4: bookingStart <= startTime && bookingEnd >= endTime
            }
          });

          const overlap = (
            (startTime >= bookingStart && startTime < bookingEnd) ||
            (endTime > bookingStart && endTime <= bookingEnd) ||
            (startTime <= bookingStart && endTime >= bookingEnd) ||
            (bookingStart <= startTime && bookingEnd >= endTime)
          );

          if (overlap) {
            console.log('Found overlapping booking:', {
              attemptedStart: startTime.toISOString(),
              attemptedEnd: endTime.toISOString(),
              conflictingStart: bookingStart.toISOString(),
              conflictingEnd: bookingEnd.toISOString()
            });
          }

          return overlap;
        });

        if (hasOverlap) {
          console.log('Booking rejected due to overlap');
          Alert.alert(
            'Time Slot Unavailable',
            'This time slot is no longer available. Please select a different time.',
            [{ text: 'OK' }]
          );
          // Refresh available slots
          fetchAvailableSlots();
          return;
        }

        console.log('No overlaps found, proceeding with booking');

        // If no overlap, proceed with navigation to payment
        navigation.navigate('BookingPayment', {
          serviceName,
          servicePrice,
          depositPrice,
          fullPrice,
          serviceDuration,
          professionalName,
          selectedDate: selectedDate.toISOString(),
          selectedTime,
          professionalId,
          serviceId
        });
      }
    } catch (error) {
      console.error('Error in handleConfirmBooking:', error);
      try {
        showMessage({
          message: "Booking Failed",
          type: "danger",
          description: error.message || "Failed to process booking"
        });
      } catch (messageError) {
        Alert.alert(
          "Booking Failed",
          error.message || "Failed to process booking"
        );
      }
    }
  };

  const renderTimeSlot = (time: string) => {
    // Create date objects for comparison
    const [hours, minutes] = time.split(':').map(Number);
    const slotStartTime = new Date(selectedDate);
    slotStartTime.setHours(hours, minutes, 0, 0);
    
    const slotEndTime = new Date(slotStartTime);
    slotEndTime.setMinutes(slotEndTime.getMinutes() + parseInt(serviceDuration));
    
    const now = new Date();
    const isPast = slotStartTime < now;
    const isBooked = bookedSlots.includes(time);
    const isAvailable = availableSlots.includes(time);
    const isSelected = selectedTime === time;

    // Determine if this slot should be disabled
    const isDisabled = !isAvailable || isPast || isBooked;

    // Log the status of each time slot for debugging
    console.log('Rendering time slot:', {
      time,
      startTime: slotStartTime.toISOString(),
      endTime: slotEndTime.toISOString(),
      duration: serviceDuration,
      isAvailable,
      isBooked,
      isPast,
      isSelected,
      isDisabled
    });

    return (
      <TouchableOpacity
        key={time}
        style={[
          styles.slot,
          isDisabled && styles.unavailableSlot,
          isSelected && styles.selectedSlot,
          isPast && styles.pastSlot
        ]}
        onPress={() => !isDisabled && handleTimeSlotPress(time)}
        disabled={isDisabled}
      >
        <Text style={[
          styles.slotText,
          isDisabled && styles.unavailableSlotText,
          isSelected && styles.selectedSlotText,
          isPast && styles.pastSlotText
        ]}>
          {time}
        </Text>
        {isBooked && !isPast && (
          <Text style={styles.bookedText}>Booked</Text>
        )}
        {isPast && (
          <Text style={styles.pastText}>Past</Text>
        )}
        {!isDisabled && (
          <Text style={styles.availableText}>Available</Text>
        )}
      </TouchableOpacity>
    );
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
      const dayOfWeek = selectedDate.getDay(); // 0-6 (Sun-Sat)
      const adjustedDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to 0-6 (Mon-Sun)
      const daySchedule = workingHours[DAYS_OF_WEEK[adjustedDayIndex]];

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
          const [hours, minutes] = slot.split(':').map(Number);
          const slotStartTime = new Date(selectedDate);
          slotStartTime.setHours(hours, minutes, 0, 0);
          
          const slotEndTime = new Date(slotStartTime);
          slotEndTime.setMinutes(slotEndTime.getMinutes() + parseInt(serviceDuration));

          // Check if this slot overlaps with any booked slots
          const hasOverlap = bookedSlots.some(bookedSlot => {
            const [bookedHours, bookedMinutes] = bookedSlot.split(':').map(Number);
            const bookedStart = new Date(selectedDate);
            bookedStart.setHours(bookedHours, bookedMinutes, 0, 0);
            
            const bookedEnd = new Date(bookedStart);
            bookedEnd.setMinutes(bookedEnd.getMinutes() + parseInt(serviceDuration));

            return !(slotEndTime <= bookedStart || slotStartTime >= bookedEnd);
          });

          const isAvailable = availableSlots.includes(slot) && !bookedSlots.includes(slot);
          const isBooked = bookedSlots.includes(slot) || hasOverlap;
          const isSelected = selectedTime === slot;
          const now = new Date();
          const isPast = slotStartTime < now;

          // Determine if this slot should be disabled
          const isDisabled = !isAvailable || isPast || isBooked;

          // Log the status of each time slot
          console.log('Time slot status:', {
            time: slot,
            date: selectedDate.toISOString(),
            start: slotStartTime.toISOString(),
            end: slotEndTime.toISOString(),
            isAvailable,
            isBooked,
            hasOverlap,
            isPast,
            isSelected,
            isDisabled,
            inAvailableSlots: availableSlots.includes(slot),
            inBookedSlots: bookedSlots.includes(slot)
          });

          return (
            <TouchableOpacity
              key={slot}
              style={[
                styles.slot,
                (isDisabled || hasOverlap) && styles.unavailableSlot,
                isSelected && styles.selectedSlot,
                isPast && styles.pastSlot
              ]}
              onPress={() => !isDisabled && !hasOverlap && handleTimeSlotPress(slot)}
              disabled={isDisabled || hasOverlap}
            >
              <Text style={[
                styles.slotText,
                (isDisabled || hasOverlap) && styles.unavailableSlotText,
                isSelected && styles.selectedSlotText,
                isPast && styles.pastSlotText
              ]}>
                {slot}
              </Text>
              {(isBooked || hasOverlap) && !isPast && (
                <Text style={styles.bookedText}>Booked</Text>
              )}
              {isPast && (
                <Text style={styles.pastText}>Past</Text>
              )}
              {!isDisabled && !hasOverlap && (
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
        <Text style={styles.sectionTitle}>
          {isRescheduling ? 'Reschedule Details' : 'Appointment Details'}
        </Text>
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
            <View style={styles.priceContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailRowText}>Full Price: £{fullPrice}</Text>
              </View>
              <View style={styles.paymentNoteContainer}>
                <Text style={styles.pricingNote}>Pay to service provider</Text>
              </View>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="card-outline" size={20} color="#666" />
            <View style={styles.priceContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailRowText}>Deposit: £{depositPrice}</Text>
              </View>
              <View style={styles.paymentNoteContainer}>
                <Text style={styles.pricingNote}>Pay on <Text style={styles.primText}>Priim</Text></Text>
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={handleConfirmBooking}
        >
          <Text style={styles.confirmButtonText}>
            {isRescheduling ? 'Confirm Reschedule' : 'Confirm Booking'}
          </Text>
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
                <View style={styles.priceDetails}>
                  <View style={styles.priceRow}>
                    <Text style={styles.detailText}>Full Price: £{fullPrice}</Text>
                    <Text style={styles.priceNote}>Pay to provider</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.detailText}>Deposit: £{depositPrice}</Text>
                    <Text style={styles.priceNote}>Pay on <Text style={styles.primText}>Priim</Text></Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.calendarContainer}>
          <Text style={styles.sectionTitle}>
            {isRescheduling ? 'Select New Date' : 'Select Date'}
          </Text>
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
          <Text style={styles.sectionTitle}>
            {isRescheduling ? 'Select New Time' : 'Available Times'}
          </Text>
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
  },
  selectedSlot: {
    backgroundColor: '#FF5722',
    borderColor: '#FF5722',
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
    backgroundColor: '#F8F8F8',
    borderColor: '#EEEEEE',
    opacity: 0.7,
  },
  unavailableSlotText: {
    color: '#BBB',
  },
  pastSlot: {
    backgroundColor: '#F0F0F0',
    borderColor: '#E0E0E0',
    opacity: 0.6,
  },
  pastSlotText: {
    color: '#CCC',
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
  reschedulingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
    gap: 8,
  },
  reschedulingText: {
    color: '#FF5722',
    fontSize: 14,
    fontWeight: '500',
  },
  bookedSlot: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    opacity: 0.8,
  },
  bookedSlotText: {
    color: '#999',
  },
  unavailableSlot: {
    backgroundColor: '#F8F8F8',
    borderColor: '#EEEEEE',
    opacity: 0.7,
  },
  unavailableSlotText: {
    color: '#BBB',
  },
  slotStatusText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  priceContainer: {
    flex: 1,
    gap: 4,
  },
  paymentNoteContainer: {
    minHeight: 20,
    justifyContent: 'center',
  },
  pricingNote: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  primText: {
    color: '#FF5722',
    fontWeight: '600',
  },
  priceDetails: {
    flex: 1,
    gap: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  priceNote: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
}); 