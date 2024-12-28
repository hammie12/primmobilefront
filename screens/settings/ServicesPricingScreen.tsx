import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Typography } from '../../components/Typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';

type Service = {
  id?: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  deposit_price: number;
  category: string;
  professional_id: string;
  images: string[];
};

export const ServicesPricingScreen = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    category: '',
  });

  useEffect(() => {
    fetchServices();
  }, [user]);

  const fetchServices = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('professional_id', user.id)
        .order('name');

      if (error) throw error;

      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      Alert.alert('Error', 'Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveService = async (serviceData: Partial<Service>) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save services');
      return;
    }

    try {
      // Get the professional's profile ID
      const { data: profile, error: profileError } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error getting professional profile:', profileError);
        throw profileError;
      }

      if (!profile) {
        throw new Error('Professional profile not found');
      }

      const service = {
        ...serviceData,
        professional_id: profile.id,
        price: parseFloat(serviceData.price?.toString() || '0'),
        deposit_price: parseFloat(serviceData.deposit_price?.toString() || '0'),
      };

      let result;
      if (editingService?.id) {
        // Update existing service
        result = await supabase
          .from('services')
          .update(service)
          .eq('id', editingService.id)
          .select()
          .single();
      } else {
        // Create new service
        result = await supabase
          .from('services')
          .insert([service])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      await fetchServices();
      setIsAddingService(false);
      setEditingService(null);
      Alert.alert('Success', `Service ${editingService ? 'updated' : 'added'} successfully`);
    } catch (error) {
      console.error('Error saving service:', error);
      Alert.alert('Error', 'Failed to save service');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      await fetchServices();
      Alert.alert('Success', 'Service deleted successfully');
    } catch (error) {
      console.error('Error deleting service:', error);
      Alert.alert('Error', 'Failed to delete service');
    }
  };

  const handleImageUpload = async (serviceId: string) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
        const filePath = `services/${serviceId}/${Date.now()}.${fileExt}`;

        const response = await fetch(imageUri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('service-images')
          .upload(filePath, blob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('service-images')
          .getPublicUrl(filePath);

        // Update service with new image
        const service = services.find(s => s.id === serviceId);
        if (service) {
          const updatedImages = [...(service.images || []), publicUrl];
          await supabase
            .from('services')
            .update({ images: updatedImages })
            .eq('id', serviceId);

          await fetchServices();
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const renderServiceCard = (service: Service) => (
    <View key={service.id} style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View>
          <Typography variant="h3" style={styles.serviceName}>{service.name}</Typography>
          <Typography variant="body2" style={styles.servicePrice}>£{service.price}</Typography>
        </View>
        <View style={styles.serviceActions}>
          <TouchableOpacity onPress={() => setEditingService(service)}>
            <MaterialCommunityIcons name="pencil" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteService(service.id!)}>
            <MaterialCommunityIcons name="delete" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <Typography variant="body2" style={styles.serviceDescription}>
        {service.description}
      </Typography>

      <View style={styles.serviceDetails}>
        <View style={styles.serviceDetail}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
          <Typography variant="body2" style={styles.serviceDetailText}>
            {service.duration} mins
          </Typography>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
        {service.images?.map((image, index) => (
          <Image key={index} source={{ uri: image }} style={styles.serviceImage} />
        ))}
        <TouchableOpacity
          style={styles.addImageButton}
          onPress={() => handleImageUpload(service.id!)}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#666" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Existing Services */}
        {services.map(service => renderServiceCard(service))}

        {/* Add New Service Form */}
        {isAddingService ? (
          <View style={styles.addServiceForm}>
            <TextInput
              style={styles.input}
              placeholder="Service Name"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Description (optional)"
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Duration (minutes)"
              value={formData.duration}
              onChangeText={(text) => setFormData(prev => ({ ...prev, duration: text }))}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              value={formData.price}
              onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
              keyboardType="numeric"
            />
            <View style={styles.formButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => {
                  setIsAddingService(false);
                  setFormData({
                    name: '',
                    description: '',
                    duration: '',
                    price: '',
                    category: '',
                  });
                }}
              >
                <Typography variant="button" style={styles.cancelButtonText}>
                  Cancel
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.addButton]} 
                onPress={() => handleSaveService({
                  name: formData.name,
                  description: formData.description,
                  duration: parseInt(formData.duration, 10),
                  price: parseFloat(formData.price),
                  category: formData.category,
                })}
              >
                <Typography variant="button" style={styles.addButtonText}>
                  Add Service
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.addServiceButton} 
            onPress={() => setIsAddingService(true)}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#FF5722" />
            <Typography variant="button" style={styles.addServiceText}>
              Add New Service
            </Typography>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  servicePrice: {
    fontSize: 16,
    color: '#FF5722',
    fontWeight: '600',
    marginTop: 4,
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  serviceDescription: {
    color: '#666',
    marginBottom: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  serviceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceDetailText: {
    color: '#666',
  },
  imageScroll: {
    marginTop: 8,
  },
  serviceImage: {
    width: 100,
    height: 75,
    borderRadius: 8,
    marginRight: 8,
  },
  addImageButton: {
    width: 100,
    height: 75,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFF5F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF5722',
    borderStyle: 'dashed',
  },
  addServiceText: {
    color: '#FF5722',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  addServiceForm: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    color: '#666',
  },
  addButton: {
    backgroundColor: '#FF5722',
  },
  addButtonText: {
    color: '#FFFFFF',
  },
});
