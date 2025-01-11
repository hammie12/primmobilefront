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
  TextStyle,
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

// Queue for offline operations
type QueuedOperation = {
  id: string;
  type: 'cancel';
  data: any;
  timestamp: number;
};

type ViewMode = 'day' | 'month';
type Appointment = {
  id: string;
  start_time: string;
  end_time: string;
  customer_name: string;
  service_name: string;
  color?: string;
  date: string;
  price: number;
  customer_email: string;
  customer_phone: string;
  notes?: string;
  business_id: string;
  deposit_price: number;
  full_price: number;
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CALENDAR_PADDING = 16;
const DAY_CELL_SIZE = (SCREEN_WIDTH - CALENDAR_PADDING * 2) / 7;

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  customer_id: {
    first_name: string;
    last_name: string;
    phone_number: string;
    user_id: {
      email: string;
    };
  };
  service_id: {
    name: string;
    deposit_price: number;
    full_price: number;
  };
};

// Add this helper function at the top of the file, outside the component
const doAppointmentsOverlap = (a: Appointment, b: Appointment) => {
  const aStart = new Date(`${a.date}T${a.start_time}`);
  const aEnd = new Date(`${a.date}T${a.end_time}`);
  const bStart = new Date(`${b.date}T${b.start_time}`);
  const bEnd = new Date(`${b.date}T${b.end_time}`);
  
  return aStart < bEnd && bStart < aEnd;
};

const WeekDayHeader = ({ date }: { date: Date }) => (
  <View style={styles.weekDayCell}>
    <Typography variant="caption" style={styles.weekDayText}>
      {WEEKDAYS[date.getDay()]}
    </Typography>
    <Typography 
      variant="body2" 
      style={[
        styles.weekDateText,
        date.toDateString() === new Date().toDateString() && styles.todayDate
      ]}
    >
      {date.getDate()}
    </Typography>
  </View>
);

const TimeColumn = () => (
  <View style={styles.timeLabels}>
    {TIME_SLOTS.map(time => (
      <View key={time} style={styles.timeLabel}>
        <Typography variant="caption" style={styles.timeLabelText}>
          {time}
        </Typography>
      </View>
    ))}
  </View>
);

const DayColumn = ({ date, appointments }: { date: Date, appointments: Appointment[] }) => {
  const dayAppointments = appointments.filter(apt => 
    new Date(apt.date).toDateString() === date.toDateString()
  );

  return (
    <View style={styles.dayColumn}>
      {TIME_SLOTS.map((_, index) => (
        <View key={index} style={styles.hourCell} />
      ))}
      {dayAppointments.map(appointment => {
        const startHour = parseInt(appointment.start_time.split(':')[0]);
        const startMinute = parseInt(appointment.start_time.split(':')[1]);
        const endHour = parseInt(appointment.end_time.split(':')[0]);
        const endMinute = parseInt(appointment.end_time.split(':')[1]);
        
        const top = (startHour * 60 + startMinute);
        const height = ((endHour - startHour) * 60 + (endMinute - startMinute));

        return (
          <TouchableOpacity
            key={appointment.id}
            style={[
              styles.appointment,
              {
                top,
                height,
                backgroundColor: appointment.color,
              },
            ]}
            onPress={() => handleAppointmentPress(appointment)}
          >
            <View style={styles.appointmentContent}>
              <View style={styles.appointmentHeader}>
                <Typography 
                  variant="caption" 
                  style={styles.appointmentTime}
                  numberOfLines={1}
                >
                  {appointment.start_time} - {appointment.end_time}
                </Typography>
              </View>
              <Typography 
                variant="body1" 
                style={styles.appointmentClient}
                numberOfLines={1}
              >
                {appointment.customer_name}
              </Typography>
              <Typography 
                variant="body1" 
                style={styles.appointmentService}
                numberOfLines={1}
              >
                {appointment.service_name}
              </Typography>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const getWeekRange = (date: Date) => {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // End of week (Saturday)
  
  return { start, end };
};

const formatWeekRange = (start: Date, end: Date) => {
  if (start.getMonth() === end.getMonth()) {
    return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
  } else {
    return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()} - ${end.toLocaleDateString('en-US', { month: 'short' })} ${end.getDate()}, ${start.getFullYear()}`;
  }
};

const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  
  // Add padding days from previous month
  for (let i = 0; i < firstDay.getDay(); i++) {
    const prevDate = new Date(year, month, -i);
    days.unshift({ date: prevDate, isCurrentMonth: false });
  }
  
  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }
  
  // Add padding days from next month if needed
  const remainingDays = 42 - days.length; // 6 rows × 7 days
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
  }
  
  return days;
};

const getWeekDates = (date: Date) => {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay()); // Start from Sunday
  
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
};

export const BusinessBookingsScreen = () => {
  const navigation = useNavigation();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonthDay, setSelectedMonthDay] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [operationQueue, setOperationQueue] = useState<QueuedOperation[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [statusAnimation] = useState(new Animated.Value(0));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);

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
      await updateBookingStatus(
        appointment.id, 
        'COMPLETED',
        completionNotes || undefined
      );
      
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
      
      // Show success message
      Alert.alert('Success', 'Appointment marked as completed successfully');
      
      // Close modal and clear notes
      setSelectedAppointment(null);
      setCompletionNotes('');
      
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

        // Update the query to select both prices
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
              deposit_price,
              full_price
            )
          `)
          .eq('professional_id', professionalData.id);

        if (bookingsError) throw bookingsError;

        // Update the transformation to include both prices
        const formattedAppointments: Appointment[] = bookings
          .filter(booking => booking.start_time && booking.end_time)
          .map(booking => {
            const customerName = booking.customer_id 
              ? `${booking.customer_id.first_name || ''} ${booking.customer_id.last_name || ''}`.trim() 
              : 'Unknown Customer';
            
            const serviceName = booking.service_id?.name || 'Unknown Service';
            const depositPrice = booking.service_id?.deposit_price || 0;
            const fullPrice = booking.service_id?.full_price || 0;
            
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
              status: booking.status || 'PENDING',
              color: generateRandomColor(),
              date: new Date(booking.start_time).toISOString().split('T')[0],
              deposit_price: depositPrice,
              full_price: fullPrice,
              customer_email: customerEmail,
              customer_phone: customerPhone,
              notes: booking.notes || '',
              business_id: professionalData.id
            };
          });

        setAppointments(formattedAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [user?.id]);

  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay()); // Start from Sunday
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  };

  const weekDates = getWeekDates(new Date(selectedDate));

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setSelectedDate(newDate);
  };

  const renderViewModeSelector = () => (
    <View style={styles.viewModeContainer}>
      {(['day', 'month'] as ViewMode[]).map((mode) => (
        <TouchableOpacity
          key={mode}
          style={[styles.viewModeButton, viewMode === mode && styles.viewModeButtonActive]}
          onPress={() => setViewMode(mode)}
        >
          <Typography
            variant="body1"
            style={viewMode === mode ? styles.viewModeTextActive : styles.viewModeText}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Typography>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTimeGrid = () => {
    const weekDates = getWeekDates(selectedDate);

    return (
      <View style={styles.timeGridContainer}>
        {/* Week header */}
        <View style={styles.weekHeader}>
          {weekDates.map((date) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <TouchableOpacity
                key={date.toDateString()}
                style={[
                  styles.weekDayHeader,
                  isSelected && styles.selectedWeekDay
                ]}
                onPress={() => setSelectedDate(new Date(date))}
              >
                <Typography 
                  variant="caption" 
                  style={[
                    styles.weekDayName,
                    isSelected && styles.selectedWeekDayText
                  ]}
                >
                  {WEEKDAYS[date.getDay()]}
                </Typography>
                <Typography 
                  variant="body2" 
                  style={[
                    styles.weekDayDate,
                    isSelected && styles.selectedWeekDayText,
                    isToday && styles.weekDayToday
                  ]}
                >
                  {date.getDate()}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Time grid */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.timeGridScroll}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.timeGrid}>
            <TimeColumn />
            <View style={styles.gridContainer}>
              {TIME_SLOTS.map((time) => (
                <View key={time} style={styles.gridRow}>
                  <View style={styles.gridLine} />
                </View>
              ))}
              {renderAppointments()}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderAppointments = () => {
    const dayAppointments = appointments.filter(appointment => 
      appointment.date === selectedDate.toISOString().split('T')[0]
    );

    return dayAppointments.map((appointment) => {
      const startHour = parseInt(appointment.start_time.split(':')[0]);
      const startMinute = parseInt(appointment.start_time.split(':')[1]);
      const endHour = parseInt(appointment.end_time.split(':')[0]);
      const endMinute = parseInt(appointment.end_time.split(':')[1]);
      
      const top = (startHour * 60 + startMinute);
      const height = ((endHour - startHour) * 60 + (endMinute - startMinute));

      return (
        <TouchableOpacity
          key={appointment.id}
          style={[
            styles.appointment,
            {
              top,
              height,
              left: 2,
              right: 2,
              backgroundColor: appointment.color,
            },
          ]}
          onPress={() => setSelectedAppointment(appointment)}
        >
          <View style={styles.appointmentContent}>
            <Typography 
              variant="body1" 
              style={styles.dayAppointmentClient}
            >
              {appointment.customer_name}
            </Typography>
          </View>
        </TouchableOpacity>
      );
    });
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(selectedDate);
    
    return (
      <ScrollView 
        style={styles.monthContainer}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.monthContainerContent}
      >
        <View style={styles.monthCalendarWrapper}>
          <View style={styles.monthCalendar}>
            {/* Weekday headers */}
            {WEEKDAYS.map((day) => (
              <View key={day} style={styles.weekDayHeaderCell}>
                <Typography variant="caption" style={styles.weekDayLabel}>
                  {day}
                </Typography>
              </View>
            ))}
            
            {/* Calendar days */}
            {days.map(({ date, isCurrentMonth }, index) => {
              const isSelected = selectedMonthDay?.toDateString() === date.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();
              const dayAppointments = appointments.filter(apt => 
                apt.date === date.toISOString().split('T')[0]
              );
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    !isCurrentMonth && styles.otherMonthDay,
                    isSelected && styles.selectedDay,
                  ]}
                  onPress={() => {
                    setSelectedMonthDay(date);
                    setSelectedDate(date);
                  }}
                >
                  <Typography
                    variant="body1"
                    style={[
                      styles.dayNumber,
                      !isCurrentMonth && styles.otherMonthDayText,
                      isToday && styles.todayText,
                      isSelected && styles.selectedDayText,
                    ].filter(Boolean)}
                  >
                    {date.getDate()}
                  </Typography>
                  {dayAppointments.length > 0 && (
                    <View style={styles.appointmentDots}>
                      {dayAppointments.slice(0, 3).map((apt, i) => (
                        <View
                          key={i}
                          style={[
                            styles.appointmentDot,
                            { backgroundColor: apt.color },
                            i === 2 && dayAppointments.length > 3 && styles.moreDot
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected day appointments list */}
        {selectedMonthDay && (
          <View style={styles.selectedDayAppointments}>
            <Typography variant="h2" style={styles.selectedDayTitle}>
              {selectedMonthDay.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
            <View style={styles.appointmentsListContainer}>
              {appointments
                .filter(apt => apt.date === selectedMonthDay.toISOString().split('T')[0])
                .map(appointment => (
                  <TouchableOpacity
                    key={appointment.id}
                    style={[
                      styles.monthAppointmentItem,
                      { borderLeftWidth: 4, borderLeftColor: appointment.color }
                    ]}
                    onPress={() => setSelectedAppointment(appointment)}
                  >
                    <View style={styles.appointmentInfo}>
                      <Typography variant="caption" style={styles.appointmentTimeText}>
                        {appointment.start_time} - {appointment.end_time}
                      </Typography>
                      <Typography variant="body1" style={styles.appointmentClientText}>
                        {appointment.customer_name}
                      </Typography>
                      <Typography variant="body1" style={styles.appointmentServiceText}>
                        {appointment.service_name}
                      </Typography>
                      <View style={styles.priceContainer}>
                        <Typography variant="body1" style={styles.priceLabel}>Deposit:</Typography>
                        <Typography variant="h2" style={styles.depositPrice}>
                          £{appointment.deposit_price.toFixed(2)}
                        </Typography>
                      </View>
                      <View style={styles.priceContainer}>
                        <Typography variant="body1" style={styles.priceLabel}>Full Price:</Typography>
                        <Typography variant="h2" style={styles.fullPrice}>
                          £{appointment.full_price.toFixed(2)}
                        </Typography>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        )}
      </ScrollView>
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
              {errorMessage && (
                <View style={styles.errorContainer}>
                  <Typography variant="body1" style={styles.errorText}>
                    {errorMessage}
                  </Typography>
                </View>
              )}

              <View style={styles.detailSection}>
                <Typography variant="body1" style={styles.detailLabel}>Date & Time</Typography>
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
                <Typography variant="body1" style={styles.detailLabel}>Client Information</Typography>
                <Typography variant="body1" style={styles.detailText}>
                  {selectedAppointment.customer_name}
                </Typography>
                <Typography variant="body1" style={styles.detailSubtext}>
                  {selectedAppointment.customer_email}
                </Typography>
                <Typography variant="body1" style={styles.detailSubtext}>
                  {selectedAppointment.customer_phone}
                </Typography>
              </View>

              <View style={styles.detailSection}>
                <Typography variant="body1" style={styles.detailLabel}>Service</Typography>
                <Typography variant="body1" style={styles.detailText}>
                  {selectedAppointment.service_name}
                </Typography>
                <View style={styles.priceContainer}>
                  <Typography variant="body1" style={styles.priceLabel}>Deposit:</Typography>
                  <Typography variant="h2" style={styles.depositPrice}>
                    £{selectedAppointment.deposit_price.toFixed(2)}
                  </Typography>
                </View>
                <View style={styles.priceContainer}>
                  <Typography variant="body1" style={styles.priceLabel}>Full Price:</Typography>
                  <Typography variant="h2" style={styles.fullPrice}>
                    £{selectedAppointment.full_price.toFixed(2)}
                  </Typography>
                </View>
              </View>

              {selectedAppointment.notes && (
                <View style={styles.detailSection}>
                  <Typography variant="body1" style={styles.detailLabel}>Notes</Typography>
                  <Typography variant="body1" style={styles.detailText}>
                    {selectedAppointment.notes}
                  </Typography>
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
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderCalendarContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5722" />
        </View>
      );
    }

    switch (viewMode) {
      case 'month':
        return renderMonthView();
      case 'day':
        return renderTimeGrid();
      default:
        return null;
    }
  };

  const renderCalendarHeader = () => {
    const headerText = selectedDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
      ...(viewMode === 'day' && { day: 'numeric' })
    });

    return (
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={() => navigateDate('prev')}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="#666666" />
        </TouchableOpacity>
        <Typography variant="h2" style={styles.dateText}>
          {headerText}
        </Typography>
        <TouchableOpacity onPress={() => navigateDate('next')}>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#666666" />
        </TouchableOpacity>
      </View>
    );
  };

  // Add effect to handle initial scroll when switching to day view
  useEffect(() => {
    if (viewMode === 'day' && scrollViewRef.current) {
      // Delay the scroll slightly to ensure the view is rendered
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: 7 * 60, // Scroll to 7:00 AM (7 hours * 60 pixels per hour)
          animated: false
        });
      }, 100);
    }
  }, [viewMode]);

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
          <Typography variant="h1" style={styles.screenTitle}>
            Appointments
          </Typography>
          {renderViewModeSelector()}
        </View>

        {renderCalendarHeader()}
        
        <View style={styles.calendarContent}>
          {renderCalendarContent()}
        </View>

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
    paddingTop: 8,
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
    borderLeftWidth: 1,
    borderLeftColor: '#EEEEEE',
    flexDirection: 'row',
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
    zIndex: 1,
  },
  appointmentTime: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
    flexShrink: 1,
  },
  appointmentClient: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  appointmentService: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 2,
    flexShrink: 1,
  },
  appointmentPrice: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  monthContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  monthContainerContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  monthCalendarWrapper: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  monthCalendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: CALENDAR_PADDING,
    backgroundColor: '#FFFFFF',
  },
  selectedDayAppointments: {
    paddingHorizontal: 16,
  },
  appointmentsListContainer: {
    paddingTop: 8,
  },
  selectedDayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    marginTop: 8,
  },
  monthAppointmentItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
  },
  appointmentStatus: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
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
  footerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  errorContainer: {
    marginBottom: 20,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '500',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  weekDayHeader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#EEEEEE',
  },
  weekDayName: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  weekDayDate: {
    fontSize: 16,
    fontWeight: '500',
  },
  weekDayToday: {
    color: '#FF5722',
  },
  timeColumn: {
    width: 60,
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  dayColumn: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#EEEEEE',
  },
  monthCalendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: CALENDAR_PADDING,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  weekDayLabel: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
  },
  dayCell: {
    width: DAY_CELL_SIZE,
    height: DAY_CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 4,
    marginVertical: 2,
  },
  dayNumber: {
    fontSize: 14,
    color: '#333333',
  },
  otherMonthDay: {
    opacity: 0.4,
  },
  otherMonthDayText: {
    color: '#999999',
  },
  selectedDay: {
    backgroundColor: '#FF5722',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  todayText: {
    color: '#FF5722',
    fontWeight: '500',
  },
  appointmentDots: {
    flexDirection: 'row',
    marginTop: 4,
    height: 4,
    gap: 2,
  },
  appointmentDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  moreDot: {
    width: 6,
    borderRadius: 3,
  },
  weekDayHeaderCell: {
    width: DAY_CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  appointmentTimeText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  appointmentClientText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  appointmentServiceText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  appointmentPriceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF5722',
  },
  timeGridScroll: {
    flex: 1,
  },
  hourCell: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  monthContainer: {
    flex: 1,
  },
  monthCalendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: CALENDAR_PADDING,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  dayCell: {
    width: DAY_CELL_SIZE,
    height: DAY_CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 4,
    marginVertical: 2,
  },
  viewModeText: {
    color: '#666666',
  },
  viewModeTextActive: {
    color: '#000000',
    fontWeight: '500',
  },
  dayAppointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayAppointmentTime: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dayAppointmentClient: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  dayAppointmentService: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  timeGridContainer: {
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  weekDayHeader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#EEEEEE',
  },
  selectedWeekDay: {
    backgroundColor: '#FF5722',
  },
  weekDayName: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  weekDayDate: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  selectedWeekDayText: {
    color: '#FFFFFF',
  },
  weekDayToday: {
    color: '#FF5722',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  depositPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  fullPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});