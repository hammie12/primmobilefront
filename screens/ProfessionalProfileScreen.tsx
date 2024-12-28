import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Image,
  Modal,
  TextInput,
  Alert,
  Platform,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { BusinessTopBar } from '../components/BusinessTopBar';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { Picker } from '@react-native-picker/picker';

const HEADER_HEIGHT = 150;
const AVATAR_SIZE = 100;

// Define the navigation type
type RootStackParamList = {
  BusinessHours: undefined;
  // Add other screen types as needed
};

type NavigationType = NavigationProp<RootStackParamList>;

// Define default business hours
const DEFAULT_BUSINESS_HOURS = {
  Monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  Tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  Wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  Thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  Friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  Saturday: { isOpen: false, openTime: '10:00', closeTime: '16:00' },
  Sunday: { isOpen: false, openTime: '10:00', closeTime: '16:00' }
};

// Add this constant to ensure consistent day order
const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

// Define the service categories enum to match your database
const SERVICE_CATEGORIES = {
  HAIR: 'HAIR',
  NAILS: 'NAILS',
  LASHES: 'LASHES'
} as const;

type ServiceCategory = typeof SERVICE_CATEGORIES[keyof typeof SERVICE_CATEGORIES];

type Service = {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  deposit_price: number;
  category: ServiceCategory;
  images: string[];
};

// First, add this new type near the top of the file
type CategoryOption = {
  label: string;
  value: ServiceCategory | '';
};

// Add this constant for the category options
const CATEGORY_OPTIONS: CategoryOption[] = [
  { label: 'Hair', value: SERVICE_CATEGORIES.HAIR },
  { label: 'Nails', value: SERVICE_CATEGORIES.NAILS },
  { label: 'Lashes', value: SERVICE_CATEGORIES.LASHES },
];

export const ProfessionalProfileScreen = () => {
  const navigation = useNavigation<NavigationType>();
  const { user, session } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    bannerImage: null as string | null,
    profileImage: null as string | null,
    name: '',
    title: '',
    businessName: '',
    category: '',
    about: '',
    address: {
      postcode: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      county: '',
    },
    phone: '',
    email: '',
    website: '',
    rating: 0,
    reviewCount: 0,
    services: [] as Service[],
    businessHours: DEFAULT_BUSINESS_HOURS
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingService, setIsEditingService] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Add state for postcode lookup
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);

  useEffect(() => {
    fetchProfileData();
  }, [user, session]);

  // Add useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchProfileData();
    }, [user, session])
  );

  const fetchProfileData = async () => {
    if (!user || !session) return;

    try {
      setIsLoading(true);
      
      const metadata = session.user.user_metadata;
      
      const { data: profile, error } = await supabase
        .from('professionals')
        .select('*, business_hours')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Log the fetched address to verify structure
      console.log('Fetched address:', profile?.address);

      let parsedAddress = profile?.address;
      // If address is stored as a string, parse it
      if (typeof profile?.address === 'string') {
        try {
          parsedAddress = JSON.parse(profile.address);
        } catch (e) {
          console.error('Error parsing address:', e);
          parsedAddress = null;
        }
      }

      setProfileData(prev => ({
        ...prev,
        name: `${metadata.first_name} ${metadata.last_name}`,
        businessName: metadata.business_name,
        title: profile?.title || '',
        category: profile?.category || '',
        about: profile?.about || '',
        address: {
          postcode: parsedAddress?.postcode || '',
          address_line_1: parsedAddress?.address_line_1 || '',
          address_line_2: parsedAddress?.address_line_2 || '',
          city: parsedAddress?.city || '',
          county: parsedAddress?.county || ''
        },
        phone: profile?.phone || '',
        email: profile?.email || '',
        website: profile?.website || '',
        rating: profile?.rating || 0,
        reviewCount: profile?.review_count || 0,
        bannerImage: profile?.banner_image || null,
        profileImage: profile?.profile_image || null,
        businessHours: profile?.business_hours || DEFAULT_BUSINESS_HOURS,
        services: []
      }));

      // Fetch services if profile exists
      if (profile) {
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('professional_id', profile.id);

        if (servicesError) throw servicesError;

        if (services) {
          setProfileData(prev => ({
            ...prev,
            services: services
          }));
        }
      }

    } catch (error) {
      console.error('Error in fetchProfileData:', error);
      Alert.alert('Error', 'An unexpected error occurred while loading profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !session) {
      Alert.alert('Error', 'You must be logged in to save profile changes');
      return;
    }

    try {
      // Log the address data before saving to verify structure
      console.log('Address being saved:', profileData.address);

      const updatedProfile = {
        user_id: user.id,
        name: `${session.user.user_metadata.first_name} ${session.user.user_metadata.last_name}`,
        title: profileData.title || '',
        category: profileData.category || '',
        business_name: session.user.user_metadata.business_name || '',
        about: profileData.about || '',
        // Ensure address is properly structured as JSONB for Supabase
        address: JSON.stringify({
          postcode: profileData.address.postcode,
          address_line_1: profileData.address.address_line_1,
          address_line_2: profileData.address.address_line_2,
          city: profileData.address.city,
          county: profileData.address.county
        }),
        phone: profileData.phone || '',
        email: profileData.email || '',
        website: profileData.website || '',
        profile_image: profileData.profileImage,
        banner_image: profileData.bannerImage,
        business_hours: profileData.businessHours,
      };

      const { data: existingProfile, error: checkError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      const result = await supabase
        .from('professionals')
        [existingProfile ? 'update' : 'insert'](updatedProfile)
        .eq(existingProfile ? 'user_id' : '', existingProfile ? user.id : '')
        .select();

      if (result.error) throw result.error;

      Alert.alert('Success', 'Profile updated successfully');
      setIsEditingProfile(false);
      fetchProfileData();
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile changes. Please try again.');
    }
  };

  const handleImagePick = async (type: 'banner' | 'profile') => {
    try {
      // Request permissions first
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      // Launch image picker with correct configuration
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: type === 'banner' ? [16, 9] : [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        try {
          const fileExtension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
          const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
          const filePath = `${user?.id}/${type}-${Date.now()}.${fileExtension}`;

          const response = await fetch(imageUri);
          const arrayBuffer = await response.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);

          // Use 'profile-images' bucket for profile and banner images
          const { data, error: uploadError } = await supabase.storage
            .from('profile-images')  // Always use profile-images bucket for profile/banner
            .upload(filePath, uint8Array, {
              contentType: mimeType,
              upsert: true
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('profile-images')  // Always use profile-images bucket for profile/banner
            .getPublicUrl(filePath);

          setProfileData(prev => ({
            ...prev,
            [type === 'banner' ? 'bannerImage' : 'profileImage']: publicUrl,
          }));

        } catch (error) {
          console.error('Upload error:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error picking/uploading image:', error);
      Alert.alert('Error', 'Failed to pick or upload image');
    }
  };

  const handleAddService = () => {
    setSelectedService(null);
    setIsEditingService(true);
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setIsEditingService(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      setProfileData(prev => ({
        ...prev,
        services: prev.services.filter(s => s.id !== serviceId),
      }));

      Alert.alert('Success', 'Service deleted successfully');
    } catch (error) {
      console.error('Error deleting service:', error);
      Alert.alert('Error', 'Failed to delete service');
    }
  };

  const handleSaveService = async (serviceData) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Get the professional's profile ID
      const { data: profile, error: profileError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Could not get professional profile ID');
      }

      const service = {
        ...serviceData,
        professional_id: profile.id,
        price: parseFloat(serviceData.price?.toString() || '0'),
        deposit_price: parseFloat(serviceData.deposit_price?.toString() || '0'),
      };

      let result;
      if (selectedService?.id) {
        // Update existing service
        result = await supabase
          .from('services')
          .update(service)
          .eq('id', selectedService.id)
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

      setProfileData(prev => ({
        ...prev,
        services: selectedService?.id
          ? prev.services.map(s => s.id === selectedService.id ? result.data : s)
          : [...prev.services, result.data],
      }));

      setIsEditingService(false);
      Alert.alert('Success', `Service ${selectedService ? 'updated' : 'added'} successfully`);
    } catch (error) {
      console.error('Error saving service:', error);
      Alert.alert('Error', 'Failed to save service');
    }
  };

  const renderServiceCard = (service) => (
    <View key={service.id} style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceCategory}>{service.category}</Text>
        </View>
        <View style={styles.serviceActions}>
          <TouchableOpacity onPress={() => handleEditService(service)}>
            <MaterialCommunityIcons name="pencil" size={24} color="#666666" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteService(service.id)}>
            <MaterialCommunityIcons name="delete" size={24} color="#666666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Service Images */}
      {service.images && service.images.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.serviceImagesContainer}
        >
          {service.images.map((image, index) => (
            <Image 
              key={index}
              source={{ uri: image }} 
              style={styles.serviceCardImage} 
            />
          ))}
        </ScrollView>
      )}

      <Text style={styles.serviceDescription}>{service.description}</Text>
      <View style={styles.serviceDetails}>
        <View style={styles.serviceDetail}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#666666" />
          <Text style={styles.serviceDetailText}>{service.duration} mins</Text>
        </View>
        <View style={styles.serviceDetail}>
          <MaterialCommunityIcons name="credit-card-outline" size={16} color="#666666" />
          <Text style={styles.serviceDetailText}>Deposit: £{service.price}</Text>
        </View>
      </View>
    </View>
  );

  const renderProfileInfo = () => {
    if (!session?.user.user_metadata) return null;
    const metadata = session.user.user_metadata;
    
    return (
      <View style={styles.profileHeader}>
        <View>
          <Text style={styles.businessName}>{`${metadata.first_name} ${metadata.last_name} @ ${metadata.business_name}`}</Text>
          <Text style={styles.category}>{profileData.category || 'Category not set'}</Text>
          <Text style={styles.title}>{profileData.title}</Text>
          
          {/* Add contact information section */}
          <View style={styles.contactInfo}>
            {profileData.address && (
              <View style={styles.contactItem}>
                <MaterialCommunityIcons name="map-marker" size={16} color="#666666" />
                <Text style={[styles.contactText, styles.addressText]}>
                  {[
                    profileData.address.address_line_1,
                    profileData.address.address_line_2,
                    profileData.address.city,
                    profileData.address.county,
                    profileData.address.postcode
                  ].filter(Boolean).join('\n')}
                </Text>
              </View>
            )}
            
            {profileData.phone && (
              <View style={styles.contactItem}>
                <MaterialCommunityIcons name="phone" size={16} color="#666666" />
                <Text style={styles.contactText}>{profileData.phone}</Text>
              </View>
            )}
            
            {profileData.email && (
              <View style={styles.contactItem}>
                <MaterialCommunityIcons name="email" size={16} color="#666666" />
                <Text style={styles.contactText}>{profileData.email}</Text>
              </View>
            )}
            
            {profileData.website && (
              <View style={styles.contactItem}>
                <MaterialCommunityIcons name="web" size={16} color="#666666" />
                <Text style={styles.contactText}>{profileData.website}</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={() => setIsEditingProfile(true)}>
          <MaterialCommunityIcons name="pencil" size={24} color="#FF5722" />
        </TouchableOpacity>
      </View>
    );
  };

  // Update the business hours section to show loading state if needed
  const renderBusinessHours = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Business Hours</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('BusinessHours')}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="#FF5722" />
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <Text style={styles.loadingText}>Loading business hours...</Text>
      ) : (
        DAYS_OF_WEEK.map((day) => {
          const hours = profileData.businessHours[day];
          return (
            <View key={day} style={styles.hourRow}>
              <Text style={styles.dayText}>{day}</Text>
              <Text style={styles.hoursText}>
                {hours.isOpen ? `${hours.openTime} - ${hours.closeTime}` : 'Closed'}
              </Text>
            </View>
          );
        })
      )}
    </View>
  );

  const renderEditForm = () => (
    <View style={styles.editForm}>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Name</Text>
        <TextInput
          style={styles.input}
          value={profileData.name}
          onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
          placeholder="Your Name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Professional Title</Text>
        <TextInput
          style={styles.input}
          value={profileData.title}
          onChangeText={(text) => setProfileData(prev => ({ ...prev, title: text }))}
          placeholder="Professional Title"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Address</Text>
        <View style={styles.addressFields}>
          <View style={styles.postcodeSearchContainer}>
            <TextInput
              style={[styles.input, styles.postcodeInput]}
              value={profileData.address.postcode}
              onChangeText={(text) => {
                const upperText = text.toUpperCase();
                setProfileData(prev => ({
                  ...prev,
                  address: { ...prev.address, postcode: upperText }
                }));
                if (upperText.length >= 3) {
                  handlePostcodeLookup(upperText);
                }
              }}
              placeholder="Enter Postcode"
              autoCapitalize="characters"
            />
            {isSearchingAddress && (
              <ActivityIndicator style={styles.searchingIndicator} />
            )}
          </View>
          
          {addressSuggestions.length > 0 && (
            <ScrollView style={styles.suggestionsContainer}>
              {addressSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => handleAddressSelect(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <TextInput
            style={styles.input}
            value={profileData.address.address_line_1}
            onChangeText={(text) => setProfileData(prev => ({
              ...prev,
              address: { ...prev.address, address_line_1: text }
            }))}
            placeholder="Address Line 1"
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            value={profileData.address.address_line_2}
            onChangeText={(text) => setProfileData(prev => ({
              ...prev,
              address: { ...prev.address, address_line_2: text }
            }))}
            placeholder="Address Line 2 (Optional)"
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            value={profileData.address.city}
            placeholder="City"
            editable={false}
          />

          <TextInput
            style={styles.input}
            value={profileData.address.county}
            placeholder="County"
            editable={false}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Phone</Text>
        <TextInput
          style={styles.input}
          value={profileData.phone}
          onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
          placeholder="Phone Number"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          value={profileData.email}
          onChangeText={(text) => setProfileData(prev => ({ ...prev, email: text }))}
          placeholder="Business Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Website</Text>
        <TextInput
          style={styles.input}
          value={profileData.website}
          onChangeText={(text) => setProfileData(prev => ({ ...prev, website: text }))}
          placeholder="Website URL"
          keyboardType="url"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Category</Text>
        <View style={styles.categoryButtonsContainer}>
          {CATEGORY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.categoryButton,
                profileData.category === option.value && styles.categoryButtonSelected
              ]}
              onPress={() => setProfileData(prev => ({ ...prev, category: option.value }))}
            >
              <Text style={[
                styles.categoryButtonText,
                profileData.category === option.value && styles.categoryButtonTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>About</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={profileData.about}
          onChangeText={(text) => setProfileData(prev => ({ ...prev, about: text }))}
          placeholder="About"
          multiline
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );

  // Update the handlePostcodeLookup function to fetch and set city
  const handlePostcodeLookup = async (postcode: string) => {
    try {
      setIsSearchingAddress(true);
      // First get the full postcode details
      const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
      const data = await response.json();
      
      if (data.result) {
        // Update the address with the city (post_town)
        setProfileData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            city: data.result.post_town || '',
            county: data.result.admin_district || '',
            postcode: data.result.postcode
          }
        }));
        setAddressSuggestions([]);
      } else {
        // If no exact match, try autocomplete
        const autocompleteResponse = await fetch(`https://api.postcodes.io/postcodes/${postcode}/autocomplete`);
        const autocompleteData = await autocompleteResponse.json();
        
        if (autocompleteData.result) {
          setAddressSuggestions(autocompleteData.result);
        }
      }
    } catch (error) {
      console.error('Error looking up postcode:', error);
      Alert.alert('Error', 'Failed to look up postcode');
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // Update the handleAddressSelect function
  const handleAddressSelect = async (selectedPostcode: string) => {
    try {
      const response = await fetch(`https://api.postcodes.io/postcodes/${selectedPostcode}`);
      const data = await response.json();
      
      if (data.result) {
        setProfileData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            city: data.result.post_town || '',
            county: data.result.admin_district || '',
            postcode: data.result.postcode
          }
        }));
        setAddressSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching address details:', error);
      Alert.alert('Error', 'Failed to fetch address details');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <BusinessTopBar />
      <ScrollView style={styles.scrollView}>
        {/* Banner */}
        <TouchableOpacity onPress={() => handleImagePick('banner')} style={styles.bannerContainer}>
          {profileData.bannerImage ? (
            <Image source={{ uri: profileData.bannerImage }} style={styles.bannerImage} />
          ) : (
            <LinearGradient colors={['#FF5722', '#FF8A65']} style={styles.bannerPlaceholder}>
              <MaterialCommunityIcons name="image-plus" size={32} color="#FFFFFF" />
            </LinearGradient>
          )}
        </TouchableOpacity>

        {/* Profile Image */}
        <TouchableOpacity onPress={() => handleImagePick('profile')} style={styles.profileImageContainer}>
          {profileData.profileImage ? (
            <Image source={{ uri: profileData.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <MaterialCommunityIcons name="camera" size={32} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          {isEditingProfile ? (
            renderEditForm()
          ) : (
            <>
              {renderProfileInfo()}
              <View style={styles.stats}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{profileData.rating.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{profileData.reviewCount}</Text>
                  <Text style={styles.statLabel}>Reviews</Text>
                </View>
              </View>
              <Text style={styles.about}>{profileData.about}</Text>
            </>
          )}
        </View>

        {/* Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Services</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddService}>
              <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Service</Text>
            </TouchableOpacity>
          </View>
          {profileData.services.map(renderServiceCard)}
        </View>

        {/* Business Hours */}
        {renderBusinessHours()}
      </ScrollView>

      {/* Service Edit Modal */}
      <Modal
        visible={isEditingService}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditingService(false)}
      >
        <ServiceEditModal
          service={selectedService}
          onSave={handleSaveService}
          onClose={() => setIsEditingService(false)}
        />
      </Modal>
    </SafeAreaView>
  );
};

const ServiceEditModal = ({ service, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    duration: service?.duration || '',
    deposit_price: service?.price?.toString() || '',
    category: service?.category || '',
    images: service?.images || [],
  });

  const handleImagePick = async () => {
    if (formData.images.length >= 6) {
      Alert.alert('Limit Reached', 'You can only add up to 6 images per service');
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        try {
          // Get file extension and mime type
          const fileExtension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
          const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
          const filePath = `service-images/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

          // Read the file as an array buffer
          const response = await fetch(imageUri);
          const arrayBuffer = await response.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);

          // Upload to Supabase Storage
          const { data, error: uploadError } = await supabase.storage
            .from('profile-images')
            .upload(filePath, uint8Array, {
              contentType: mimeType,
              upsert: true
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw uploadError;
          }

          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('profile-images')
            .getPublicUrl(filePath);

          // Update form data with new image URL
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, publicUrl],
          }));

        } catch (uploadError) {
          console.error('Error during upload process:', uploadError);
          Alert.alert(
            'Upload Error',
            'Failed to upload image. Please try again.'
          );
        }
      }
    } catch (error) {
      console.error('Error picking/uploading image:', error);
      Alert.alert('Error', 'Failed to pick or upload image');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Service name is required');
      return;
    }

    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    onSave({
      ...formData,
      price: parseFloat(formData.deposit_price) || 0,
      deposit_price: undefined,
    });
  };

  return (
    <View style={styles.modalContainer}>
      <ScrollView style={styles.modalContent}>
        <Text style={styles.modalTitle}>
          {service ? 'Edit Service' : 'Add Service'}
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Service Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholder="Service Name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Category</Text>
          <View style={styles.categoryButtonsContainer}>
            {CATEGORY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.categoryButton,
                  formData.category === option.value && styles.categoryButtonSelected
                ]}
                onPress={() => setFormData(prev => ({ ...prev, category: option.value }))}
              >
                <Text style={[
                  styles.categoryButtonText,
                  formData.category === option.value && styles.categoryButtonTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Description"
            multiline
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Duration (in minutes)</Text>
          <TextInput
            style={styles.input}
            value={formData.duration}
            onChangeText={(text) => setFormData(prev => ({ ...prev, duration: text }))}
            placeholder="e.g., 60"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Deposit Price</Text>
          <TextInput
            style={styles.input}
            value={formData.deposit_price}
            onChangeText={(text) => setFormData(prev => ({ ...prev, deposit_price: text }))}
            placeholder="Deposit Price"
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.imagesContainer}>
          <Text style={styles.imagesTitle}>Service Images (Max 6)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {formData.images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.serviceImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <MaterialCommunityIcons name="close" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
            {formData.images.length < 6 && (
              <TouchableOpacity style={styles.addImageButton} onPress={handleImagePick}>
                <MaterialCommunityIcons name="plus" size={24} color="#666" />
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.modalButtonPrimary]}
            onPress={handleSave}
          >
            <Text style={styles.modalButtonTextPrimary}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const additionalStyles = StyleSheet.create({
  imagesContainer: {
    marginVertical: 16,
  },
  imagesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  imageContainer: {
    marginRight: 8,
    position: 'relative',
  },
  serviceImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF5722',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#EEEEEE',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const additionalCardStyles = {
  serviceImagesContainer: {
    marginVertical: 8,
  },
  serviceCardImage: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginRight: 8,
  },
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  bannerContainer: {
    height: HEADER_HEIGHT,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageContainer: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    marginTop: -AVATAR_SIZE / 2,
    marginLeft: 20,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR_SIZE / 2,
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  title: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: '#FF5722',
    fontWeight: '500',
    marginBottom: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  about: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
    lineHeight: 24,
  },
  section: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5722',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    marginLeft: 4,
  },
  editButton: {
    padding: 8,
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
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  serviceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceDetailText: {
    fontSize: 14,
    color: '#666666',
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  dayText: {
    fontSize: 16,
    color: '#333333',
  },
  hoursText: {
    fontSize: 16,
    color: '#666666',
  },
  editForm: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#FF5722',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    padding: 12,
  },
  modalButtonPrimary: {
    backgroundColor: '#FF5722',
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#666666',
    fontSize: 16,
  },
  modalButtonTextPrimary: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: undefined,
  picker: undefined,
  loadingText: {
    color: '#666666',
    textAlign: 'center',
    padding: 16,
  },
  ...additionalStyles,
  ...additionalCardStyles,
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  pickerContainer: undefined,
  serviceCategory: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  contactInfo: {
    marginTop: 12,
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  addressHint: {
    color: '#666666',
    fontSize: 12,
    marginTop: 4,
  },
  addressText: {
    lineHeight: 20,
  },
  addressFields: {
    gap: 8,
  },
  postcodeSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postcodeInput: {
    flex: 1,
  },
  searchingIndicator: {
    marginLeft: 8,
  },
  suggestionsContainer: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    marginTop: 4,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333333',
  },
  categoryButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
    minWidth: 80,
    alignItems: 'center',
  },
  categoryButtonSelected: {
    backgroundColor: '#FF5722',
    borderColor: '#FF5722',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  categoryButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});