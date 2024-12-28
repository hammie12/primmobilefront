import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BusinessTopBar } from '../components/BusinessTopBar';
import { useNavigation } from '@react-navigation/native';
import { Typography } from '../components/Typography';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { generateRandomColor } from '../utils/colors';

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

export const BusinessBookingsScreen = () => {
  const navigation = useNavigation();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonthDay, setSelectedMonthDay] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

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

    return relevantAppointments.map(appointment => {
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
        left = (dayIndex * (100 / 7));
        width = '13%';
      }

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
          <Typography variant="caption" style={styles.appointmentTime}>
            {appointment.start_time} - {appointment.end_time}
          </Typography>
          <Typography variant="body1" style={styles.appointmentClient} numberOfLines={1}>
            {appointment.customer_name}
          </Typography>
          <Typography variant="body2" style={styles.appointmentService} numberOfLines={1}>
            {appointment.service_name}
          </Typography>
          <Typography variant="body1" style={styles.appointmentPrice}>£{appointment.price}</Typography>
        </TouchableOpacity>
      );
    });
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(selectedDate);
    
    return (
      <View style={styles.monthContainer}>
        <View style={styles.monthGrid}>
          {WEEKDAYS.map(day => (
            <View key={day} style={styles.monthDayHeader}>
              <Typography variant="body2" style={styles.monthDayHeaderText}>{day}</Typography>
            </View>
          ))}
          {daysInMonth.map((date, index) => {
            const hasAppointments = date && appointments.some(
              apt => new Date(apt.date).toDateString() === date.toDateString()
            );
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.monthDay,
                  hasAppointments && styles.monthDayWithAppointments,
                  date && selectedMonthDay && date.getDate() === selectedMonthDay.getDate() && 
                  styles.selectedMonthDay
                ]}
                onPress={() => date && setSelectedMonthDay(date)}
              >
                {date && (
                  <Typography 
                    variant="body1" 
                    style={[
                      styles.monthDayText,
                      (date.toDateString() === new Date().toDateString()) && styles.todayText
                    ]}
                  >
                    {date.getDate()}
                  </Typography>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        {selectedMonthDay && (
          <ScrollView style={styles.selectedDayAppointments}>
            <Typography variant="h2" style={styles.selectedDayTitle}>
              Appointments for {selectedMonthDay.toLocaleDateString()}
            </Typography>
            <View style={styles.dayAppointmentsList}>
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
                      <Typography variant="caption" style={styles.appointmentTime}>
                        {apt.start_time} - {apt.end_time}
                      </Typography>
                      <Typography variant="body1" style={styles.appointmentClient}>
                        {apt.customer_name}
                      </Typography>
                      <Typography variant="body2" style={styles.appointmentService}>
                        {apt.service_name}
                      </Typography>
                      <Typography variant="body1" style={styles.appointmentPrice}>
                        £{apt.price}
                      </Typography>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          </ScrollView>
        )}
      </View>
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
              <View style={[styles.statusBadge, { backgroundColor: selectedAppointment.color }]}>
                <Typography variant="button" style={styles.statusText}>
                  {selectedAppointment.status}
                </Typography>
              </View>

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
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.footerButton, styles.cancelButton]}
                onPress={() => setSelectedAppointment(null)}
              >
                <Typography variant="button" style={styles.footerButtonText}>Close</Typography>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.footerButton, styles.editButton]}
                onPress={() => {
                  // TODO: Implement edit functionality
                  setSelectedAppointment(null);
                }}
              >
                <Typography variant="button" style={styles.footerButtonText}>Edit</Typography>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
          {viewMode === 'month' ? renderMonthView() : renderTimeGrid()}
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
    padding: 8,
    borderRadius: 8,
    overflow: 'hidden',
    margin: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appointmentTime: {
    fontSize: 10,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  appointmentClient: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  appointmentService: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  appointmentPrice: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    marginTop: 2,
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
});