import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Modal,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BusinessTopBar } from '../components/BusinessTopBar';
import { useNavigation } from '@react-navigation/native';
import { Typography } from '../components/Typography';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { generateRandomColor } from '../utils/colors';
import NetInfo from '@react-native-community/netinfo';
import type { Database } from '../lib/supabase/schema';
import { Calendar, CalendarProvider, WeekCalendar, DateData } from 'react-native-calendars';

// Add status colors and icons
const STATUS_STYLES = {
  PENDING: {
    color: '#FFA000',
    icon: 'clock-outline',
    label: 'Pending'
  },
  CONFIRMED: {
    color: '#2196F3',
    icon: 'check-circle-outline',
    label: 'Confirmed'
  },
  COMPLETED: {
    color: '#4CAF50',
    icon: 'check-circle',
    label: 'Completed'
  },
  CANCELLED: {
    color: '#F44336',
    icon: 'close-circle',
    label: 'Cancelled'
  }
};

// Queue for offline operations
type QueuedOperation = {
  id: string;
  type: 'complete' | 'cancel';
  data: any;
  timestamp: number;
};

type ViewMode = 'day' | 'week' | 'month';
type Appointment = {
  id: string;
  start_time: string;
  end_time: string;
  customer_name: string;
  service_name: string;
  status: Database["public"]["Enums"]["booking_status"];
  color?: string;
  date: string;
  price: number;
  customer_email: string;
  customer_phone: string;
  notes?: string;
  business_id: string;
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => `${i + 6}:00`);
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Add these new types
type MarkedDates = {
  [key: string]: {
    marked: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
    dots?: Array<{key: string; color: string}>;
  };
};

const updateBookingStatus = async (bookingId: string, status: Database["public"]["Enums"]["booking_status"], notes?: string) => {
  try {
    console.log('=== Booking Status Update ===');
    console.log(`Booking ID: ${bookingId}`);
    console.log(`Target Status: ${status}`);
    console.log(`Notes provided: ${notes ? 'Yes' : 'No'}`);
    
    if (status === 'COMPLETED') {
      // Use the existing complete_booking function
      const { data, error } = await supabase
        .rpc('complete_booking', { 
          p_booking_id: bookingId,
          p_completion_notes: notes || null
        });
      
      if (error) {
        console.error('Booking completion failed:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log('Booking completed successfully');
      return true;
    } else {
      // For other status updates, use normal update
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);
      
      if (error) {
        console.error('Status update failed:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log(`Status successfully updated to ${status}`);
      return true;
    }
  } catch (error) {
    console.error('=== Booking Update Failed ===');
    console.error('Error details:', {
      error,
      bookingId,
      status,
      notes: notes ? 'Provided' : 'Not provided'
    });
    return false;
  }
};

// Add this helper function at the top of the file, outside the component
const doAppointmentsOverlap = (a: Appointment, b: Appointment) => {
  const aStart = new Date(`${a.date}T${a.start_time}`);
  const aEnd = new Date(`${a.date}T${a.end_time}`);
  const bStart = new Date(`${b.date}T${b.start_time}`);
  const bEnd = new Date(`${b.date}T${b.end_time}`);
  
  return aStart < bEnd && bStart < aEnd;
};

export const BusinessBookingsScreen = () => {
  const navigation = useNavigation();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonthDay, setSelectedMonthDay] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isCompletingBooking, setIsCompletingBooking] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [operationQueue, setOperationQueue] = useState<QueuedOperation[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [statusAnimation] = useState(new Animated.Value(0));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  // Check network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? true);
    });

    // Initial check
    NetInfo.fetch().then(state => {
      setIsOnline(state.isConnected ?? true);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Process queued operations when coming online
  useEffect(() => {
    if (isOnline && operationQueue.length > 0) {
      processQueue();
    }
  }, [isOnline]);

  const processQueue = async () => {
    while (operationQueue.length > 0) {
      const operation = operationQueue[0];
      try {
        if (operation.type === 'complete') {
          await updateBookingStatus(operation.id, 'COMPLETED');
        }
        // Remove from queue if successful
        setOperationQueue(queue => queue.filter(op => op.id !== operation.id));
      } catch (error) {
        console.error('Error processing queued operation:', error);
        break;
      }
    }
  };

  const handleComplete = async (appointment: Appointment) => {
    try {
      setIsCompletingBooking(true);
      setErrorMessage(null);

      // Show confirmation dialog
      const confirmed = await new Promise((resolve) => {
        Alert.alert(
          'Complete Appointment',
          'Are you sure you want to mark this appointment as completed?',
          [
            { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
            { text: 'Complete', onPress: () => resolve(true) }
          ]
        );
      });

      if (!confirmed) {
        setIsCompletingBooking(false);
        return;
      }

      // Check network status
      if (!isOnline) {
        // Queue the operation for later
        setOperationQueue(queue => [...queue, {
          id: appointment.id,
          type: 'complete',
          data: { notes: completionNotes },
          timestamp: Date.now()
        }]);
        
        // Optimistic update
        updateLocalAppointmentStatus(appointment.id, 'COMPLETED');
        setSelectedAppointment(null);
        return;
      }

      // Attempt to update status
      const success = await updateBookingStatus(
        appointment.id, 
        'COMPLETED',
        completionNotes || undefined
      );
      
      if (success) {
        // Animate status change
        Animated.sequence([
          Animated.timing(statusAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
          }),
          Animated.timing(statusAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true
          })
        ]).start();

        // Update local state
        updateLocalAppointmentStatus(appointment.id, 'COMPLETED');
        
        // Show success message
        Alert.alert('Success', 'Appointment marked as completed successfully');
        
        // Close modal and clear notes
        setSelectedAppointment(null);
        setCompletionNotes('');
      } else {
        throw new Error('Failed to update booking status');
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
      setErrorMessage('Failed to complete appointment. Please try again.');
      
      Alert.alert(
        'Error',
        'Failed to complete appointment. Would you like to retry?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => handleComplete(appointment) }
        ]
      );
    } finally {
      setIsCompletingBooking(false);
    }
  };

  const updateLocalAppointmentStatus = (appointmentId: string, status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED") => {
    setAppointments(prevAppointments => 
      prevAppointments.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status, completedAt: status === 'COMPLETED' ? new Date().toISOString() : undefined }
          : apt
      )
    );
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        
        if (!user?.id) return;

        // First get the professional profile
        const { data: professionalData, error: professionalError } = await supabase
          .from('professional_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (professionalError) {
          console.error('Error fetching professional profile:', professionalError);
          setIsLoading(false);
          return;
        }

        // Fetch bookings for this professional
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            start_time,
            end_time,
            status,
            notes,
            customer_id (
              first_name,
              last_name,
              phone_number,
              user_id (
                email
              )
            ),
            service_id (
              name,
              price
            )
          `)
          .eq('professional_id', professionalData.id);

        if (bookingsError) throw bookingsError;

        // Transform bookings to match Appointment type with null checks
        const formattedAppointments: Appointment[] = bookings
          .filter(booking => booking.start_time && booking.end_time) // Filter out invalid bookings
          .map(booking => {
            // Default values for null cases
            const customerName = booking.customer_id 
              ? `${booking.customer_id.first_name || ''} ${booking.customer_id.last_name || ''}`.trim() 
              : 'Unknown Customer';
            
            const serviceName = booking.service_id?.name || 'Unknown Service';
            const servicePrice = booking.service_id?.price || 0;
            
            const customerEmail = booking.customer_id?.user_id?.email || '';
            const customerPhone = booking.customer_id?.phone_number || '';

            return {
              id: booking.id,
              start_time: new Date(booking.start_time).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              }),
              end_time: new Date(booking.end_time).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              }),
              customer_name: customerName,
              service_name: serviceName,
              status: booking.status || 'PENDING', // Default status
              color: generateRandomColor(),
              date: new Date(booking.start_time).toISOString().split('T')[0],
              price: servicePrice,
              customer_email: customerEmail,
              customer_phone: customerPhone,
              notes: booking.notes || '',
              business_id: professionalData.id
            };
          });

        setAppointments(formattedAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        // TODO: Show error toast or message to user
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [user?.id]);

  const getWeekDates = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    return Array.from({ length: 7 }, (_, i) => new Date(date.setDate(diff + i)));
  };

  const weekDates = getWeekDates(new Date(selectedDate));

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      // Day view - move by single days
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = [];
    
    // Add empty days for padding
    for (let i = 0; i < firstDay.getDay(); i++) {
      daysInMonth.push(null);
    }
    
    // Add actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      daysInMonth.push(new Date(year, month, i));
    }
    
    return daysInMonth;
  };

  const renderViewModeSelector = () => (
    <View style={styles.viewModeContainer}>
      {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
        <TouchableOpacity
          key={mode}
          style={[styles.viewModeButton, viewMode === mode && styles.viewModeButtonActive]}
          onPress={() => setViewMode(mode)}
        >
          <Typography variant="button" style={[styles.viewModeText, viewMode === mode && styles.viewModeTextActive]}>
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Typography>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTimeGrid = () => {
    const gridContent = TIME_SLOTS.map((time, index) => (
      <View key={time} style={styles.gridRow}>
        <View style={styles.timeLabel}>
          <Text style={styles.timeLabelText}>{time}</Text>
        </View>
        <View style={styles.gridLine} />
      </View>
    ));

    return (
      <View style={styles.timeGrid}>
        <View style={styles.timeLabels}>{gridContent}</View>
        <View style={styles.gridContainer}>
          {renderAppointments()}
        </View>
      </View>
    );
  };

  const renderAppointments = () => {
    const relevantAppointments = appointments.filter(appointment => {
      if (viewMode === 'day') {
        return appointment.date === selectedDate.toISOString().split('T')[0];
      } else if (viewMode === 'week') {
        const appointmentDate = new Date(appointment.date);
        const weekStart = weekDates[0];
        const weekEnd = weekDates[6];
        return appointmentDate >= weekStart && appointmentDate <= weekEnd;
      } else {
        const appointmentDate = new Date(appointment.date);
        return (
          appointmentDate.getMonth() === selectedDate.getMonth() &&
          appointmentDate.getFullYear() === selectedDate.getFullYear()
        );
      }
    });

    // Group overlapping appointments
    const groupOverlappingAppointments = (apps: Appointment[]) => {
      const groups: Appointment[][] = [];
      
      apps.forEach(app => {
        let addedToGroup = false;
        
        for (const group of groups) {
          if (group.some(groupApp => doAppointmentsOverlap(groupApp, app))) {
            group.push(app);
            addedToGroup = true;
            break;
          }
        }
        
        if (!addedToGroup) {
          groups.push([app]);
        }
      });
      
      return groups;
    };

    // Sort appointments by start time
    const sortedAppointments = [...relevantAppointments].sort((a, b) => {
      return a.start_time.localeCompare(b.start_time);
    });

    // Group overlapping appointments by day
    const appointmentsByDay: { [key: string]: Appointment[][] } = {};
    
    sortedAppointments.forEach(app => {
      const dayKey = viewMode === 'week' ? new Date(app.date).getDay().toString() : '0';
      if (!appointmentsByDay[dayKey]) {
        appointmentsByDay[dayKey] = [];
      }
      const groups = groupOverlappingAppointments([...appointmentsByDay[dayKey].flat(), app]);
      appointmentsByDay[dayKey] = groups;
    });

    return Object.entries(appointmentsByDay).flatMap(([dayKey, groups]) => {
      return groups.flatMap((group, groupIndex) => {
        return group.map((appointment, index) => {
          const startHour = parseInt(appointment.start_time.split(':')[0]);
          const startMinute = parseInt(appointment.start_time.split(':')[1]);
          const endHour = parseInt(appointment.end_time.split(':')[0]);
          const endMinute = parseInt(appointment.end_time.split(':')[1]);
          
          const top = ((startHour - 6) * 60 + startMinute);
          const height = ((endHour - startHour) * 60 + (endMinute - startMinute));
          
          let left = 0;
          let width = '95%';
          
          if (viewMode === 'week') {
            const appointmentDate = new Date(appointment.date);
            const dayIndex = appointmentDate.getDay();
            const baseWidth = (100 / 7); // Base width for a full day column
            const slotWidth = baseWidth * 0.95; // 95% of the day column
            
            // Calculate position for overlapping appointments
            const overlapCount = group.length;
            const overlapIndex = index;
            const slotSegmentWidth = slotWidth / overlapCount;
            
            left = (dayIndex * baseWidth) + (overlapIndex * slotSegmentWidth);
            width = `${slotSegmentWidth}%`;
          } else {
            // Handle overlapping in day view
            const overlapCount = group.length;
            const overlapIndex = index;
            const slotWidth = 95 / overlapCount; // 95% total width divided by number of overlapping appointments
            
            left = overlapIndex * slotWidth;
            width = `${slotWidth}%`;
          }

          const statusStyle = STATUS_STYLES[appointment.status];

          return (
            <TouchableOpacity
              key={appointment.id}
              style={[
                styles.appointment,
                {
                  top,
                  height,
                  left: `${left}%`,
                  width,
                  backgroundColor: appointment.color,
                },
              ]}
              onPress={() => handleAppointmentPress(appointment)}
            >
              <View style={styles.appointmentContent}>
                <View style={styles.appointmentHeader}>
                  <Typography variant="caption" style={styles.appointmentTime}>
                    {appointment.start_time} - {appointment.end_time}
                  </Typography>
                  <View style={[styles.statusDot, { backgroundColor: statusStyle.color }]} />
                </View>
                <Typography variant="body1" style={styles.appointmentClient} numberOfLines={1}>
                  {appointment.customer_name}
                </Typography>
                <Typography variant="body2" style={styles.appointmentService} numberOfLines={2}>
                  {appointment.service_name}
                </Typography>
                <Typography variant="body1" style={styles.appointmentPrice}>
                  £{appointment.price}
                </Typography>
              </View>
            </TouchableOpacity>
          );
        });
      });
    });
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  // Add this function to prepare calendar marked dates
  const prepareMarkedDates = useCallback(() => {
    const marks: MarkedDates = {};
    
    appointments.forEach(appointment => {
      const dateStr = appointment.date;
      if (!marks[dateStr]) {
        marks[dateStr] = {
          marked: true,
          dots: [{
            key: appointment.id,
            color: appointment.color
          }]
        };
      } else {
        marks[dateStr].dots?.push({
          key: appointment.id,
          color: appointment.color
        });
      }

      // Mark selected date
      if (selectedMonthDay && dateStr === selectedMonthDay.toISOString().split('T')[0]) {
        marks[dateStr].selected = true;
        marks[dateStr].selectedColor = '#FF5722';
      }
    });

    setMarkedDates(marks);
  }, [appointments, selectedMonthDay]);

  useEffect(() => {
    prepareMarkedDates();
  }, [appointments, selectedMonthDay]);

  const renderMonthView = () => {
    return (
      <View style={styles.calendarContainer}>
        <Calendar
          style={styles.calendar}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#666666',
            selectedDayBackgroundColor: '#FF5722',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#FF5722',
            dayTextColor: '#333333',
            textDisabledColor: '#d9e1e8',
            dotColor: '#FF5722',
            selectedDotColor: '#ffffff',
            arrowColor: '#FF5722',
            monthTextColor: '#333333',
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 12
          }}
          markedDates={markedDates}
          onDayPress={day => setSelectedMonthDay(new Date(day.timestamp))}
          markingType={'multi-dot'}
          enableSwipeMonths={true}
        />
        
        {selectedMonthDay && (
          <View style={styles.selectedDayAppointments}>
            <Typography variant="h2" style={styles.selectedDayTitle}>
              {selectedMonthDay.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
            <ScrollView style={styles.appointmentsList}>
              {appointments
                .filter(apt => new Date(apt.date).toDateString() === selectedMonthDay.toDateString())
                .map(apt => (
                  <TouchableOpacity
                    key={apt.id}
                    style={styles.monthAppointmentItem}
                    onPress={() => handleAppointmentPress(apt)}
                  >
                    <View style={[styles.appointmentStatus, { backgroundColor: apt.color }]} />
                    <View style={styles.appointmentInfo}>
                      <Typography variant="caption" style={styles.monthItemTime}>
                        {apt.start_time} - {apt.end_time}
                      </Typography>
                      <Typography variant="body1" style={styles.monthItemClient}>
                        {apt.customer_name}
                      </Typography>
                      <Typography variant="body2" style={styles.monthItemService}>
                        {apt.service_name}
                      </Typography>
                      <Typography variant="body1" style={styles.monthItemPrice}>
                        £{apt.price}
                      </Typography>
                    </View>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const renderWeekView = () => {
    return (
      <View style={styles.calendarContainer}>
        <CalendarProvider 
          date={selectedDate.toISOString().split('T')[0]}
          onDateChanged={(date: string) => {
            setSelectedDate(new Date(date));
          }}
        >
          <WeekCalendar
            style={styles.weekCalendar}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#666666',
              selectedDayBackgroundColor: '#FF5722',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#FF5722',
              dayTextColor: '#333333',
              textDisabledColor: '#d9e1e8',
              dotColor: '#FF5722',
              selectedDotColor: '#ffffff',
              arrowColor: '#FF5722',
              monthTextColor: '#333333',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12
            }}
            markedDates={markedDates}
            firstDay={1}
            allowShadow={false}
          />
          <ScrollView style={styles.weekViewScrollContent}>
            <View style={styles.timeGrid}>
              <View style={styles.timeLabels}>
                {TIME_SLOTS.map(time => (
                  <View key={time} style={styles.timeLabel}>
                    <Text style={styles.timeLabelText}>{time}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.gridContainer}>
                {renderAppointments()}
              </View>
            </View>
          </ScrollView>
        </CalendarProvider>
      </View>
    );
  };

  const renderStatusBadge = (status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED") => {
    const statusStyle = STATUS_STYLES[status];
    return (
      <Animated.View style={[
        styles.statusBadge,
        { backgroundColor: statusStyle.color },
        { transform: [{ scale: statusAnimation.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 1.1, 1]
        }) }] }
      ]}>
        <MaterialCommunityIcons name={statusStyle.icon} size={16} color="#FFFFFF" />
        <Typography variant="body1" style={styles.statusText}>
          {statusStyle.label}
        </Typography>
      </Animated.View>
    );
  };

  const renderAppointmentModal = () => {
    if (!selectedAppointment) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedAppointment}
        onRequestClose={() => setSelectedAppointment(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography variant="h2" style={styles.modalTitle}>Appointment Details</Typography>
              <TouchableOpacity 
                onPress={() => setSelectedAppointment(null)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {renderStatusBadge(selectedAppointment.status)}
              
              {errorMessage && (
                <View style={styles.errorContainer}>
                  <Typography variant="body1" style={styles.errorText}>
                    {errorMessage}
                  </Typography>
                </View>
              )}

              <View style={styles.detailSection}>
                <Typography variant="body2" style={styles.detailLabel}>Date & Time</Typography>
                <Typography variant="body1" style={styles.detailText}>
                  {new Date(selectedAppointment.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
                <Typography variant="body1" style={styles.detailText}>
                  {selectedAppointment.start_time} - {selectedAppointment.end_time}
                </Typography>
              </View>

              <View style={styles.detailSection}>
                <Typography variant="body2" style={styles.detailLabel}>Client Information</Typography>
                <Typography variant="body1" style={styles.detailText}>
                  {selectedAppointment.customer_name}
                </Typography>
                <Typography variant="body2" style={styles.detailSubtext}>
                  {selectedAppointment.customer_email}
                </Typography>
                <Typography variant="body2" style={styles.detailSubtext}>
                  {selectedAppointment.customer_phone}
                </Typography>
              </View>

              <View style={styles.detailSection}>
                <Typography variant="body2" style={styles.detailLabel}>Service</Typography>
                <Typography variant="body1" style={styles.detailText}>
                  {selectedAppointment.service_name}
                </Typography>
                <Typography variant="h3" style={styles.priceText}>
                  £{selectedAppointment.price.toFixed(2)}
                </Typography>
              </View>

              {selectedAppointment.notes && (
                <View style={styles.detailSection}>
                  <Typography variant="body2" style={styles.detailLabel}>Notes</Typography>
                  <Typography variant="body1" style={styles.detailText}>
                    {selectedAppointment.notes}
                  </Typography>
                </View>
              )}

              {selectedAppointment.status !== 'COMPLETED' && (
                <View style={styles.completionSection}>
                  <Typography variant="body2" style={styles.detailLabel}>
                    Completion Notes
                  </Typography>
                  <TextInput
                    style={styles.notesInput}
                    multiline
                    numberOfLines={3}
                    value={completionNotes}
                    onChangeText={setCompletionNotes}
                    placeholder="Add notes about the appointment completion..."
                  />
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.footerButton, styles.cancelButton]}
                onPress={() => setSelectedAppointment(null)}
              >
                <Typography variant="body1" style={styles.footerButtonText}>Close</Typography>
              </TouchableOpacity>
              
              {selectedAppointment.status !== 'COMPLETED' && (
                <TouchableOpacity 
                  style={[
                    styles.footerButton, 
                    styles.completeButton,
                    isCompletingBooking && styles.disabledButton
                  ]}
                  onPress={() => handleComplete(selectedAppointment)}
                  disabled={isCompletingBooking}
                >
                  {isCompletingBooking ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Typography variant="body1" style={styles.footerButtonText}>
                      Complete
                    </Typography>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Typography variant="body2" style={styles.offlineText}>
            You are offline. Changes will be synced when connection is restored.
          </Typography>
        </View>
      )}
      <StatusBar style="dark" />
      <BusinessTopBar />
      <View style={styles.container}>
        <View style={styles.header}>
          <Typography variant="h1" style={styles.screenTitle}>Appointments</Typography>
          {renderViewModeSelector()}
        </View>

        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateDate('prev')}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#666666" />
          </TouchableOpacity>
          <Typography variant="h2" style={styles.dateText}>
            {selectedDate.toLocaleDateString('en-US', { 
              month: 'long',
              year: 'numeric',
              ...(viewMode !== 'month' && { day: 'numeric' })
            })}
          </Typography>
          <TouchableOpacity onPress={() => navigateDate('next')}>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666666" />
          </TouchableOpacity>
        </View>

        {viewMode !== 'month' && (
          <View style={styles.weekDayHeader}>
            {(viewMode === 'week' ? weekDates : [selectedDate]).map((date, index) => (
              <View key={date.toISOString()} style={styles.weekDayCell}>
                <Typography variant="body2" style={styles.weekDayText}>
                  {viewMode === 'week' ? WEEKDAYS[index] : WEEKDAYS[date.getDay()]}
                </Typography>
                <Typography variant="body1" style={[
                  styles.weekDateText,
                  date.toDateString() === new Date().toDateString() && styles.todayDate
                ]}>
                  {date.getDate()}
                </Typography>
              </View>
            ))}
          </View>
        )}

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={[
            styles.scrollViewContent,
            { paddingBottom: 100 }
          ]}
        >
          {viewMode === 'month' ? renderMonthView() : viewMode === 'week' ? renderWeekView() : renderTimeGrid()}
        </ScrollView>

        {renderAppointmentModal()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  viewModeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewModeButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  viewModeText: {
    color: '#666666',
  },
  viewModeTextActive: {
    color: '#000000',
    fontWeight: '500',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  weekDayHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    color: '#666666',
  },
  weekDateText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  todayDate: {
    color: '#FF5722',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  timeGrid: {
    flexDirection: 'row',
    flex: 1,
  },
  timeLabels: {
    width: 50,
  },
  timeLabel: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeLabelText: {
    fontSize: 12,
    color: '#666666',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  gridContainer: {
    flex: 1,
    position: 'relative',
  },
  gridRow: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  appointment: {
    position: 'absolute',
    borderRadius: 8,
    overflow: 'hidden',
    margin: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 60,
    padding: 4,
  },
  appointmentTime: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  appointmentClient: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  appointmentService: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 2,
  },
  appointmentPrice: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  monthContainer: {
    flex: 1,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  monthDayHeader: {
    width: '14.28%',
    padding: 8,
    alignItems: 'center',
  },
  monthDayHeaderText: {
    fontSize: 12,
    color: '#666666',
  },
  monthDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  monthDayWithAppointments: {
    backgroundColor: '#FFE0D6',
  },
  selectedMonthDay: {
    backgroundColor: '#FF5722',
  },
  monthDayText: {
    fontSize: 14,
    color: '#333333',
  },
  todayText: {
    fontWeight: 'bold',
    color: '#FF5722',
  },
  selectedDayAppointments: {
    padding: 16,
  },
  selectedDayTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  dayAppointmentsList: {
    paddingTop: 8,
  },
  monthAppointmentItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  appointmentStatus: {
    width: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  appointmentInfo: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 2,
  },
  detailSubtext: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5722',
    marginTop: 5,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  editButton: {
    backgroundColor: '#FF5722',
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 5,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  errorContainer: {
    marginBottom: 20,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '500',
  },
  completionSection: {
    marginBottom: 20,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 12,
  },
  offlineBanner: {
    backgroundColor: '#FF5722',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  appointmentContent: {
    flex: 1,
    padding: 4,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  monthDayAppointments: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  monthAppointmentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  moreAppointments: {
    fontSize: 10,
    color: '#666666',
    marginLeft: 2,
  },
  monthItemTime: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  monthItemClient: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  monthItemService: {
    fontSize: 12,
    color: '#666666',
  },
  monthItemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF5722',
    marginTop: 2,
  },
  calendarContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  appointmentsList: {
    flex: 1,
    marginTop: 8,
  },
  selectedDayAppointments: {
    flex: 1,
    padding: 16,
  },
  weekCalendar: {
    paddingBottom: 0,
    height: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  weekViewScrollContent: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  timeGrid: {
    flexDirection: 'row',
    flex: 1,
    paddingTop: 8,
  },
  gridContainer: {
    flex: 1,
    position: 'relative',
    borderLeftWidth: 1,
    borderLeftColor: '#EEEEEE',
  },
  appointment: {
    position: 'absolute',
    borderRadius: 8,
    overflow: 'hidden',
    margin: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 60,
    padding: 4,
  },
});