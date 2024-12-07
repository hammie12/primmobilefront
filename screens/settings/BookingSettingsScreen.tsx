import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BaseSettingsScreen from '../../components/BaseSettingsScreen';

const BookingSettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    autoAccept: false,
    requireDeposit: true,
    allowCancellations: true,
    sendReminders: true,
    bufferTime: 15, // minutes
    maxAdvanceBooking: 30, // days
    minNotice: 24, // hours
  });

  const toggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const SettingItem = ({ title, description, value, onToggle }) => (
    <View style={styles.settingItem}>
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

  const TimeSettingItem = ({ title, description, value, unit }) => (
    <TouchableOpacity style={styles.timeSettingItem}>
      <View style={styles.textContainer}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemDescription}>{description}</Text>
      </View>
      <View style={styles.timeValue}>
        <Text style={styles.valueText}>{value} {unit}</Text>
        <Ionicons name="chevron-forward" size={20} color="#FF5722" />
      </View>
    </TouchableOpacity>
  );

  return (
    <BaseSettingsScreen title="Booking Settings" navigation={navigation}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Settings</Text>
          <View style={styles.card}>
            <SettingItem
              title="Auto-Accept Bookings"
              description="Automatically accept new booking requests"
              value={settings.autoAccept}
              onToggle={() => toggleSetting('autoAccept')}
            />
            <SettingItem
              title="Require Deposit"
              description="Require a deposit for booking confirmation"
              value={settings.requireDeposit}
              onToggle={() => toggleSetting('requireDeposit')}
            />
            <SettingItem
              title="Allow Cancellations"
              description="Let clients cancel their bookings"
              value={settings.allowCancellations}
              onToggle={() => toggleSetting('allowCancellations')}
            />
            <SettingItem
              title="Send Reminders"
              description="Send booking reminders to clients"
              value={settings.sendReminders}
              onToggle={() => toggleSetting('sendReminders')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Settings</Text>
          <View style={styles.card}>
            <TimeSettingItem
              title="Buffer Time"
              description="Time between appointments"
              value={settings.bufferTime}
              unit="min"
            />
            <TimeSettingItem
              title="Maximum Advance Booking"
              description="How far in advance clients can book"
              value={settings.maxAdvanceBooking}
              unit="days"
            />
            <TimeSettingItem
              title="Minimum Notice"
              description="Minimum notice required for bookings"
              value={settings.minNotice}
              unit="hours"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cancellation Policy</Text>
          <TouchableOpacity style={styles.policyCard}>
            <View style={styles.policyContent}>
              <Text style={styles.policyTitle}>Current Policy</Text>
              <Text style={styles.policyDescription}>
                Clients can cancel up to 24 hours before their appointment for a full refund.
                Late cancellations may be subject to a fee.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FF5722" />
          </TouchableOpacity>
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeSettingItem: {
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
  timeValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF5722',
    marginRight: 8,
  },
  policyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  policyContent: {
    flex: 1,
    marginRight: 16,
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  policyDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export { BookingSettingsScreen };
