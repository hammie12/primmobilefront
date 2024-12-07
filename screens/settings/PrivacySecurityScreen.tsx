import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BaseSettingsScreen from '../../components/BaseSettingsScreen';

const PrivacySecurityScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    biometricLogin: true,
    locationServices: true,
    dataSharing: false,
  });

  const toggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const SecurityItem = ({ title, description, value, onToggle }) => (
    <View style={styles.securityItem}>
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

  const ActionItem = ({ title, description, icon }) => (
    <TouchableOpacity style={styles.actionItem}>
      <View style={styles.actionLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color="#FF5722" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>{title}</Text>
          <Text style={styles.itemDescription}>{description}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#FF5722" />
    </TouchableOpacity>
  );

  return (
    <BaseSettingsScreen title="Privacy & Security" navigation={navigation}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Settings</Text>
          <View style={styles.card}>
            <SecurityItem
              title="Two-Factor Authentication"
              description="Add an extra layer of security to your account"
              value={settings.twoFactorAuth}
              onToggle={() => toggleSetting('twoFactorAuth')}
            />
            <SecurityItem
              title="Biometric Login"
              description="Use fingerprint or face recognition to log in"
              value={settings.biometricLogin}
              onToggle={() => toggleSetting('biometricLogin')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.card}>
            <SecurityItem
              title="Location Services"
              description="Allow app to access your location"
              value={settings.locationServices}
              onToggle={() => toggleSetting('locationServices')}
            />
            <SecurityItem
              title="Data Sharing"
              description="Share usage data to improve our services"
              value={settings.dataSharing}
              onToggle={() => toggleSetting('dataSharing')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          <View style={styles.card}>
            <ActionItem
              title="Change Password"
              description="Update your account password"
              icon="key-outline"
            />
            <ActionItem
              title="Connected Devices"
              description="Manage devices connected to your account"
              icon="phone-portrait-outline"
            />
            <ActionItem
              title="Login History"
              description="View recent account activity"
              icon="time-outline"
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
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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

export { PrivacySecurityScreen };
