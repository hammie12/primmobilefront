import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from '../../utils/showMessage';
import { Database } from '../lib/supabase/schema';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ViewMode = 'day' | 'week' | 'month';

interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
}

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  customer_profiles: {
    first_name: string;
    last_name: string;
  };
  service: {
    name: string;
    duration: number;
  };
  status: string;
}

type ServiceDetails = {
  id: string;
  name: string;
  price: number;
  duration: number;
  professional_id: string;
  category: Database['public']['Enums']['service_category'];
};

type ProfessionalDetails = {
  id: string;
  business_name: string;
  first_name: string;
  last_name: string;
  address: {
    address_line1: string;
    address_line2: string | null;
    city: string;
    state: string;
    postal_code: string;
  } | null;
  working_hours: {
    [key: string]: {
      isOpen: boolean;
      openTime: string;
      closeTime: string;
    };
  } | null;
};

type BookingDetails = {
  id: string;
  start_time: string;
  end_time: string;
  status: Database['public']['Enums']['booking_status'];
  notes: string | null;
  customer_id: string;
  professional_id: string;
  service_id: string;
};

type BookingScreenProps = {
  route: {
    params: {
      serviceDetails: ServiceDetails;
      professionalDetails: ProfessionalDetails;
      bookingDetails?: BookingDetails;
      isRescheduling?: boolean;
    };
  };
};

export const BookingScreen = ({ route }: BookingScreenProps) => {
  const navigation = useNavigation();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { user } = useAuth();
  const [workingHours, setWorkingHours] = useState<BusinessHours | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { 
    serviceDetails, 
    professionalDetails, 
    bookingDetails, 
    isRescheduling 
  } = route.params;

  useEffect(() => {
    if (isRescheduling && bookingDetails) {
      setSelectedDate(new Date(bookingDetails.start_time));
      
      navigation.setOptions({
        title: `Reschedule ${serviceDetails.name}`,
        headerTitle: `Reschedule ${serviceDetails.name}`
      });
    }
  }, [isRescheduling, bookingDetails]);

  useEffect(() => {
    if (professionalDetails.working_hours) {
      setWorkingHours(professionalDetails.working_hours);
    }
  }, [professionalDetails]);

  const handleSlotSelection = (date: Date, time: string) => {
    const duration = serviceDetails.duration;
    // ... rest of your slot selection logic
  };

  useEffect(() => {
    fetchBookings();
  }, [selectedDate, professionalId]);

  const fetchBookings = async () => {
    try {
      if (!professionalId) {
        console.error('No professional ID provided');
        return;
      }

      console.log('Fetching bookings for professional:', professionalId);

      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      endOfWeek.setHours(23, 59, 59, 999);

      console.log('Fetching bookings for date range:', {
        start: startOfWeek.toISOString(),
        end: endOfWeek.toISOString(),
        professionalId
      });

      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          start_time,
          end_time,
          status,
          professional_id,
          customer_profiles (
            id,
            first_name,
            last_name,
            phone_number,
            user_id
          ),
          service:service_id (
            id,
            name,
            duration,
            price,
            professional_id
          )
        `)
        .eq('professional_id', professionalId)
        .gte('start_time', startOfWeek.toISOString())
        .lte('start_time', endOfWeek.toISOString())
        .neq('status', 'CANCELLED');

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        return;
      }

      console.log('Found bookings:', bookings);

      const validBookings = bookings?.filter(booking => 
        booking && 
        booking.start_time && 
        booking.end_time && 
        booking.customer_profiles &&
        booking.service &&
        booking.professional_id === professionalId
      ) || [];

      setAppointments(validBookings);

      console.log('Valid bookings for professional:', {
        professionalId,
        serviceId,
        bookingsCount: validBookings.length,
        bookings: validBookings.map(b => ({
          id: b.id,
          start: format(new Date(b.start_time), 'yyyy-MM-dd HH:mm'),
          end: format(new Date(b.end_time), 'yyyy-MM-dd HH:mm'),
          customer: `${b.customer_profiles.first_name} ${b.customer_profiles.last_name}`,
          service: b.service.name
        }))
      });

    } catch (error) {
      console.error('Error in fetchBookings:', error);
    }
  };

  const isTimeSlotAvailable = (date: Date, slotTime: string) => {
    const [hours, minutes = '00'] = slotTime.split(':').map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(hours, minutes, 0, 0);
    const slotEndTime = new Date(slotDate);
    slotEndTime.setMinutes(slotEndTime.getMinutes() + 30); // 30-minute slots

    // Check if any appointment overlaps with this time slot
    const isUnavailable = appointments.some(apt => {
      const startTime = new Date(apt.start_time);
      const endTime = new Date(apt.end_time);
      
      // Only check appointments for the same day
      if (format(startTime, 'yyyy-MM-dd') !== format(date, 'yyyy-MM-dd')) {
        return false;
      }

      // Using the same logic as our SQL function:
      // 1. The existing booking starts before or at our slot start AND ends after our slot start
      // 2. The existing booking starts before our slot end AND ends at or after our slot end
      // 3. The existing booking is completely contained within our slot
      const hasConflict = (
        (startTime <= slotDate && endTime > slotDate) ||
        (startTime < slotEndTime && endTime >= slotEndTime) ||
        (startTime >= slotDate && endTime <= slotEndTime)
      );

      if (hasConflict) {
        console.log('Booking conflict detected:', {
          slot: {
            start: format(slotDate, 'HH:mm'),
            end: format(slotEndTime, 'HH:mm')
          },
          existingBooking: {
            start: format(startTime, 'HH:mm'),
            end: format(endTime, 'HH:mm'),
            customer: `${apt.customer_profiles.first_name} ${apt.customer_profiles.last_name}`,
            service: apt.service.name
          }
        });
      }

      return hasConflict;
    });

    return !isUnavailable;
  };

  const getTimeSlots = (date: Date) => {
    // Create time slots from business hours (e.g., 9 AM to 5 PM)
    const slots: TimeSlot[] = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM

    for (let hour = startHour; hour < endHour; hour++) {
      // Create two 30-minute slots for each hour
      ['00', '30'].forEach((minutes, index) => {
        const time = `${hour.toString().padStart(2, '0')}:${minutes}`;
        const available = isTimeSlotAvailable(date, time);
        slots.push({
          id: `${hour}-${index}`,
          time,
          isAvailable: available
        });
      });
    }

    return slots;
  };

  const checkBookingOverlap = async (startTime: Date, endTime: Date) => {
    try {
      const { data: existingBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('professional_id', professionalDetails.id)
        .neq('status', 'CANCELLED')
        .or(`start_time.lte.${endTime.toISOString()},end_time.gt.${startTime.toISOString()}`);

      if (bookingsError) {
        console.error('Error checking booking overlap:', bookingsError);
        throw bookingsError;
      }

      const hasOverlap = existingBookings?.some(booking => {
        const bookingStart = new Date(booking.start_time);
        const bookingEnd = new Date(booking.end_time);
        
        const overlap = (
          (startTime <= bookingEnd && startTime >= bookingStart) ||
          (endTime > bookingStart && endTime <= bookingEnd) ||
          (startTime <= bookingStart && endTime >= bookingEnd)
        );

        if (overlap) {
          console.log('Booking overlap detected:', {
            proposed: { start: startTime, end: endTime },
            existing: { start: bookingStart, end: bookingEnd }
          });
        }

        return overlap;
      });

      return hasOverlap;
    } catch (error) {
      console.error('Error in checkBookingOverlap:', error);
      throw error;
    }
  };

  const handleSlotPress = async (date: Date, time: string, isAvailable: boolean) => {
    if (!isAvailable) {
      Alert.alert('Not Available', 'This time slot is already booked.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [hours, minutes] = time.split(':').map(Number);
      const startDateTime = new Date(date);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + parseInt(serviceDetails.duration));

      // Check for overlapping bookings
      const hasOverlap = await checkBookingOverlap(startDateTime, endDateTime);

      if (hasOverlap) {
        Alert.alert('Not Available', 'This time slot conflicts with an existing booking.');
        return;
      }

      // If we're rescheduling, handle that case
      if (route.params.isRescheduling && route.params.bookingDetails) {
        const { error: updateError } = await supabase
          .from('bookings')
          .update({
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString()
          })
          .eq('id', route.params.bookingDetails.id);

        if (updateError) throw updateError;

        showMessage({
          message: 'Booking rescheduled successfully',
          type: 'success'
        });

        navigation.goBack();
      } else {
        // For new bookings, navigate to confirmation
        navigation.navigate('BookingConfirmation', {
          selectedTime: startDateTime.toISOString(),
          duration: serviceDetails.duration,
          professionalId: professionalDetails.id,
          serviceId: serviceDetails.id
        });
      }
    } catch (error) {
      console.error('Error handling slot selection:', error);
      setError('Failed to process booking request');
      Alert.alert('Error', 'Failed to process booking request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderViewModeSelector = () => (
    <View style={styles.viewModeContainer}>
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'day' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('day')}
      >
        <Text style={[styles.viewModeText, viewMode === 'day' && styles.viewModeTextActive]}>Day</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'week' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('week')}
      >
        <Text style={[styles.viewModeText, viewMode === 'week' && styles.viewModeTextActive]}>Week</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'month' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('month')}
      >
        <Text style={[styles.viewModeText, viewMode === 'month' && styles.viewModeTextActive]}>Month</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDayView = () => (
    <ScrollView style={styles.dayViewContainer}>
      {getTimeSlots(selectedDate).map((slot) => {
        const appointment = appointments.find(
          (apt) => {
            const aptDate = new Date(apt.start_time);
            return format(aptDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') &&
                   format(aptDate, 'HH:mm') === slot.time;
          }
        );

        return (
          <View key={slot.id} style={styles.timeSlot}>
            <Text style={styles.timeText}>{slot.time}</Text>
            <View style={styles.appointmentContainer}>
              {appointment ? (
                <View style={styles.appointmentCard}>
                  <Text style={styles.appointmentClientName}>
                    {`${appointment.customer_profiles.first_name} ${appointment.customer_profiles.last_name}`}
                  </Text>
                  <Text style={styles.appointmentService}>{appointment.service.name}</Text>
                  <Text style={styles.appointmentDuration}>{appointment.service.duration} min</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={[
                    styles.availableSlot,
                    !slot.isAvailable && styles.unavailableSlot
                  ]}
                  disabled={!slot.isAvailable}
                  onPress={() => handleSlotPress(selectedDate, slot.time, slot.isAvailable)}
                >
                  <Text style={[
                    styles.availableSlotText,
                    !slot.isAvailable && styles.unavailableSlotText
                  ]}>
                    {slot.isAvailable ? 'Available' : 'Booked'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  const renderWeekView = () => (
    <View style={styles.weekViewContainer}>
      <Calendar
        current={format(selectedDate, 'yyyy-MM-dd')}
        onDayPress={(day) => setSelectedDate(new Date(day.timestamp))}
        markedDates={{
          [format(selectedDate, 'yyyy-MM-dd')]: { selected: true, selectedColor: '#FF5722' },
        }}
        style={styles.calendar}
      />
      <ScrollView style={styles.weekSchedule}>
        {getTimeSlots(selectedDate).map((slot) => (
          <View key={slot.id} style={styles.weekTimeSlot}>
            <Text style={styles.timeText}>{slot.time}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Array.from({ length: 7 }).map((_, index) => {
                const date = new Date(selectedDate);
                date.setDate(date.getDate() - date.getDay() + index);
                const appointment = appointments.find(
                  (apt) => {
                    const aptDate = new Date(apt.start_time);
                    return format(aptDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') &&
                           format(aptDate, 'HH:mm') === slot.time;
                  }
                );
                const isAvailable = isTimeSlotAvailable(date, slot.time);

                return (
                  <View key={index} style={styles.weekDaySlot}>
                    {appointment ? (
                      <View style={styles.weekAppointmentCard}>
                        <Text style={styles.weekAppointmentText}>
                          {`${appointment.customer_profiles.first_name} ${appointment.customer_profiles.last_name}`}
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={[
                          styles.weekAvailableSlot,
                          !isAvailable && styles.weekUnavailableSlot
                        ]}
                        disabled={!isAvailable}
                        onPress={() => handleSlotPress(date, slot.time, isAvailable)}
                      >
                        <Text style={[
                          styles.weekAvailableText,
                          !isAvailable && styles.weekUnavailableText
                        ]}>
                          {isAvailable ? '+' : '×'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderMonthView = () => (
    <View style={styles.monthViewContainer}>
      <CalendarList
        current={format(selectedDate, 'yyyy-MM-dd')}
        onDayPress={(day) => setSelectedDate(new Date(day.timestamp))}
        markedDates={{
          [format(selectedDate, 'yyyy-MM-dd')]: { selected: true, selectedColor: '#FF5722' },
        }}
        pastScrollRange={1}
        futureScrollRange={3}
        scrollEnabled={true}
        showScrollIndicator={true}
        style={styles.monthCalendar}
      />
      <View style={styles.selectedDateAppointments}>
        <Text style={styles.selectedDateTitle}>
          Appointments for {format(selectedDate, 'MMMM d, yyyy')}
        </Text>
        <ScrollView>
          {appointments
            .filter((apt) => format(new Date(apt.start_time), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
            .map((appointment) => (
              <View key={appointment.id} style={styles.monthAppointmentCard}>
                <Text style={styles.monthAppointmentTime}>{format(new Date(appointment.start_time), 'HH:mm')}</Text>
                <View style={styles.monthAppointmentDetails}>
                  <Text style={styles.monthAppointmentClient}>
                    {`${appointment.customer_profiles.first_name} ${appointment.customer_profiles.last_name}`}
                  </Text>
                  <Text style={styles.monthAppointmentService}>{appointment.service.name}</Text>
                </View>
                <Text style={styles.monthAppointmentDuration}>{appointment.service.duration} min</Text>
              </View>
            ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderViewModeSelector()}
      {viewMode === 'day' && renderDayView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'month' && renderMonthView()}
      <TouchableOpacity style={styles.addButton}>
        <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  viewModeContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  viewModeButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  viewModeButtonActive: {
    backgroundColor: '#FF5722',
  },
  viewModeText: {
    fontSize: 16,
    color: '#666666',
  },
  viewModeTextActive: {
    color: '#FFFFFF',
  },
  dayViewContainer: {
    flex: 1,
  },
  timeSlot: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  timeText: {
    width: 60,
    fontSize: 14,
    color: '#666666',
  },
  appointmentContainer: {
    flex: 1,
    marginLeft: 10,
  },
  appointmentCard: {
    backgroundColor: '#FF5722',
    padding: 10,
    borderRadius: 5,
  },
  appointmentClientName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  appointmentService: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  appointmentDuration: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  availableSlot: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  availableSlotText: {
    color: '#666666',
  },
  weekViewContainer: {
    flex: 1,
  },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  weekSchedule: {
    flex: 1,
  },
  weekTimeSlot: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  weekDaySlot: {
    width: 100,
    marginHorizontal: 5,
  },
  weekAppointmentCard: {
    backgroundColor: '#FF5722',
    padding: 5,
    borderRadius: 3,
  },
  weekAppointmentText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  weekAvailableSlot: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 3,
    padding: 5,
    alignItems: 'center',
  },
  weekAvailableText: {
    color: '#666666',
  },
  monthViewContainer: {
    flex: 1,
  },
  monthCalendar: {
    height: 350,
  },
  selectedDateAppointments: {
    flex: 1,
    padding: 10,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  monthAppointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    marginBottom: 10,
    elevation: 2,
  },
  monthAppointmentTime: {
    width: 60,
    fontSize: 14,
    fontWeight: 'bold',
  },
  monthAppointmentDetails: {
    flex: 1,
    marginLeft: 10,
  },
  monthAppointmentClient: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  monthAppointmentService: {
    fontSize: 14,
    color: '#666666',
  },
  monthAppointmentDuration: {
    fontSize: 14,
    color: '#666666',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  unavailableSlot: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    opacity: 0.6,
    pointerEvents: 'none',
  },
  unavailableSlotText: {
    color: '#999999',
  },
  weekUnavailableSlot: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    opacity: 0.6,
    pointerEvents: 'none',
  },
  weekUnavailableText: {
    color: '#999999',
  },
});
