import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CustomerNavigationBar } from '../../components/CustomerNavigationBar';
import { StatusBar } from 'expo-status-bar';
import { Calendar } from 'react-native-calendars';

export const BookingScreen = ({ route }) => {
  const navigation = useNavigation();
  const { 
    professionalId,
    serviceName,
    servicePrice,
    serviceDuration,
    professionalName
  } = route.params;

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showTimeModal, setShowTimeModal] = useState(false);

  // Business hours for each day (0 = Sunday, 1 = Monday, etc.)
  const businessHours = {
    0: { isOpen: false, start: '10:00', end: '15:00' }, // Sunday
    1: { isOpen: true, start: '09:00', end: '17:00' },  // Monday
    2: { isOpen: true, start: '09:00', end: '17:00' },  // Tuesday
    3: { isOpen: true, start: '09:00', end: '17:00' },  // Wednesday
    4: { isOpen: true, start: '09:00', end: '17:00' },  // Thursday
    5: { isOpen: true, start: '09:00', end: '17:00' },  // Friday
    6: { isOpen: false, start: '10:00', end: '15:00' }  // Saturday
  };

  // Generate time slots based on business hours and service duration
  const generateTimeSlots = (date) => {
    const dayOfWeek = new Date(date).getDay();
    const hours = businessHours[dayOfWeek];
    
    if (!hours?.isOpen) return [];

    const slots = [];
    const [startHour] = hours.start.split(':').map(Number);
    const [endHour] = hours.end.split(':').map(Number);
    const durationInHours = parseInt(serviceDuration) / 60;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }

    return slots;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Book Appointment</Text>
    </View>
  );

  const renderBookingSummary = () => (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>Booking Summary</Text>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Service:</Text>
        <Text style={styles.summaryValue}>{serviceName}</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Professional:</Text>
        <Text style={styles.summaryValue}>{professionalName}</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Duration:</Text>
        <Text style={styles.summaryValue}>{serviceDuration}</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Price:</Text>
        <Text style={styles.summaryValue}>{servicePrice}</Text>
      </View>
    </View>
  );

  const renderTimeModal = () => (
    <Modal
      visible={showTimeModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowTimeModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Time</Text>
            <TouchableOpacity onPress={() => setShowTimeModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.timeList}>
            {generateTimeSlots(selectedDate).map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeItem,
                  selectedTime === time && styles.selectedTimeItem
                ]}
                onPress={() => {
                  setSelectedTime(time);
                  setShowTimeModal(false);
                }}
              >
                <Text style={[
                  styles.timeText,
                  selectedTime === time && styles.selectedTimeText
                ]}>{time}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {renderHeader()}
      <ScrollView style={styles.content}>
        {renderBookingSummary()}
        
        <View style={styles.calendarContainer}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <Calendar
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              setShowTimeModal(true);
            }}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: '#FF5722' }
            }}
            minDate={new Date().toISOString().split('T')[0]}
            maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            theme={{
              selectedDayBackgroundColor: '#FF5722',
              todayTextColor: '#FF5722',
              arrowColor: '#FF5722',
            }}
          />
        </View>

        {selectedDate && selectedTime && (
          <View style={styles.selectedDateTime}>
            <Text style={styles.sectionTitle}>Selected Date & Time</Text>
            <View style={styles.dateTimeBox}>
              <View style={styles.dateTimeItem}>
                <MaterialCommunityIcons name="calendar" size={24} color="#FF5722" />
                <Text style={styles.dateTimeText}>{selectedDate}</Text>
              </View>
              <View style={styles.dateTimeItem}>
                <MaterialCommunityIcons name="clock-outline" size={24} color="#FF5722" />
                <Text style={styles.dateTimeText}>{selectedTime}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {renderTimeModal()}

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.confirmButton,
            (!selectedDate || !selectedTime) && styles.disabledButton
          ]}
          disabled={!selectedDate || !selectedTime}
          onPress={() => {
            navigation.navigate('BookingConfirmation', {
              professionalId,
              serviceName,
              servicePrice,
              serviceDuration,
              professionalName,
              date: selectedDate,
              time: selectedTime,
            });
          }}
        >
          <Text style={styles.confirmButtonText}>Confirm Booking</Text>
        </TouchableOpacity>
      </View>
      <CustomerNavigationBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 60,
    backgroundColor: '#FF5722',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  summaryContainer: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    margin: 16,
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#666666',
    fontSize: 14,
  },
  summaryValue: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '500',
  },
  calendarContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  selectedDateTime: {
    padding: 16,
  },
  dateTimeBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  timeList: {
    padding: 16,
  },
  timeItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
  },
  selectedTimeItem: {
    backgroundColor: '#FF5722',
  },
  timeText: {
    fontSize: 16,
    color: '#333333',
  },
  selectedTimeText: {
    color: '#FFFFFF',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  confirmButton: {
    backgroundColor: '#FF5722',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
