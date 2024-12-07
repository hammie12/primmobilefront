import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';
import { BusinessNavigationBar } from '../../components/BusinessNavigationBar';

type Service = {
  id: string;
  name: string;
  duration: string;
  price: string;
};

export const ServicesPricingScreen = () => {
  const [services, setServices] = useState<Service[]>([
    { id: '1', name: '', duration: '', price: '' },
  ]);

  const addService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      name: '',
      duration: '',
      price: '',
    };
    setServices([...services, newService]);
  };

  const removeService = (id: string) => {
    setServices(services.filter(service => service.id !== id));
  };

  const updateService = (id: string, field: keyof Service, value: string) => {
    setServices(services.map(service => 
      service.id === id ? { ...service, [field]: value } : service
    ));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    Alert.alert('Success', 'Services and pricing saved successfully');
  };

  return (
    <>
      <BaseSettingsScreen title="Services & Pricing">
        <ScrollView style={styles.container}>
          {services.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceTitle}>Service Details</Text>
                {services.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeService(service.id)}
                    style={styles.removeButton}
                  >
                    <MaterialCommunityIcons name="close" size={24} color="#FF5722" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Service Name</Text>
                <TextInput
                  style={styles.input}
                  value={service.name}
                  onChangeText={(text) => updateService(service.id, 'name', text)}
                  placeholder="Enter service name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Duration (minutes)</Text>
                <TextInput
                  style={styles.input}
                  value={service.duration}
                  onChangeText={(text) => updateService(service.id, 'duration', text)}
                  placeholder="Enter duration"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Price (£)</Text>
                <TextInput
                  style={styles.input}
                  value={service.price}
                  onChangeText={(text) => updateService(service.id, 'price', text)}
                  placeholder="Enter price"
                  keyboardType="numeric"
                />
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={addService}>
            <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add New Service</Text>
          </TouchableOpacity>
        </ScrollView>
      </BaseSettingsScreen>
      <BusinessNavigationBar />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceTitle: {
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
});
