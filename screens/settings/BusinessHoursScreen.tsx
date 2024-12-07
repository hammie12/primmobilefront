import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';
import { StackNavigationProp } from '@react-navigation/stack';

interface TimeSlot {
  open: string;
  close: string;
}

interface DaySchedule {
  isOpen: boolean;
  hours: TimeSlot;
}

interface BusinessHoursScreenProps {
  navigation: StackNavigationProp<any>;
}

export const BusinessHoursScreen: React.FC<BusinessHoursScreenProps> = ({ navigation }) => {
  const [schedule, setSchedule] = useState({
    monday: { isOpen: true, hours: { open: '09:00', close: '17:00' } },
    tuesday: { isOpen: true, hours: { open: '09:00', close: '17:00' } },
    wednesday: { isOpen: true, hours: { open: '09:00', close: '17:00' } },
    thursday: { isOpen: true, hours: { open: '09:00', close: '17:00' } },
    friday: { isOpen: true, hours: { open: '09:00', close: '17:00' } },
    saturday: { isOpen: false, hours: { open: '10:00', close: '15:00' } },
    sunday: { isOpen: false, hours: { open: '10:00', close: '15:00' } },
  });

  const [specialHours, setSpecialHours] = useState([
    {
      date: '2024-01-01',
      name: 'New Year\'s Day',
      isOpen: false,
      hours: { open: '00:00', close: '00:00' },
    },
  ]);

  const toggleDay = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen,
      },
    }));
  };

  const DayScheduleItem: React.FC<{
    day: string;
    dayName: string;
    schedule: DaySchedule;
  }> = ({ day, dayName, schedule }) => (
    <View style={styles.dayItem}>
      <View style={styles.dayHeader}>
        <Text style={styles.dayName}>{dayName}</Text>
        <Switch
          trackColor={{ false: '#e0e0e0', true: 'rgba(255, 87, 34, 0.4)' }}
          thumbColor={schedule.isOpen ? '#FF5722' : '#f4f3f4'}
          ios_backgroundColor="#e0e0e0"
          onValueChange={() => toggleDay(day)}
          value={schedule.isOpen}
        />
      </View>
      {schedule.isOpen && (
        <TouchableOpacity style={styles.hoursContainer}>
          <Text style={styles.hoursText}>
            {schedule.hours.open} - {schedule.hours.close}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#FF5722" />
        </TouchableOpacity>
      )}
    </View>
  );

  const handleSave = () => {
    // TODO: Implement save functionality
    navigation.goBack();
  };

  return (
    <BaseSettingsScreen title="Business Hours" onSave={handleSave}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Regular Hours</Text>
          <View style={styles.card}>
            <DayScheduleItem day="monday" dayName="Monday" schedule={schedule.monday} />
            <DayScheduleItem day="tuesday" dayName="Tuesday" schedule={schedule.tuesday} />
            <DayScheduleItem day="wednesday" dayName="Wednesday" schedule={schedule.wednesday} />
            <DayScheduleItem day="thursday" dayName="Thursday" schedule={schedule.thursday} />
            <DayScheduleItem day="friday" dayName="Friday" schedule={schedule.friday} />
            <DayScheduleItem day="saturday" dayName="Saturday" schedule={schedule.saturday} />
            <DayScheduleItem day="sunday" dayName="Sunday" schedule={schedule.sunday} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Special Hours</Text>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={24} color="#FF5722" />
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            {specialHours.map((special, index) => (
              <View key={index} style={styles.specialDay}>
                <View style={styles.specialDayHeader}>
                  <Text style={styles.specialDayName}>{special.name}</Text>
                  <Text style={styles.specialDayDate}>{special.date}</Text>
                </View>
                <View style={styles.specialDayHours}>
                  {special.isOpen ? (
                    <Text style={styles.hoursText}>
                      {special.hours.open} - {special.hours.close}
                    </Text>
                  ) : (
                    <Text style={styles.closedText}>Closed</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </BaseSettingsScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayItem: {
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  hoursContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  hoursText: {
    fontSize: 15,
    color: '#666',
  },
  addButton: {
    padding: 8,
  },
  specialDay: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 16,
  },
  specialDayHeader: {
    marginBottom: 8,
  },
  specialDayName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  specialDayDate: {
    fontSize: 14,
    color: '#666',
  },
  specialDayHours: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  closedText: {
    fontSize: 15,
    color: '#FF5722',
  },
});
