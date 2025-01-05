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
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { supabase } from '../../supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Database } from '../../lib/supabase/schema';

type WorkingHoursRow = Database['public']['Tables']['working_hours']['Row'];
type WorkingHoursInsert = Database['public']['Tables']['working_hours']['Insert'];

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
  'Sunday',
];

// 1-based in DB: Monday=1 -> index=0, Sunday=7->index=6
const toDayIndex = (dayOfWeek: number) => dayOfWeek - 1;
const toDayNumber = (index: number) => index + 1;

const DayRow = ({ day, schedule, toggleDay, showTimePicker, isLoading }: {
  day: string;
  schedule: WeekSchedule;
  toggleDay: (day: string) => void;
  showTimePicker: (day: string, timeType: 'openTime' | 'closeTime') => void;
  isLoading: boolean;
}) => (
  <View key={day} style={styles.dayRow}>
    <View style={styles.dayHeader}>
      <Text style={styles.dayText}>{day}</Text>
      <View style={styles.statusContainer}>
        <Text style={[
          styles.statusText,
          schedule[day].isOpen ? styles.openText : styles.closedText
        ]}>
          {schedule[day].isOpen ? 'Open' : 'Closed'}
        </Text>
        <Switch
          value={schedule[day].isOpen}
          onValueChange={() => toggleDay(day)}
          trackColor={{ false: '#767577', true: '#4CAF50' }}
          thumbColor={schedule[day].isOpen ? '#fff' : '#f4f3f4'}
          disabled={isLoading}
        />
      </View>
    </View>
    <View style={styles.timesRow}>
      <TouchableOpacity
        style={[styles.timeButton, !schedule[day].isOpen && styles.disabledButton]}
        disabled={isLoading || !schedule[day].isOpen}
        onPress={() => showTimePicker(day, 'openTime')}
      >
        <Text style={styles.timeButtonText}>
          Opens: {schedule[day].openTime}
        </Text>
      </TouchableOpacity>
      <Text style={styles.separator}>-</Text>
      <TouchableOpacity
        style={[styles.timeButton, !schedule[day].isOpen && styles.disabledButton]}
        disabled={isLoading || !schedule[day].isOpen}
        onPress={() => showTimePicker(day, 'closeTime')}
      >
        <Text style={styles.timeButtonText}>
          Closes: {schedule[day].closeTime}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

export const BusinessHoursScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const [schedule, setSchedule] = useState<WeekSchedule>({
    Monday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
    Tuesday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
    Wednesday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
    Thursday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
    Friday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
    Saturday: { isOpen: false, openTime: '10:00', closeTime: '16:00' },
    Sunday: { isOpen: false, openTime: '10:00', closeTime: '16:00' },
  });

  // Must reference "professional_profiles.id"
  const [professionalProfileId, setProfessionalProfileId] = useState<string | null>(null);

  const [showPicker, setShowPicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTimeType, setSelectedTimeType] = useState<'openTime' | 'closeTime'>('openTime');
  const [tempTime, setTempTime] = useState(new Date());

  useEffect(() => {
    if (user?.id) {
      fetchProfileAndWorkingHours(user.id);
    }
  }, [user]);

  const fetchProfileAndWorkingHours = async (userId: string) => {
    try {
      setIsLoading(true);

      // First check if professional exists
      const { data: professional, error: professionalError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (professionalError || !professional) {
        // If professional doesn't exist, create one with required fields
        const { data: newProfessional, error: createError } = await supabase
          .from('professionals')
          .insert([{ 
            user_id: userId,
            name: 'New Professional', // Add default name
            status: 'active'  // Add status if required
          }])
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating professional:', createError);
          Alert.alert('Error', 'Failed to create professional profile');
          setIsLoading(false);
          return;
        }
        setProfessionalProfileId(newProfessional.id);
        // No working hours yet for new professional, so return
        setIsLoading(false);
        return;
      }

      setProfessionalProfileId(professional.id);

      // Now fetch existing rows from working_hours
      const { data: workingHours, error: whError } = await supabase
        .from('working_hours')
        .select('*')
        .eq('professional_id', professional.id);

      if (whError) {
        throw whError;
      }

      if (!workingHours || workingHours.length === 0) {
        // None found => keep default
        setIsLoading(false);
        return;
      }

      // Convert working_hours rows into our schedule
      const loadedSchedule: WeekSchedule = { ...schedule };
      workingHours.forEach((wh: WorkingHoursRow) => {
        const index = toDayIndex(wh.day_of_week);
        const dayName = DAYS_OF_WEEK[index];
        if (!dayName) return;
        loadedSchedule[dayName] = {
          isOpen: !!wh.is_open,
          openTime: wh.start_time ?? '09:00',
          closeTime: wh.end_time ?? '17:00',
        };
      });
      setSchedule(loadedSchedule);
    } catch (error: any) {
      console.error('Error fetching working hours:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to load business hours. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!professionalProfileId) {
      Alert.alert('Error', 'No professional profile ID found. Please create one.');
      return;
    }

    try {
      setIsLoading(true);

      // Validate open/close times
      for (const day of DAYS_OF_WEEK) {
        const { openTime, closeTime, isOpen } = schedule[day];
        if (isOpen) {
          if (timeToMinutes(closeTime) <= timeToMinutes(openTime)) {
            throw new Error(
              `Invalid hours for ${day}: closeTime must be after openTime`
            );
          }
        }
      }

      // Build array for upsert
      const rowsToUpsert: WorkingHoursInsert[] = DAYS_OF_WEEK.map((day, idx) => {
        const { isOpen, openTime, closeTime } = schedule[day];
        return {
          professional_id: professionalProfileId,
          day_of_week: toDayNumber(idx),
          is_open: isOpen,
          start_time: openTime,
          end_time: closeTime,
        };
      });

      // Upsert with unique constraint on (professional_id, day_of_week)
      const { data: upsertData, error: upsertError } = await supabase
        .from('working_hours')
        .upsert(rowsToUpsert, { onConflict: 'professional_id,day_of_week' })
        .select();

      if (upsertError) {
        console.error('Upsert error:', upsertError);
        throw upsertError;
      }

      console.log('Upserted rows:', upsertData);
      Alert.alert('Success', 'Business hours saved successfully');

      // (Optional) Re-fetch to see updated data
      await fetchProfileAndWorkingHours(user?.id as string);

      // (Optional) Or navigate back
      // navigation.goBack();
    } catch (error: any) {
      console.error('Error saving working hours:', error);
      Alert.alert('Error', error.message || 'Failed to save business hours');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], isOpen: !prev[day].isOpen },
    }));
  };

  const showTimePicker = (day: string, timeType: 'openTime' | 'closeTime') => {
    const [hours, minutes] = schedule[day][timeType].split(':').map(Number);
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
    if (!selectedDay || !date) return;

    if (event.type === 'set') {
      const hh = String(date.getHours()).padStart(2, '0');
      const mm = String(date.getMinutes()).padStart(2, '0');
      const newTime = `${hh}:${mm}`;

      setSchedule(prev => ({
        ...prev,
        [selectedDay]: {
          ...prev[selectedDay],
          [selectedTimeType]: newTime,
        },
      }));
    }
  };

  // Convert "HH:mm" to total minutes
  const timeToMinutes = (time: string): number => {
    const [hh, mm] = time.split(':').map(Number);
    return hh * 60 + mm;
  };

  const renderTimePicker = () => {
    if (!showPicker) return null;

    if (Platform.OS === 'ios') {
      return (
        <Modal transparent visible={showPicker} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    handleTimeChange({ type: 'set' } as DateTimePickerEvent, tempTime);
                    setShowPicker(false);
                  }}
                >
                  <Text style={styles.doneButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempTime}
                mode="time"
                is24Hour
                display="spinner"
                onChange={(evt, d) => d && setTempTime(d)}
                style={styles.timePicker}
                textColor="black"
                themeVariant="light"
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
        is24Hour
        display="default"
        onChange={handleTimeChange}
      />
    );
  };

  return (
    <BaseSettingsScreen title="Business Hours">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Business Hours</Text>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <MaterialCommunityIcons name="content-save" size={24} color="#FFF" />
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          {DAYS_OF_WEEK.map(day => (
            <DayRow
              key={day}
              day={day}
              schedule={schedule}
              toggleDay={toggleDay}
              showTimePicker={showTimePicker}
              isLoading={isLoading}
            />
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
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#FF5722',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFF',
    marginLeft: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  dayRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  timesRow: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    gap: 10,
  },
  timeButton: {
    flex: 1,
    backgroundColor: '#EAEAEA',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  disabledButton: {
    opacity: 0.7,
    backgroundColor: '#F5F5F5',
  },
  timeButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  separator: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
  },
  cancelButton: {
    color: '#666',
    fontSize: 16,
  },
  doneButton: {
    color: '#FF5722',
    fontSize: 16,
    fontWeight: '600',
  },
  timePicker: {
    backgroundColor: '#FFF',
    height: 200,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  openText: {
    color: '#4CAF50',
  },
  closedText: {
    color: '#FF5722',
  },
  depositContainer: {
    padding: 16,
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
  },
  depositLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  depositInput: {
    backgroundColor: '#EAEAEA',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DDD',
    fontSize: 16,
  },
});
