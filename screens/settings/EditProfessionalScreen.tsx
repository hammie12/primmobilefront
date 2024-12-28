import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Typography } from '../../components/Typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const CATEGORIES = ['Hair', 'Nails', 'Lashes'] as const;
type Category = typeof CATEGORIES[number];

export const EditProfessionalScreen = () => {
  const { user } = useAuth();
  const [businessData, setBusinessData] = useState({
    business_name: '',
    first_name: '',
    last_name: '',
    title: '',
    about: '',
    address: '',
    phone_number: '',
    email: '',
    years_of_experience: '',
    category: '' as Category | '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfessionalData();
  }, []);

  const fetchProfessionalData = async () => {
    try {
      if (!user) return;

      console.log('Fetching professional data for user:', user.id);

      const { data: profile, error } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('Fetched profile:', profile);
      console.log('Fetch error:', error);

      if (error) {
        console.error('Error fetching professional profile:', error);
        Alert.alert('Error', 'Failed to load profile data');
        return;
      }

      if (profile) {
        setBusinessData({
          business_name: profile.business_name || '',
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          title: profile.title || '',
          about: profile.about || '',
          address: '', // Will be fetched from addresses table
          phone_number: profile.phone_number || '',
          email: profile.email || '',
          years_of_experience: profile.years_of_experience?.toString() || '',
          category: profile.category || '',
        });
        setProfileImage(profile.profile_image);

        // Fetch address if exists
        const { data: addressData, error: addressError } = await supabase
          .from('addresses')
          .select('*')
          .eq('professional_id', profile.id)
          .single();

        console.log('Fetched address:', addressData);
        console.log('Address error:', addressError);

        if (!addressError && addressData) {
          setBusinessData(prev => ({
            ...prev,
            address: `${addressData.address_line1}${addressData.address_line2 ? ', ' + addressData.address_line2 : ''}, ${addressData.city}, ${addressData.county}, ${addressData.postcode}`,
          }));
        }
      }
    } catch (error) {
      console.error('Error in fetchProfessionalData:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        // TODO: Upload image to Supabase storage
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    try {
      if (!user) return;

      setIsLoading(true);

      // Get professional profile id first
      const { data: profile, error: profileError } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Update professional profile
      const { error: updateError } = await supabase
        .from('professional_profiles')
        .update({
          business_name: businessData.business_name,
          first_name: businessData.first_name,
          last_name: businessData.last_name,
          title: businessData.title,
          about: businessData.about,
          phone_number: businessData.phone_number,
          email: businessData.email,
          profile_image: profileImage,
          years_of_experience: businessData.years_of_experience ? parseInt(businessData.years_of_experience) : null,
          category: businessData.category || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (updateError) {
        throw updateError;
      }

      // Update or insert address
      const addressComponents = businessData.address.split(',').map(s => s.trim());
      if (addressComponents.length >= 4) {
        const addressData = {
          address_line1: addressComponents[0],
          address_line2: addressComponents.length > 4 ? addressComponents[1] : null,
          city: addressComponents[addressComponents.length - 3],
          county: addressComponents[addressComponents.length - 2],
          postcode: addressComponents[addressComponents.length - 1],
          professional_id: profile.id,
          updated_at: new Date().toISOString(),
        };

        const { error: addressError } = await supabase
          .from('addresses')
          .upsert(addressData, {
            onConflict: 'professional_id',
          });

        if (addressError) {
          throw addressError;
        }
      }

      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ label, value, onChangeText, placeholder, multiline = false }) => (
    <View style={styles.inputContainer}>
      <Typography variant="body2" style={styles.label}>{label}</Typography>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        placeholderTextColor="#999"
      />
    </View>
  );

  return (
    <BaseSettingsScreen 
      title="Edit Business Profile"
      onSave={handleSave}
      isLoading={isLoading}
    >
      <ScrollView style={styles.content}>
        {/* Profile Image Section */}
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={handleImagePick} style={styles.imageWrapper}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons name="camera" size={32} color="#666" />
                <Typography variant="body2" style={styles.uploadText}>
                  Upload Photo
                </Typography>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Business Information Form */}
        <View style={styles.form}>
          <InputField
            label="Business Name"
            value={businessData.business_name}
            onChangeText={(text) => setBusinessData({ ...businessData, business_name: text })}
            placeholder="Enter business name"
          />

          <InputField
            label="Professional Title"
            value={businessData.title}
            onChangeText={(text) => setBusinessData({ ...businessData, title: text })}
            placeholder="Enter your professional title"
          />

          <View style={styles.inputContainer}>
            <Typography variant="body2" style={styles.label}>Category</Typography>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={businessData.category}
                onValueChange={(value) => setBusinessData({ ...businessData, category: value })}
                style={styles.picker}
              >
                <Picker.Item label="Select a category" value="" />
                {CATEGORIES.map((category) => (
                  <Picker.Item key={category} label={category} value={category} />
                ))}
              </Picker>
            </View>
          </View>

          <InputField
            label="First Name"
            value={businessData.first_name}
            onChangeText={(text) => setBusinessData({ ...businessData, first_name: text })}
            placeholder="Enter first name"
          />

          <InputField
            label="Last Name"
            value={businessData.last_name}
            onChangeText={(text) => setBusinessData({ ...businessData, last_name: text })}
            placeholder="Enter last name"
          />

          <InputField
            label="About"
            value={businessData.about}
            onChangeText={(text) => setBusinessData({ ...businessData, about: text })}
            placeholder="Describe your business"
            multiline
          />

          <InputField
            label="Address"
            value={businessData.address}
            onChangeText={(text) => setBusinessData({ ...businessData, address: text })}
            placeholder="Enter business address"
            multiline
          />

          <InputField
            label="Phone Number"
            value={businessData.phone_number}
            onChangeText={(text) => setBusinessData({ ...businessData, phone_number: text })}
            placeholder="Enter phone number"
          />

          <InputField
            label="Email"
            value={businessData.email}
            onChangeText={(text) => setBusinessData({ ...businessData, email: text })}
            placeholder="Enter business email"
          />

          <InputField
            label="Years of Experience"
            value={businessData.years_of_experience}
            onChangeText={(text) => setBusinessData({ ...businessData, years_of_experience: text })}
            placeholder="Enter years of experience"
          />
        </View>
      </ScrollView>
    </BaseSettingsScreen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    color: '#666',
    marginTop: 4,
  },
  form: {
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F8F8F8',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
});
