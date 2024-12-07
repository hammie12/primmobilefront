import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BusinessTopBar } from '../components/BusinessTopBar';
import { BusinessNavigationBar } from '../components/BusinessNavigationBar';

type ViewMode = 'day' | 'week' | 'month';
type Appointment = {
  id: string;
  startTime: string;
  endTime: string;
  client: string;
  service: string;
  status: 'confirmed' | 'pending';
  color: string;
  date: string;
  price: number;
  email: string;
  phone: string;
  notes?: string;
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => `${i + 6}:00`);
const SCREEN_HEIGHT = Dimensions.get('window').height;

export const BusinessBookingsScreen: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonthDay, setSelectedMonthDay] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Sample appointments data with dates
  const appointments: Appointment[] = [
    // December 2024
    {
      id: '1',
      startTime: '09:00',
      endTime: '10:00',
      client: 'Jane Smith',
      service: 'Manicure',
      status: 'confirmed',
      color: '#1a3447',
      date: '2024-12-16',
      price: 28,
      email: 'jane.smith@gmail.co.uk',
      phone: '07700 900123',
      notes: 'Regular customer, prefers gel polish'
    },
    {
      id: '2',
      startTime: '10:45',
      endTime: '11:45',
      client: 'Lisa Brown',
      service: 'Beard Trim',
      status: 'confirmed',
      color: '#ffc107',
      date: '2024-12-16',
      price: 20,
      email: 'lisa.brown@hotmail.co.uk',
      phone: '07700 900234'
    },
    {
      id: '3',
      startTime: '13:00',
      endTime: '14:30',
      client: 'Emily Clark',
      service: 'Facial',
      status: 'confirmed',
      color: '#8bc34a',
      date: '2024-12-18',
      price: 45,
      email: 'emily.clark@btinternet.com',
      phone: '07700 900345'
    },
    {
      id: '4',
      startTime: '15:00',
      endTime: '16:00',
      client: 'Sarah Wilson',
      service: 'Massage',
      status: 'pending',
      color: '#9c27b0',
      date: '2024-12-20',
      price: 50,
      email: 'sarah.wilson@yahoo.co.uk',
      phone: '07700 900456'
    },
    {
      id: '5',
      startTime: '11:30',
      endTime: '12:30',
      client: 'Mike Johnson',
      service: 'Haircut',
      status: 'confirmed',
      color: '#ff5722',
      date: '2024-12-23',
      price: 25,
      email: 'mike.johnson@outlook.com',
      phone: '07700 900567'
    },
    {
      id: '6',
      startTime: '14:00',
      endTime: '15:00',
      client: 'Emma Davis',
      service: 'Waxing',
      status: 'confirmed',
      color: '#e91e63',
      date: '2024-12-27',
      price: 35,
      email: 'emma.davis@gmail.co.uk',
      phone: '07700 900678'
    },
    // January 2025
    {
      id: '7',
      startTime: '10:00',
      endTime: '11:00',
      client: 'James Wilson',
      service: 'Massage',
      status: 'confirmed',
      color: '#2196f3',
      date: '2025-01-03',
      price: 50,
      email: 'james.wilson@btinternet.com',
      phone: '07700 900789'
    },
    {
      id: '8',
      startTime: '12:00',
      endTime: '13:30',
      client: 'Sophie Lee',
      service: 'Facial',
      status: 'confirmed',
      color: '#4caf50',
      date: '2025-01-03',
      price: 45,
      email: 'sophie.lee@yahoo.co.uk',
      phone: '07700 900890'
    },
    {
      id: '9',
      startTime: '09:30',
      endTime: '10:30',
      client: 'David Chen',
      service: 'Haircut & Style',
      status: 'pending',
      color: '#ff9800',
      date: '2025-01-06',
      price: 35,
      email: 'david.chen@gmail.co.uk',
      phone: '07700 900901'
    },
    {
      id: '10',
      startTime: '11:00',
      endTime: '12:30',
      client: 'Rachel Green',
      service: 'Manicure & Pedicure',
      status: 'confirmed',
      color: '#009688',
      date: '2025-01-08',
      price: 55,
      email: 'rachel.green@hotmail.co.uk',
      phone: '07700 901012'
    },
    {
      id: '11',
      startTime: '13:00',
      endTime: '14:00',
      client: 'Tom Parker',
      service: 'Beard Trim & Styling',
      status: 'confirmed',
      color: '#795548',
      date: '2025-01-10',
      price: 30,
      email: 'tom.parker@outlook.com',
      phone: '07700 901123'
    },
    {
      id: '12',
      startTime: '15:00',
      endTime: '16:00',
      client: 'Linda Martinez',
      service: 'Deep Tissue Massage',
      status: 'pending',
      color: '#607d8b',
      date: '2025-01-13',
      price: 65,
      email: 'linda.martinez@gmail.co.uk',
      phone: '07700 901234'
    },
    {
      id: '13',
      startTime: '10:00',
      endTime: '12:00',
      client: 'Alex Turner',
      service: 'Hair Coloring',
      status: 'confirmed',
      color: '#3f51b5',
      date: '2025-01-15',
      price: 75,
      email: 'alex.turner@btinternet.com',
      phone: '07700 901345'
    },
    {
      id: '14',
      startTime: '13:00',
      endTime: '16:00',
      client: 'Julia White',
      service: 'Spa Package',
      status: 'confirmed',
      color: '#673ab7',
      date: '2025-01-17',
      price: 120,
      email: 'julia.white@yahoo.co.uk',
      phone: '07700 901456'
    }
  ];

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
          <Text style={[styles.viewModeText, viewMode === mode && styles.viewModeTextActive]}>
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Text>
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
        const appointmentDate = new Date(appointment.date);
        return appointmentDate.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];
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
      const startHour = parseInt(appointment.startTime.split(':')[0]);
      const startMinute = parseInt(appointment.startTime.split(':')[1]);
      const endHour = parseInt(appointment.endTime.split(':')[0]);
      const endMinute = parseInt(appointment.endTime.split(':')[1]);
      
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
          <Text style={styles.appointmentTime}>
            {appointment.startTime} - {appointment.endTime}
          </Text>
          <Text style={styles.appointmentClient} numberOfLines={1}>
            {appointment.client}
          </Text>
          <Text style={styles.appointmentService} numberOfLines={1}>
            {appointment.service}
          </Text>
          <Text style={styles.appointmentPrice}>£{appointment.price}</Text>
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
              <Text style={styles.monthDayHeaderText}>{day}</Text>
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
                  <Text style={[
                    styles.monthDayText,
                    (date.toDateString() === new Date().toDateString()) && styles.todayText
                  ]}>
                    {date.getDate()}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        {selectedMonthDay && (
          <ScrollView style={styles.selectedDayAppointments}>
            <Text style={styles.selectedDayTitle}>
              Appointments for {selectedMonthDay.toLocaleDateString()}
            </Text>
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
                      <Text style={styles.appointmentTime}>
                        {apt.startTime} - {apt.endTime}
                      </Text>
                      <Text style={styles.appointmentClient}>{apt.client}</Text>
                      <Text style={styles.appointmentService}>{apt.service}</Text>
                      <Text style={styles.appointmentPrice}>£{apt.price}</Text>
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
              <Text style={styles.modalTitle}>Appointment Details</Text>
              <TouchableOpacity 
                onPress={() => setSelectedAppointment(null)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={[styles.statusBadge, { backgroundColor: selectedAppointment.color }]}>
                <Text style={styles.statusText}>{selectedAppointment.status}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailText}>
                  {new Date(selectedAppointment.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                <Text style={styles.detailText}>
                  {selectedAppointment.startTime} - {selectedAppointment.endTime}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Client Information</Text>
                <Text style={styles.detailText}>{selectedAppointment.client}</Text>
                <Text style={styles.detailSubtext}>{selectedAppointment.email}</Text>
                <Text style={styles.detailSubtext}>{selectedAppointment.phone}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Service</Text>
                <Text style={styles.detailText}>{selectedAppointment.service}</Text>
                <Text style={styles.priceText}>
                  £{selectedAppointment.price.toFixed(2)}
                </Text>
              </View>

              {selectedAppointment.notes && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Notes</Text>
                  <Text style={styles.detailText}>{selectedAppointment.notes}</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.footerButton, styles.cancelButton]}
                onPress={() => setSelectedAppointment(null)}
              >
                <Text style={styles.footerButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.footerButton, styles.editButton]}
                onPress={() => {
                  // TODO: Implement edit functionality
                  setSelectedAppointment(null);
                }}
              >
                <Text style={styles.footerButtonText}>Edit</Text>
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
          <Text style={styles.screenTitle}>Appointments</Text>
          {renderViewModeSelector()}
        </View>

        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateDate('prev')}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#666666" />
          </TouchableOpacity>
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('en-US', { 
              month: 'long',
              year: 'numeric',
              ...(viewMode !== 'month' && { day: 'numeric' })
            })}
          </Text>
          <TouchableOpacity onPress={() => navigateDate('next')}>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666666" />
          </TouchableOpacity>
        </View>

        {viewMode !== 'month' && (
          <View style={styles.weekDayHeader}>
            {(viewMode === 'week' ? weekDates : [selectedDate]).map((date, index) => (
              <View key={date.toISOString()} style={styles.weekDayCell}>
                <Text style={styles.weekDayText}>
                  {viewMode === 'week' ? WEEKDAYS[index] : WEEKDAYS[date.getDay()]}
                </Text>
                <Text style={[
                  styles.weekDateText,
                  date.toDateString() === new Date().toDateString() && styles.todayDate
                ]}>
                  {date.getDate()}
                </Text>
              </View>
            ))}
          </View>
        )}

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={[
            styles.scrollViewContent,
            { paddingBottom: 100 } // Add padding for navigation bar
          ]}
        >
          {viewMode === 'month' ? renderMonthView() : renderTimeGrid()}
        </ScrollView>

        <TouchableOpacity style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <BusinessNavigationBar />
      {renderAppointmentModal()}
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
    borderRadius: 4,
    overflow: 'hidden',
    margin: 1,
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
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 80, // Adjusted to be above navigation bar
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
    backgroundColor: '#FFE0D6', // Pastel orange
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
    height: 6,
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