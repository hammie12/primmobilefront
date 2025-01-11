import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BusinessTopBar } from '../components/BusinessTopBar';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '../types/navigation';
import { Typography } from '../components/Typography';
import { useAuth } from '../contexts/AuthContext';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'BusinessSettings'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const BusinessSettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { signOut } = useAuth();

  const navigateToScreen = (screenName: keyof RootStackParamList) => {
    navigation.navigate(screenName);
  };

  const handleLogout = async () => {
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
          onPress: async () => {
            try {
              await signOut();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.error('[BusinessSettingsScreen] Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
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
          <Typography variant="h2" style={styles.sectionTitle}>Payments</Typography>
          <SettingsItem
            icon="credit-card"
            title="Payment Methods"
            onPress={() => navigateToScreen('BusinessPaymentMethodsScreen')}
          />
          <SettingsItem
            icon="cash-multiple"
            title="Payout Settings"
            onPress={() => navigateToScreen('PayoutSettings')}
          />
        </View>

        <View style={styles.section}>
          <Typography variant="h2" style={styles.sectionTitle}>Notifications</Typography>
          <SettingsItem
            icon="bell"
            title="Push Notifications"
            onPress={() => navigateToScreen('PushNotifications')}
          />
          <SettingsItem
            icon="email"
            title="Email Notifications"
            onPress={() => navigateToScreen('EmailNotifications')}
          />
          <SettingsItem
            icon="message"
            title="SMS Notifications"
            onPress={() => navigateToScreen('SMSNotifications')}
          />
        </View>

        <View style={styles.section}>
          <Typography variant="h2" style={styles.sectionTitle}>Account</Typography>
          <SettingsItem
            icon="account-cog"
            title="Account Settings"
            onPress={() => navigateToScreen('AccountSettings')}
          />
          <SettingsItem
            icon="shield-check"
            title="Privacy Policy"
            onPress={() => navigateToScreen('PrivacyPolicy')}
          />
          <SettingsItem
            icon="file-document"
            title="Terms of Service"
            onPress={() => navigateToScreen('TermsOfService')}
          />
          <SettingsItem
            icon="help-circle"
            title="Help Centre"
            onPress={() => navigateToScreen('HelpCentre')}
          />
          <SettingsItem
            icon="headphones"
            title="Contact Support"
            onPress={() => navigateToScreen('ContactSupport')}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#FF3B30" />
          <Typography variant="body1" style={styles.logoutText}>Log Out</Typography>
        </TouchableOpacity>
      </ScrollView>
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
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 85 : 65,
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
