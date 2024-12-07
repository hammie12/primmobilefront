import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CustomerNavigationBar } from '../../components/CustomerNavigationBar';
import { Typography } from '../../components/Typography';

export const CustomerSettingsScreen = () => {
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [emailUpdates, setEmailUpdates] = React.useState(true);

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          icon: 'account-circle',
          label: 'My Profile',
          type: 'navigation',
          screen: 'CustomerProfileScreen',
        },
        {
          id: 'payment',
          icon: 'credit-card',
          label: 'Payment Methods',
          type: 'navigation',
          screen: 'CustomerPaymentScreen',
        },
        {
          id: 'addresses',
          icon: 'map-marker',
          label: 'Saved Addresses',
          type: 'navigation',
          screen: 'CustomerAddressesScreen',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'notifications',
          icon: 'bell',
          label: 'Push Notifications',
          type: 'toggle',
          value: notificationsEnabled,
          onValueChange: setNotificationsEnabled,
        },
        {
          id: 'email',
          icon: 'email',
          label: 'Email Updates',
          type: 'toggle',
          value: emailUpdates,
          onValueChange: setEmailUpdates,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          icon: 'help-circle',
          label: 'Help Center',
          type: 'navigation',
          screen: 'CustomerHelpScreen',
        },
        {
          id: 'privacy',
          icon: 'shield-check',
          label: 'Privacy Policy',
          type: 'navigation',
          screen: 'CustomerPrivacyScreen',
        },
        {
          id: 'terms',
          icon: 'file-document',
          label: 'Terms of Service',
          type: 'navigation',
          screen: 'CustomerTermsScreen',
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={() => {
        if (item.type === 'navigation') {
          navigation.navigate(item.screen);
        } else if (item.type === 'action' && item.onPress) {
          item.onPress();
        }
      }}
    >
      <View style={styles.settingItemLeft}>
        <MaterialCommunityIcons name={item.icon} size={24} color="#FF5722" />
        <Typography variant="body1" style={styles.settingLabel}>{item.label}</Typography>
      </View>
      {item.type === 'toggle' ? (
        <Switch
          value={item.value}
          onValueChange={item.onValueChange}
          trackColor={{ false: '#E0E0E0', true: '#FFB74D' }}
          thumbColor={item.value ? '#FF5722' : '#F5F5F5'}
        />
      ) : (
        <MaterialCommunityIcons name="chevron-right" size={24} color="#666666" />
      )}
    </TouchableOpacity>
  );

  const renderUserHeader = () => (
    <View style={styles.userHeader}>
      <Image
        source={{ uri: 'https://via.placeholder.com/100' }}
        style={styles.userAvatar}
      />
      <View style={styles.userInfo}>
        <Typography variant="h2" style={styles.userName}>Jane Smith</Typography>
        <Typography variant="body2" style={styles.userEmail}>jane.smith@example.com</Typography>
      </View>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('CustomerProfileScreen')}
      >
        <MaterialCommunityIcons name="pencil" size={20} color="#FF5722" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.content}>
        {renderUserHeader()}
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Typography variant="h2" style={styles.sectionTitle}>{section.title}</Typography>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          }}
        >
          <MaterialCommunityIcons name="logout" size={24} color="#FF5722" />
          <Typography variant="body1" style={styles.logoutText}>Log Out</Typography>
        </TouchableOpacity>
      </ScrollView>
      <CustomerNavigationBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    color: '#666666',
  },
  editButton: {
    padding: 8,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    marginLeft: 16,
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFF5F2',
    marginHorizontal: 16,
    borderRadius: 8,
  },
  logoutText: {
    color: '#FF5722',
    marginLeft: 8,
    fontWeight: '600',
  },
});
