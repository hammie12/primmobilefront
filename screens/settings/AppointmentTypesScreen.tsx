import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BusinessTopBar } from '../../components/BusinessTopBar';
import { BusinessNavigationBar } from '../../components/BusinessNavigationBar';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';

type AppointmentType = {
  id: string;
  name: string;
  duration: string;
  color: string;
  isEnabled: boolean;
};

export const AppointmentTypesScreen = () => {
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([
    {
      id: '1',
      name: 'Standard Appointment',
      duration: '60',
      color: '#FF5722',
      isEnabled: true,
    },
  ]);

  const addAppointmentType = () => {
    const newType: AppointmentType = {
      id: Date.now().toString(),
      name: '',
      duration: '',
      color: '#FF5722',
      isEnabled: true,
    };
    setAppointmentTypes([...appointmentTypes, newType]);
  };

  const updateAppointmentType = (id: string, field: keyof AppointmentType, value: string | boolean) => {
    setAppointmentTypes(types =>
      types.map(type =>
        type.id === id ? { ...type, [field]: value } : type
      )
    );
  };

  const removeAppointmentType = (id: string) => {
    setAppointmentTypes(types => types.filter(type => type.id !== id));
  };

  const handleSave = () => {
    Alert.alert('Success', 'Appointment types saved successfully');
  };

  return (
    <>
      <BusinessTopBar />
      <BaseSettingsScreen>
        <View style={styles.header}>
          <Text style={styles.title}>Appointment Types</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <MaterialCommunityIcons name="content-save" size={24} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        {appointmentTypes.map((type) => (
          <View key={type.id} style={styles.typeCard}>
            <View style={styles.typeHeader}>
              <Text style={styles.typeTitle}>Appointment Type</Text>
              {appointmentTypes.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeAppointmentType(type.id)}
                  style={styles.removeButton}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#FF5722" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={type.name}
                onChangeText={(text) => updateAppointmentType(type.id, 'name', text)}
                placeholder="Enter appointment type name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Duration (minutes)</Text>
              <TextInput
                style={styles.input}
                value={type.duration}
                onChangeText={(text) => updateAppointmentType(type.id, 'duration', text)}
                placeholder="Enter duration"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Enable this type</Text>
              <Switch
                value={type.isEnabled}
                onValueChange={(value) => updateAppointmentType(type.id, 'isEnabled', value)}
                trackColor={{ false: '#767577', true: '#FF5722' }}
                thumbColor={type.isEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={addAppointmentType}>
          <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add New Type</Text>
        </TouchableOpacity>
      </BaseSettingsScreen>
      <BusinessNavigationBar />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  typeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  typeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  removeButton: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  addButton: {
    backgroundColor: '#FF5722',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
});
