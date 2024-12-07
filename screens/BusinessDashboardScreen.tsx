import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BaseSettingsScreen } from '../components/BaseSettingsScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BusinessNavigationBar } from '../components/BusinessNavigationBar';
import { Calendar, CalendarList } from 'react-native-calendars';
import { format } from 'date-fns';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ViewMode = 'day' | 'week' | 'month';

interface Appointment {
  id: string;
  time: string;
  clientName: string;
  service: string;
  duration: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

const BusinessDashboardScreen = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      time: '14:30',
      clientName: 'Sarah Johnson',
      service: 'Hair Styling',
      duration: '1h',
      status: 'confirmed',
    },
    {
      id: '2',
      time: '16:00',
      clientName: 'Mike Smith',
      service: 'Beard Trim',
      duration: '30m',
      status: 'pending',
    },
  ]);

  const renderMetricCard = (title: string, value: string, icon: string) => (
    <View style={styles.metricCard}>
      <MaterialCommunityIcons name={icon as any} size={24} color="#FF5722" />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
    </View>
  );

  const renderViewModeSelector = () => (
    <View style={styles.viewModeContainer}>
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'day' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('day')}
      >
        <Text style={[styles.viewModeText, viewMode === 'day' && styles.viewModeTextActive]}>
          Day
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'week' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('week')}
      >
        <Text style={[styles.viewModeText, viewMode === 'week' && styles.viewModeTextActive]}>
          Week
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'month' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('month')}
      >
        <Text style={[styles.viewModeText, viewMode === 'month' && styles.viewModeTextActive]}>
          Month
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderAppointmentCard = (appointment: Appointment) => (
    <View key={appointment.id} style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <Text style={styles.appointmentTime}>{appointment.time}</Text>
        <Text style={[
          styles.appointmentStatus,
          { color: appointment.status === 'confirmed' ? '#4CAF50' : '#FF9800' }
        ]}>
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </Text>
      </View>
      <Text style={styles.appointmentClient}>{appointment.clientName}</Text>
      <Text style={styles.appointmentService}>{appointment.service} - {appointment.duration}</Text>
    </View>
  );

  const renderDayView = () => (
    <View style={styles.calendarContainer}>
      <Calendar
        current={format(selectedDate, 'yyyy-MM-dd')}
        onDayPress={(day) => setSelectedDate(new Date(day.timestamp))}
        markedDates={{
          [format(selectedDate, 'yyyy-MM-dd')]: { selected: true, selectedColor: '#FF5722' },
        }}
      />
      <View style={styles.daySchedule}>
        <Text style={styles.scheduleDate}>{format(selectedDate, 'MMMM d, yyyy')}</Text>
        {appointments.map(renderAppointmentCard)}
      </View>
    </View>
  );

  const renderWeekView = () => (
    <View style={styles.calendarContainer}>
      <Calendar
        current={format(selectedDate, 'yyyy-MM-dd')}
        onDayPress={(day) => setSelectedDate(new Date(day.timestamp))}
        markedDates={{
          [format(selectedDate, 'yyyy-MM-dd')]: { selected: true, selectedColor: '#FF5722' },
        }}
      />
      <View style={styles.weekSchedule}>
        <Text style={styles.scheduleDate}>
          Week of {format(selectedDate, 'MMMM d, yyyy')}
        </Text>
        {appointments.map(renderAppointmentCard)}
      </View>
    </View>
  );

  const renderMonthView = () => (
    <View style={styles.calendarContainer}>
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
      />
      <View style={styles.monthSchedule}>
        <Text style={styles.scheduleDate}>{format(selectedDate, 'MMMM d, yyyy')}</Text>
        {appointments.map(renderAppointmentCard)}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFEFEA', '#FFFFFF']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView}>
          <BaseSettingsScreen>
            <Text style={styles.headerText}>Business Dashboard</Text>
            
            <View style={styles.metricsContainer}>
              {renderMetricCard('Today\'s Bookings', '8', 'calendar-today')}
              {renderMetricCard('Revenue', '£450', 'cash')}
              {renderMetricCard('New Clients', '3', 'account-plus')}
            </View>

            <View style={styles.calendarSection}>
              {renderViewModeSelector()}
              {viewMode === 'day' && renderDayView()}
              {viewMode === 'week' && renderWeekView()}
              {viewMode === 'month' && renderMonthView()}
            </View>

            <TouchableOpacity style={styles.addButton}>
              <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </BaseSettingsScreen>
        </ScrollView>
      </LinearGradient>
      <BusinessNavigationBar />
    </SafeAreaView>
  );
};

export { BusinessDashboardScreen };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFEFEA',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1A1A1A',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 6,
    alignItems: 'center',
    elevation: 2,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginVertical: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  calendarSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
  },
  viewModeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  viewModeButton: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  viewModeButtonActive: {
    backgroundColor: '#FF5722',
  },
  viewModeText: {
    fontSize: 14,
    color: '#666666',
  },
  viewModeTextActive: {
    color: '#FFFFFF',
  },
  calendarContainer: {
    marginBottom: 16,
  },
  daySchedule: {
    marginTop: 16,
  },
  weekSchedule: {
    marginTop: 16,
  },
  monthSchedule: {
    marginTop: 16,
  },
  scheduleDate: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1A1A1A',
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  appointmentStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  appointmentClient: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  appointmentService: {
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
});