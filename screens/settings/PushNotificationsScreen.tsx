import React from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';
import { Typography } from '../../components/Typography';

export const PushNotificationsScreen = () => {
  const [notifications, setNotifications] = React.useState({
    bookings: true,
    reminders: true,
    marketing: false,
  });

  return (
    <BaseSettingsScreen title="Push Notifications">
      <View style={styles.container}>
        <View style={styles.settingItem}>
          <View style={styles.settingText}>
            <Typography variant="body1" style={styles.settingTitle}>Booking Updates</Typography>
            <Typography variant="body2" style={styles.settingDescription}>
              Notifications about new, modified, or cancelled bookings
            </Typography>
          </View>
          <Switch
            value={notifications.bookings}
            onValueChange={(value) => setNotifications(prev => ({ ...prev, bookings: value }))}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingText}>
            <Typography variant="body1" style={styles.settingTitle}>Reminders</Typography>
            <Typography variant="body2" style={styles.settingDescription}>
              Upcoming appointment reminders
            </Typography>
          </View>
          <Switch
            value={notifications.reminders}
            onValueChange={(value) => setNotifications(prev => ({ ...prev, reminders: value }))}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingText}>
            <Typography variant="body1" style={styles.settingTitle}>Marketing</Typography>
            <Typography variant="body2" style={styles.settingDescription}>
              News and promotional messages
            </Typography>
          </View>
          <Switch
            value={notifications.marketing}
            onValueChange={(value) => setNotifications(prev => ({ ...prev, marketing: value }))}
          />
        </View>
      </View>
    </BaseSettingsScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingText: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
});
