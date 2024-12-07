import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';
import { SettingsSection } from '../../components/SettingsComponents';
import { Typography } from '../../components/Typography';

export const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    // TODO: Implement password change
    Alert.alert('Success', 'Password changed successfully', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <BaseSettingsScreen
      title="Change Password"
      onSave={handleSave}
    >
      <SettingsSection>
        <View style={styles.inputContainer}>
          <Typography variant="body2" style={styles.label}>Current Password</Typography>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Typography variant="body2" style={styles.label}>New Password</Typography>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Typography variant="body2" style={styles.label}>Confirm New Password</Typography>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor="#999"
          />
        </View>

        <Typography variant="caption" style={styles.hint}>
          Password must be at least 8 characters long and include a mix of letters, numbers, and special characters.
        </Typography>
      </SettingsSection>
    </BaseSettingsScreen>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FFF',
  },
  hint: {
    color: '#666',
    marginTop: 8,
  },
});
