import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Typography } from '../../components/Typography';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type Address = {
  id: string;
  customer_profile_id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
  is_default: boolean;
};

type PostcodeResult = {
  postcode: string;
  latitude?: number;
  longitude?: number;
};

type Profile = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  avatar_url?: string;
  address?: Address;
};

const formatDateForDB = (dateString: string | null): string | null => {
  if (!dateString || dateString.trim() === '') return null;
  // Try to parse the date string
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  // Format as YYYY-MM-DD
  return date.toISOString().split('T')[0];
};

const formatDateForDisplay = (dateString: string | null): string => {
  if (!dateString || dateString.trim() === '') return '';
  // Try to parse the date string
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  // Format as DD/MM/YYYY
  return date.toLocaleDateString('en-GB');
};

// Update the postcode validation to be more lenient
const isValidUKPostcode = (postcode: string): boolean => {
  // Remove all spaces and convert to uppercase
  const cleaned = postcode.replace(/\s+/g, '').toUpperCase();
  // UK postcode format: AA9A 9AA, A9A 9AA, A9 9AA, A99 9AA, AA9 9AA, AA99 9AA
  const postcodeRegex = /^[A-Z]{1,2}[0-9][0-9A-Z]?[0-9][A-Z]{2}$/;
  return postcodeRegex.test(cleaned);
};

// Format postcode with space
const formatPostcode = (postcode: string): string => {
  // Remove all spaces and convert to uppercase
  const cleaned = postcode.replace(/\s+/g, '').toUpperCase();
  // Insert a space before the last 3 characters
  if (cleaned.length > 3) {
    return `${cleaned.slice(0, -3)} ${cleaned.slice(-3)}`;
  }
  return cleaned;
};

export const CustomerProfileScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>({
    id: '',
    user_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    avatar_url: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [postcodeResults, setPostcodeResults] = useState<PostcodeResult[]>([]);
  const [showPostcodeDropdown, setShowPostcodeDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Get the latest user data first
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const metadata = currentUser?.user_metadata || {};

      // Try to get the customer profile
      const { data: customerProfile, error: customerError } = await supabase
        .from('customer_profiles')
        .select(`
          id,
          user_id,
          first_name,
          last_name,
          phone_number,
          date_of_birth,
          created_at,
          updated_at,
          addresses!inner (
            id,
            customer_profile_id,
            address_line1,
            address_line2,
            city,
            county,
            postcode,
            country,
            is_default
          )
        `)
        .eq('user_id', user.id)
        .single();

      console.log('Fetched profile:', JSON.stringify(customerProfile, null, 2));

      // If no profile exists or we get a PGRST116 error, create one
      if ((customerError?.code === 'PGRST116' || !customerProfile) && !customerError?.code?.includes('23505')) {
        console.log('Creating new customer profile...');
        const newProfile = {
          user_id: user.id,
          first_name: metadata?.first_name || '',
          last_name: metadata?.last_name || '',
          phone_number: metadata?.phone || '',
          date_of_birth: null,
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('customer_profiles')
          .insert([newProfile])
          .select(`
            id,
            user_id,
            first_name,
            last_name,
            phone_number,
            date_of_birth,
            created_at,
            updated_at,
            addresses!inner (
              id,
              customer_profile_id,
              address_line1,
              address_line2,
              city,
              county,
              postcode,
              country,
              is_default
            )
          `)
          .single();

        if (createError) {
          // If we get a duplicate key error, try fetching the profile again
          if (createError.code === '23505') {
            const { data: existingProfile, error: fetchError } = await supabase
              .from('customer_profiles')
              .select(`
                id,
                user_id,
                first_name,
                last_name,
                phone_number,
                date_of_birth,
                created_at,
                updated_at,
                addresses!inner (
                  id,
                  customer_profile_id,
                  address_line1,
                  address_line2,
                  city,
                  county,
                  postcode,
                  country,
                  is_default
                )
              `)
              .eq('user_id', user.id)
              .single();

            if (fetchError) throw fetchError;
            if (existingProfile) {
              console.log('Found existing profile:', JSON.stringify(existingProfile, null, 2));
              setProfile({
                ...existingProfile,
                email: currentUser?.email || '',
                phone_number: metadata?.phone || existingProfile.phone_number || '',
                date_of_birth: existingProfile.date_of_birth || '',
                address: Array.isArray(existingProfile.addresses) ? existingProfile.addresses[0] : existingProfile.addresses,
              });
              return;
            }
          }
          console.error('Error creating profile:', createError);
          throw createError;
        }

        console.log('Created profile:', JSON.stringify(createdProfile, null, 2));
        setProfile({
          ...createdProfile,
          email: currentUser?.email || '',
          phone_number: metadata?.phone || createdProfile.phone_number || '',
          date_of_birth: '',
          address: Array.isArray(createdProfile.addresses) ? createdProfile.addresses[0] : createdProfile.addresses,
        });
      } else if (customerProfile) {
        // Profile exists, use it
        console.log('Using existing profile with addresses:', JSON.stringify(customerProfile.addresses, null, 2));
        setProfile({
          ...customerProfile,
          email: currentUser?.email || '',
          phone_number: metadata?.phone || customerProfile.phone_number || '',
          date_of_birth: customerProfile.date_of_birth || '',
          address: Array.isArray(customerProfile.addresses) ? customerProfile.addresses[0] : customerProfile.addresses,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      console.log('Current profile state:', JSON.stringify(profile, null, 2));
      console.log('Current address state:', JSON.stringify(profile.address, null, 2));
      
      // Get the customer profile ID first
      const { data: customerProfile, error: profileFetchError } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileFetchError) throw profileFetchError;
      
      const customerProfileId = customerProfile.id;
      console.log('Found customer profile ID:', customerProfileId);
      
      // Validate UK postcode if one is provided
      if (profile.address?.postcode) {
        const cleanedPostcode = profile.address.postcode.replace(/\s+/g, '').toUpperCase();
        if (!isValidUKPostcode(cleanedPostcode)) {
          throw new Error('Please enter a valid UK postcode (e.g., SW1A 1AA)');
        }
      }

      // Format postcode before saving
      const formattedAddress = profile.address ? {
        ...profile.address,
        postcode: profile.address.postcode ? formatPostcode(profile.address.postcode) : '',
      } : null;

      console.log('Formatted address:', JSON.stringify(formattedAddress, null, 2));

      // If email has changed, update it first through auth
      if (profile.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profile.email,
        });

        if (emailError) {
          throw new Error('Failed to update email. ' + emailError.message);
        }

        Alert.alert(
          'Email Verification Required',
          'A verification email has been sent to your new email address. Please verify it to complete the email change.'
        );
      }

      // Update profile in database
      const { error: profileError } = await supabase
        .from('customer_profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone_number: profile.phone_number,
          date_of_birth: formatDateForDB(profile.date_of_birth),
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Update or create address
      if (formattedAddress) {
        const addressData = {
          address_line1: formattedAddress.address_line1 || '',
          address_line2: formattedAddress.address_line2 || null,
          city: formattedAddress.city || '',
          county: formattedAddress.county || '',
          postcode: formattedAddress.postcode || '',
          country: 'United Kingdom',
          is_default: true,
        };

        console.log('Address data to save:', JSON.stringify(addressData, null, 2));

        // First check if an address exists for this customer profile
        const { data: existingAddresses, error: checkError } = await supabase
          .from('addresses')
          .select('id')
          .eq('customer_profile_id', customerProfileId)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingAddresses?.id) {
          // Update existing address
          console.log('Updating existing address with ID:', existingAddresses.id);
          const { data: updateData, error: addressError } = await supabase
            .from('addresses')
            .update(addressData)
            .eq('id', existingAddresses.id)
            .select();

          console.log('Update result:', JSON.stringify(updateData, null, 2));
          if (addressError) throw addressError;
        } else {
          // Create new address
          console.log('Creating new address for profile:', customerProfileId);
          const { data: insertData, error: addressError } = await supabase
            .from('addresses')
            .insert([{
              ...addressData,
              customer_profile_id: customerProfileId,
            }])
            .select();

          console.log('Insert result:', JSON.stringify(insertData, null, 2));
          if (addressError) throw addressError;
        }
      }

      // Update user metadata including phone
      const { error: updateMetadataError } = await supabase.auth.updateUser({
        data: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone_number,
        }
      });

      if (updateMetadataError) throw updateMetadataError;

      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
      await fetchProfile(); // Refresh the profile data
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add postcode lookup function
  const lookupPostcode = async (query: string) => {
    if (!query || query.length < 2) {
      setPostcodeResults([]);
      setShowPostcodeDropdown(false);
      return;
    }

    try {
      const response = await fetch(`https://api.postcodes.io/postcodes/${query}/autocomplete`);
      const data = await response.json();
      
      if (data.result) {
        setPostcodeResults(data.result.map((postcode: string) => ({ postcode })));
        setShowPostcodeDropdown(true);
      } else {
        setPostcodeResults([]);
        setShowPostcodeDropdown(false);
      }
    } catch (error) {
      console.error('Error fetching postcodes:', error);
      setPostcodeResults([]);
      setShowPostcodeDropdown(false);
    }
  };

  // Add postcode selection handler
  const handlePostcodeSelect = async (selectedPostcode: string) => {
    try {
      const response = await fetch(`https://api.postcodes.io/postcodes/${selectedPostcode}`);
      const data = await response.json();
      
      if (data.result) {
        const currentAddress = profile.address || {
          id: '',
          customer_profile_id: profile.id,
          address_line1: '',
          address_line2: null,
          city: '',
          county: '',
          postcode: '',
          country: 'United Kingdom',
          is_default: true,
        };

        setProfile({
          ...profile,
          address: {
            ...currentAddress,
            postcode: formatPostcode(selectedPostcode),
            city: data.result.admin_district || data.result.parish || '',
            county: data.result.admin_county || data.result.admin_district || '',
          },
        });
      }
    } catch (error) {
      console.error('Error fetching postcode details:', error);
    }
    setShowPostcodeDropdown(false);
  };

  // Add dropdown renderer
  const renderPostcodeDropdown = () => {
    if (!showPostcodeDropdown || postcodeResults.length === 0) {
      return null;
    }

    return (
      <View style={styles.postcodeDropdown}>
        {postcodeResults.map((item) => (
          <TouchableOpacity
            key={item.postcode}
            style={styles.postcodeItem}
            onPress={() => handlePostcodeSelect(item.postcode)}
          >
            <Typography variant="body1">{formatPostcode(item.postcode)}</Typography>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderField = (label: string, value: string, field: string) => (
    <View style={styles.fieldContainer}>
      <Typography variant="body2" style={styles.fieldLabel}>{label}</Typography>
      {isEditing ? (
        <View>
          <TextInput
            style={[
              styles.input,
              field === 'address.postcode' && value && !isValidUKPostcode(value) && styles.inputError,
              field === 'address.postcode' && showPostcodeDropdown && styles.inputWithDropdown
            ]}
            value={value}
            onChangeText={(text) => {
              if (field.startsWith('address.')) {
                const addressField = field.split('.')[1];
                let newValue = text;
                
                if (addressField === 'postcode') {
                  newValue = text.toUpperCase();
                  lookupPostcode(newValue);
                }

                const currentAddress = profile.address || {
                  id: '',
                  customer_profile_id: profile.id,
                  address_line1: '',
                  address_line2: null,
                  city: '',
                  county: '',
                  postcode: '',
                  country: 'United Kingdom',
                  is_default: true,
                };

                setProfile({
                  ...profile,
                  address: {
                    ...currentAddress,
                    [addressField]: newValue,
                  },
                });
              } else {
                setProfile({ ...profile, [field]: text });
              }
            }}
            placeholder={
              field === 'address.postcode' ? 'e.g., SW1A 1AA' :
              `Enter your ${label.toLowerCase()}`
            }
            editable={!loading}
            keyboardType={
              field === 'phone_number' ? 'phone-pad' : 
              field === 'email' ? 'email-address' : 
              'default'
            }
            autoCapitalize={
              field === 'first_name' || field === 'last_name' || 
              field === 'address.city' || field === 'address.county' ? 
              'words' : field === 'address.postcode' ? 'characters' : 'none'
            }
            autoComplete={field === 'email' ? 'email' : 'off'}
            maxLength={field === 'address.postcode' ? 8 : undefined}
          />
          {field === 'address.postcode' && renderPostcodeDropdown()}
        </View>
      ) : (
        <Typography variant="body1" style={styles.fieldValue}>
          {field === 'date_of_birth' ? formatDateForDisplay(value) : (value || 'Not set')}
        </Typography>
      )}
      {isEditing && field === 'address.postcode' && value && !isValidUKPostcode(value) && (
        <Typography variant="body2" style={styles.errorText}>
          Please enter a valid UK postcode
        </Typography>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FF5722" />
        </TouchableOpacity>
        <Typography variant="h1" style={styles.headerTitle}>My Profile</Typography>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                {profile.avatar_url ? (
                  <Image 
                    source={{ uri: profile.avatar_url }} 
                    style={styles.avatarImage}
                  />
                ) : (
                  <MaterialCommunityIcons name="account" size={40} color="#FF5722" />
                )}
              </View>
              {isEditing && (
                <TouchableOpacity style={styles.changeAvatarButton}>
                  <Typography variant="body2" style={styles.changeAvatarText}>
                    Change Photo
                  </Typography>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.section}>
              <Typography variant="h2" style={styles.sectionTitle}>Personal Information</Typography>
              {renderField('First Name', profile.first_name, 'first_name')}
              {renderField('Last Name', profile.last_name, 'last_name')}
              {renderField('Email', profile.email, 'email')}
              {renderField('Phone', profile.phone_number, 'phone_number')}
              {renderField('Date of Birth', profile.date_of_birth, 'date_of_birth')}
            </View>

            <View style={styles.section}>
              <Typography variant="h2" style={styles.sectionTitle}>Address</Typography>
              {renderField('Address Line 1', profile.address?.address_line1 || '', 'address.address_line1')}
              {renderField('Address Line 2', profile.address?.address_line2 || '', 'address.address_line2')}
              {renderField('City', profile.address?.city || '', 'address.city')}
              {renderField('County', profile.address?.county || '', 'address.county')}
              {renderField('Postcode', profile.address?.postcode || '', 'address.postcode')}
              <Typography variant="body2" style={styles.addressHint}>
                All addresses are in the United Kingdom
              </Typography>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              isEditing ? styles.saveButton : styles.editButton,
              loading && styles.disabledButton
            ]}
            onPress={() => {
              if (!loading) {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }
            }}
            disabled={loading}
          >
            <Typography 
              variant="body1" 
              style={[
                styles.buttonText,
                isEditing && styles.saveButtonText
              ]}
            >
              {loading ? 'Loading...' : isEditing ? 'Save Changes' : 'Edit Profile'}
            </Typography>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  headerRight: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeAvatarButton: {
    marginTop: 8,
  },
  changeAvatarText: {
    color: '#FF5722',
  },
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#666666',
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
  },
  button: {
    marginHorizontal: 16,
    marginVertical: 24,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#FFF5F2',
  },
  saveButton: {
    backgroundColor: '#FF5722',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FF5722',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    marginTop: 4,
    fontSize: 12,
  },
  addressHint: {
    color: '#666666',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  inputWithDropdown: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  postcodeDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#E0E0E0',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    zIndex: 1000,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  postcodeItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
});
