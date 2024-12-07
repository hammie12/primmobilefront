import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';
import { SettingsSection, SettingsRow } from '../../components/SettingsComponents';

export const AccountSettingsScreen = () => {
  const navigation = useNavigation();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Account Deletion', 'Please contact support to delete your account.');
          },
        },
      ],
    );
  };

  return (
    <BaseSettingsScreen
      title="Account Settings"
      onSave={() => navigation.goBack()}
    >
      <SettingsSection title="Security">
        <SettingsRow
          label="Change Password"
          onPress={handleChangePassword}
          showDisclosure
        />
        <SettingsRow
          label="Two-Factor Authentication"
          value={twoFactorEnabled}
          onValueChange={setTwoFactorEnabled}
          type="switch"
        />
      </SettingsSection>

      <SettingsSection title="Account">
        <SettingsRow
          label="Email Address"
          value="user@example.com"
          onPress={() => navigation.navigate('ChangeEmail')}
          showDisclosure
        />
        <SettingsRow
          label="Phone Number"
          value="+44 123 456 7890"
          onPress={() => navigation.navigate('ChangePhone')}
          showDisclosure
        />
        <SettingsRow
          label="Language"
          value="English"
          onPress={() => navigation.navigate('LanguageSettings')}
          showDisclosure
        />
      </SettingsSection>

      <SettingsSection title="Data">
        <SettingsRow
          label="Export Data"
          onPress={() => Alert.alert('Export Data', 'Your data will be exported and emailed to you.')}
          showDisclosure
        />
        <SettingsRow
          label="Delete Account"
          onPress={handleDeleteAccount}
          textColor="#FF3B30"
          showDisclosure
        />
      </SettingsSection>
    </BaseSettingsScreen>
  );
};
