import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BusinessTopBar } from '../components/BusinessTopBar';
import { BusinessNavigationBar } from '../components/BusinessNavigationBar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Typography } from '../components/Typography';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const BusinessSettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement logout functionality
            navigation.navigate('Welcome');
          },
        },
      ],
    );
  };

  const SettingsItem = ({ icon, title, onPress }) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        <MaterialCommunityIcons name={icon} size={24} color="#FF5722" />
        <Typography variant="body1" style={styles.settingsItemText}>{title}</Typography>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <BusinessTopBar />
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Typography variant="h2" style={styles.sectionTitle}>Business Profile</Typography>
          <SettingsItem
            icon="store"
            title="Business Profile"
            onPress={() => navigation.navigate('BusinessProfile')}
          />
          <SettingsItem
            icon="clock"
            title="Business Hours"
            onPress={() => navigation.navigate('BusinessHours')}
          />
          <SettingsItem
            icon="tag-multiple"
            title="Services & Pricing"
            onPress={() => navigation.navigate('ServicesPricing')}
          />
        </View>

        <View style={styles.section}>
          <Typography variant="h2" style={styles.sectionTitle}>Booking Settings</Typography>
          <SettingsItem
            icon="calendar"
            title="Appointment Types"
            onPress={() => navigation.navigate('AppointmentTypes')}
          />
          <SettingsItem
            icon="book"
            title="Booking Rules"
            onPress={() => navigation.navigate('BookingRules')}
          />
          <SettingsItem
            icon="cancel"
            title="Cancellation Policy"
            onPress={() => navigation.navigate('CancellationPolicy')}
          />
        </View>

        <View style={styles.section}>
          <Typography variant="h2" style={styles.sectionTitle}>Payments</Typography>
          <SettingsItem
            icon="credit-card"
            title="Payment Methods"
            onPress={() => navigation.navigate('PaymentMethods')}
          />
          <SettingsItem
            icon="cash"
            title="Deposit Settings"
            onPress={() => navigation.navigate('DepositSettings')}
          />
          <SettingsItem
            icon="receipt"
            title="VAT Settings"
            onPress={() => navigation.navigate('VATSettings')}
          />
        </View>

        <View style={styles.section}>
          <Typography variant="h2" style={styles.sectionTitle}>Notifications</Typography>
          <SettingsItem
            icon="bell"
            title="Push Notifications"
            onPress={() => navigation.navigate('PushNotifications')}
          />
          <SettingsItem
            icon="email"
            title="Email Notifications"
            onPress={() => navigation.navigate('EmailNotifications')}
          />
          <SettingsItem
            icon="message"
            title="SMS Notifications"
            onPress={() => navigation.navigate('SMSNotifications')}
          />
        </View>

        <View style={styles.section}>
          <Typography variant="h2" style={styles.sectionTitle}>Account</Typography>
          <SettingsItem
            icon="account-cog"
            title="Account Settings"
            onPress={() => navigation.navigate('AccountSettings')}
          />
          <SettingsItem
            icon="shield-check"
            title="Privacy Policy"
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
          <SettingsItem
            icon="file-document"
            title="Terms of Service"
            onPress={() => navigation.navigate('TermsOfService')}
          />
          <SettingsItem
            icon="help-circle"
            title="Help Centre"
            onPress={() => navigation.navigate('HelpCentre')}
          />
          <SettingsItem
            icon="headphones"
            title="Contact Support"
            onPress={() => navigation.navigate('ContactSupport')}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#FF3B30" />
          <Typography variant="body1" style={styles.logoutText}>Log Out</Typography>
        </TouchableOpacity>
      </ScrollView>
      <BusinessNavigationBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 32,
    marginHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
});
