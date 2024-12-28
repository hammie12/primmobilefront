import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Typography } from '../../components/Typography';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

type UserProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
};

export const CustomerSettingsScreen = () => {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata;
      setUserProfile({
        id: user.id,
        first_name: metadata.first_name || '',
        last_name: metadata.last_name || '',
        email: user.email,
        avatar_url: metadata.avatar_url,
      });
      setLoading(false);
    }
  }, [user]);

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
              console.log('[CustomerSettingsScreen] Signing out...');
              await signOut();
              console.log('[CustomerSettingsScreen] Sign out successful');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              console.error('[CustomerSettingsScreen] Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ],
    );
  };

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
          screen: 'HelpCentre',
        },
        {
          id: 'privacy',
          icon: 'shield-check',
          label: 'Privacy Policy',
          type: 'navigation',
          screen: 'PrivacyPolicy',
        },
        {
          id: 'terms',
          icon: 'file-document',
          label: 'Terms of Service',
          type: 'navigation',
          screen: 'TermsOfService',
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

  const renderUserHeader = () => {
    if (loading) {
      return (
        <View style={styles.userHeader}>
          <View style={styles.userAvatar} />
          <View style={styles.userInfo}>
            <Typography variant="body2" style={styles.loadingText}>Loading...</Typography>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.userHeader}>
        <Image
          source={{ 
            uri: userProfile?.avatar_url || 'https://via.placeholder.com/100'
          }}
          style={styles.userAvatar}
        />
        <View style={styles.userInfo}>
          <Typography variant="h2" style={styles.userName}>
            {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'User'}
          </Typography>
          <Typography variant="body2" style={styles.userEmail}>
            {userProfile?.email || 'No email provided'}
          </Typography>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('CustomerProfileScreen')}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="#FF5722" />
        </TouchableOpacity>
      </View>
    );
  };

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
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={24} color="#FF5722" />
          <Typography variant="body1" style={styles.logoutText}>
            Log Out
          </Typography>
        </TouchableOpacity>
      </ScrollView>
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
    backgroundColor: '#F8F8F8',
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
    backgroundColor: '#F0F0F0',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    marginBottom: 4,
  },
  userEmail: {
    color: '#666666',
  },
  loadingText: {
    color: '#666666',
  },
  editButton: {
    padding: 8,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    paddingHorizontal: 16,
    color: '#333333',
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
