import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ViewMode = 'day' | 'week' | 'month';

interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  clientName: string;
  service: string;
  duration: number;
}

export const BookingScreen = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      date: '2024-01-20',
      time: '10:00',
      clientName: 'John Doe',
      service: 'Haircut',
      duration: 60,
    },
    {
      id: '2',
      date: '2024-01-20',
      time: '14:30',
      clientName: 'Jane Smith',
      service: 'Color Treatment',
      duration: 120,
    },
  ]);

  const timeSlots: TimeSlot[] = Array.from({ length: 24 }, (_, i) => ({
    id: i.toString(),
    time: `${i.toString().padStart(2, '0')}:00`,
    isAvailable: true,
  }));

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

  const renderDayView = () => (
    <ScrollView style={styles.dayViewContainer}>
      {timeSlots.map((slot) => {
        const appointment = appointments.find(
          (apt) => apt.date === format(selectedDate, 'yyyy-MM-dd') && apt.time === slot.time
        );

        return (
          <View key={slot.id} style={styles.timeSlot}>
            <Text style={styles.timeText}>{slot.time}</Text>
            <View style={styles.appointmentContainer}>
              {appointment ? (
                <View style={styles.appointmentCard}>
                  <Text style={styles.appointmentClientName}>{appointment.clientName}</Text>
                  <Text style={styles.appointmentService}>{appointment.service}</Text>
                  <Text style={styles.appointmentDuration}>{appointment.duration} min</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.availableSlot}>
                  <Text style={styles.availableSlotText}>Available</Text>
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
        {timeSlots.map((slot) => (
          <View key={slot.id} style={styles.weekTimeSlot}>
            <Text style={styles.timeText}>{slot.time}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Array.from({ length: 7 }).map((_, index) => {
                const date = new Date(selectedDate);
                date.setDate(date.getDate() - date.getDay() + index);
                const appointment = appointments.find(
                  (apt) => apt.date === format(date, 'yyyy-MM-dd') && apt.time === slot.time
                );

                return (
                  <View key={index} style={styles.weekDaySlot}>
                    {appointment ? (
                      <View style={styles.weekAppointmentCard}>
                        <Text style={styles.weekAppointmentText}>{appointment.clientName}</Text>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.weekAvailableSlot}>
                        <Text style={styles.weekAvailableText}>+</Text>
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
            .filter((apt) => apt.date === format(selectedDate, 'yyyy-MM-dd'))
            .map((appointment) => (
              <View key={appointment.id} style={styles.monthAppointmentCard}>
                <Text style={styles.monthAppointmentTime}>{appointment.time}</Text>
                <View style={styles.monthAppointmentDetails}>
                  <Text style={styles.monthAppointmentClient}>{appointment.clientName}</Text>
                  <Text style={styles.monthAppointmentService}>{appointment.service}</Text>
                </View>
                <Text style={styles.monthAppointmentDuration}>{appointment.duration} min</Text>
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
});
