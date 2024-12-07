import React, { useState } from 'react';
import { View, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';
import { SettingsSection, SettingsRow } from '../../components/SettingsComponents';

export const PushNotificationsScreen = () => {
  const navigation = useNavigation();
  const [settings, setSettings] = useState({
    newBookings: true,
    bookingChanges: true,
    bookingReminders: true,
    cancellations: true,
    payments: true,
    reviews: true,
    promotions: false,
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
      title="Push Notifications"
      onSave={handleSave}
    >
      <SettingsSection title="Booking Notifications">
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
          label="Booking Changes"
          value={
            <Switch
              value={settings.bookingChanges}
              onValueChange={() => toggleSetting('bookingChanges')}
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
      </SettingsSection>

      <SettingsSection title="Other Notifications">
        <SettingsRow
          label="Payment Updates"
          value={
            <Switch
              value={settings.payments}
              onValueChange={() => toggleSetting('payments')}
            />
          }
        />
        <SettingsRow
          label="Reviews & Feedback"
          value={
            <Switch
              value={settings.reviews}
              onValueChange={() => toggleSetting('reviews')}
            />
          }
        />
        <SettingsRow
          label="Promotions & Updates"
          value={
            <Switch
              value={settings.promotions}
              onValueChange={() => toggleSetting('promotions')}
            />
          }
        />
      </SettingsSection>
    </BaseSettingsScreen>
  );
};
