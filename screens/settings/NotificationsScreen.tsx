import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';
import BaseSettingsScreen from '../../components/BaseSettingsScreen';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState({
    pushEnabled: true,
    emailEnabled: true,
    bookingReminders: true,
    marketingEmails: false,
    newMessages: true,
    bookingRequests: true,
  });

  const toggleSwitch = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const NotificationItem = ({ title, description, value, onToggle }) => (
    <View style={styles.notificationItem}>
      <View style={styles.textContainer}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemDescription}>{description}</Text>
      </View>
      <Switch
        trackColor={{ false: '#e0e0e0', true: 'rgba(255, 87, 34, 0.4)' }}
        thumbColor={value ? '#FF5722' : '#f4f3f4'}
        ios_backgroundColor="#e0e0e0"
        onValueChange={onToggle}
        value={value}
      />
    </View>
  );

  return (
    <BaseSettingsScreen title="Notifications" navigation={navigation}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Notifications</Text>
          <View style={styles.card}>
            <NotificationItem
              title="Push Notifications"
              description="Receive push notifications on your device"
              value={notifications.pushEnabled}
              onToggle={() => toggleSwitch('pushEnabled')}
            />
            <NotificationItem
              title="Email Notifications"
              description="Receive email notifications"
              value={notifications.emailEnabled}
              onToggle={() => toggleSwitch('emailEnabled')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Notifications</Text>
          <View style={styles.card}>
            <NotificationItem
              title="Booking Reminders"
              description="Receive reminders about upcoming bookings"
              value={notifications.bookingReminders}
              onToggle={() => toggleSwitch('bookingReminders')}
            />
            <NotificationItem
              title="Booking Requests"
              description="Get notified about new booking requests"
              value={notifications.bookingRequests}
              onToggle={() => toggleSwitch('bookingRequests')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Notifications</Text>
          <View style={styles.card}>
            <NotificationItem
              title="New Messages"
              description="Get notified when you receive new messages"
              value={notifications.newMessages}
              onToggle={() => toggleSwitch('newMessages')}
            />
            <NotificationItem
              title="Marketing Emails"
              description="Receive updates about new features and promotions"
              value={notifications.marketingEmails}
              onToggle={() => toggleSwitch('marketingEmails')}
            />
          </View>
        </View>
      </ScrollView>
    </BaseSettingsScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export { NotificationsScreen };
