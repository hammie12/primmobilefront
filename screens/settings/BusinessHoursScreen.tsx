import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { supabase } from '../../supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

type DaySchedule = {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

type WeekSchedule = {
  [key: string]: DaySchedule;
};

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const BusinessHoursScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [schedule, setSchedule] = useState<WeekSchedule>({
    Monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    Tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    Wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    Thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    Friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    Saturday: { isOpen: false, openTime: '10:00', closeTime: '16:00' },
    Sunday: { isOpen: false, openTime: '10:00', closeTime: '16:00' },
  });

  const [showPicker, setShowPicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTimeType, setSelectedTimeType] = useState<'openTime' | 'closeTime'>('openTime');
  const [tempTime, setTempTime] = useState(new Date());

  useEffect(() => {
    if (user) {
      fetchBusinessHours();
    }
  }, [user]);

  const fetchBusinessHours = async () => {
    try {
      const { data: business, error } = await supabase
        .from('businesses')
        .select('business_hours')
        .eq('owner_id', user?.id)
        .single();

      if (error) throw error;

      if (business?.business_hours) {
        setSchedule(business.business_hours);
      }
    } catch (error) {
      console.error('Error fetching business hours:', error);
      if (error.message !== 'Network request failed') {
        Alert.alert('Error', 'Failed to load business hours');
      }
    }
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save changes');
      return;
    }

    try {
      setIsLoading(true);

      // Validate times
      for (const day of DAYS_OF_WEEK) {
        const { openTime, closeTime, isOpen } = schedule[day];
        if (isOpen) {
          const openMinutes = timeToMinutes(openTime);
          const closeMinutes = timeToMinutes(closeTime);
          
          if (closeMinutes <= openMinutes) {
            throw new Error(`Invalid hours for ${day}: Closing time must be after opening time`);
          }
        }
      }

      // First, get the business ID for the professional
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (businessError) {
        console.error('Error fetching business:', businessError);
        throw new Error('Failed to fetch business details');
      }

      if (!business) {
        throw new Error('No business found for this user');
      }

      // Update the business hours in the businesses table
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ business_hours: schedule })
        .eq('id', business.id);

      if (updateError) throw updateError;

      Alert.alert('Success', 'Business hours saved successfully');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving business hours:', error);
      Alert.alert('Error', error.message || 'Failed to save business hours');
    } finally {
      setIsLoading(false);
    }
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const toggleDay = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen,
      },
    }));
  };

  const showTimePicker = (day: string, timeType: 'openTime' | 'closeTime') => {
    const currentTime = schedule[day][timeType];
    const [hours, minutes] = currentTime.split(':').map(Number);
    
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    
    setTempTime(date);
    setSelectedDay(day);
    setSelectedTimeType(timeType);
    setShowPicker(true);
  };

  const handleTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (event.type === 'set' && date && selectedDay) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;

      setSchedule(prev => ({
        ...prev,
        [selectedDay]: {
          ...prev[selectedDay],
          [selectedTimeType]: timeString,
        },
      }));
      
      if (Platform.OS === 'ios') {
        setTempTime(date);
      }
    } else if (Platform.OS === 'android') {
      setShowPicker(false);
    }
  };

  const renderTimePicker = () => {
    if (!showPicker) return null;

    if (Platform.OS === 'ios') {
      return (
        <Modal
          transparent
          visible={showPicker}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    handleTimeChange({ type: 'set' }, tempTime);
                    setShowPicker(false);
                  }}
                >
                  <Text style={styles.doneButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempTime}
                mode="time"
                display="spinner"
                onChange={(event, date) => {
                  if (date) setTempTime(date);
                }}
                is24Hour={true}
                textColor="#000000"
                themeVariant="light"
                style={styles.timePicker}
              />
            </View>
          </View>
        </Modal>
      );
    }

    return (
      <DateTimePicker
        value={tempTime}
        mode="time"
        is24Hour={true}
        display="default"
        onChange={handleTimeChange}
        textColor="#000000"
        themeVariant="light"
      />
    );
  };

  return (
    <BaseSettingsScreen title="Business Hours">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Business Hours</Text>
          <TouchableOpacity 
            style={[
              styles.saveButton,
              isLoading && styles.saveButtonDisabled
            ]} 
            onPress={handleSave}
            disabled={isLoading}
          >
            <MaterialCommunityIcons name="content-save" size={24} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scheduleContainer}
          contentContainerStyle={styles.scrollContent}
        >
          {DAYS_OF_WEEK.map((day) => (
            <View key={day} style={styles.dayRow}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayText}>{day}</Text>
                <Switch
                  value={schedule[day].isOpen}
                  onValueChange={() => toggleDay(day)}
                  trackColor={{ false: '#767577', true: '#FF5722' }}
                  thumbColor={schedule[day].isOpen ? '#fff' : '#f4f3f4'}
                  disabled={isLoading}
                />
              </View>
              <View style={styles.hoursContainer}>
                <TouchableOpacity 
                  style={styles.timeButton}
                  onPress={() => showTimePicker(day, 'openTime')}
                  disabled={isLoading}
                >
                  <Text style={styles.timeButtonText}>
                    Opens: {schedule[day].openTime}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.timeSeparator}>-</Text>
                <TouchableOpacity 
                  style={styles.timeButton}
                  onPress={() => showTimePicker(day, 'closeTime')}
                  disabled={isLoading}
                >
                  <Text style={styles.timeButtonText}>
                    Closes: {schedule[day].closeTime}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {renderTimePicker()}
      </View>
    </BaseSettingsScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  saveButton: {
    backgroundColor: '#FF5722',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scheduleContainer: {
    flex: 1,
  },
  dayRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  timeButton: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 6,
    flex: 1,
  },
  timeButtonText: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    fontWeight: '500',
  },
  timeSeparator: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  hoursContainerClosed: {
    opacity: 0.5,
  },
  timeButtonDisabled: {
    backgroundColor: '#EEEEEE',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  cancelButton: {
    color: '#666666',
    fontSize: 16,
  },
  doneButton: {
    color: '#FF5722',
    fontSize: 16,
    fontWeight: '600',
  },
  timePicker: {
    height: 200,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
});
