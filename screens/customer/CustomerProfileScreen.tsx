import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Typography } from '../../components/Typography';

export const CustomerProfileScreen = () => {
  const [profile, setProfile] = useState({
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+44 7700 900000',
    dateOfBirth: '1990-01-01',
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // TODO: Implement API call to save profile changes
    setIsEditing(false);
  };

  const renderField = (label: string, value: string, field: keyof typeof profile) => (
    <View style={styles.fieldContainer}>
      <Typography variant="body2" style={styles.fieldLabel}>{label}</Typography>
      {isEditing ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => setProfile({ ...profile, [field]: text })}
          placeholder={`Enter your ${label.toLowerCase()}`}
        />
      ) : (
        <Typography variant="body1" style={styles.fieldValue}>{value}</Typography>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account" size={40} color="#FF5722" />
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
          {renderField('First Name', profile.firstName, 'firstName')}
          {renderField('Last Name', profile.lastName, 'lastName')}
          {renderField('Email', profile.email, 'email')}
          {renderField('Phone', profile.phone, 'phone')}
          {renderField('Date of Birth', profile.dateOfBirth, 'dateOfBirth')}
        </View>

        <TouchableOpacity
          style={[styles.button, isEditing ? styles.saveButton : styles.editButton]}
          onPress={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
        >
          <Typography variant="body1" style={styles.buttonText}>
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Typography>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    color: '#666666',
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
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
  buttonText: {
    color: '#FF5722',
    fontWeight: '600',
  },
});
