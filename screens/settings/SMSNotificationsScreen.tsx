import React, { useState } from 'react';
import { View, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';
import { SettingsSection, SettingsRow } from '../../components/SettingsComponents';

export const SMSNotificationsScreen = () => {
  const navigation = useNavigation();
  const [settings, setSettings] = useState({
    newBookings: true,
    bookingReminders: true,
    cancellations: true,
    emergencyUpdates: true,
  });

  const handleSave = () => {
    // TODO: Implement save functionality
    navigation.goBack();
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <BaseSettingsScreen
      title="SMS Notifications"
      onSave={handleSave}
    >
      <SettingsSection title="SMS Alerts">
        <SettingsRow
          label="New Bookings"
          value={
            <Switch
              value={settings.newBookings}
              onValueChange={() => toggleSetting('newBookings')}
            />
          }
        />
        <SettingsRow
          label="Booking Reminders"
          value={
            <Switch
              value={settings.bookingReminders}
              onValueChange={() => toggleSetting('bookingReminders')}
            />
          }
        />
        <SettingsRow
          label="Cancellations"
          value={
            <Switch
              value={settings.cancellations}
              onValueChange={() => toggleSetting('cancellations')}
            />
          }
        />
        <SettingsRow
          label="Emergency Updates"
          value={
            <Switch
              value={settings.emergencyUpdates}
              onValueChange={() => toggleSetting('emergencyUpdates')}
            />
          }
        />
      </SettingsSection>
    </BaseSettingsScreen>
  );
};
