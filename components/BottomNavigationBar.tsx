import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

type RootStackParamList = {
  Home: undefined;
  CustomerHome: undefined;
  BusinessBookings: undefined;
  CustomerBookings: undefined;
  BusinessAnalytics: undefined;
  CustomerRewards: undefined;
  ProfessionalProfile: undefined;
  CustomerProfile: undefined;
  BusinessSettings: undefined;
  CustomerSettings: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BottomNavigationBar = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { userRole } = useAuth();

  const customerTabs = [
    { name: 'Home', icon: 'home', route: 'CustomerHome' },
    { name: 'Bookings', icon: 'calendar', route: 'CustomerBookings' },
    { name: 'Rewards', icon: 'gift', route: 'CustomerRewards' },
    { name: 'Profile', icon: 'person', route: 'CustomerProfile' },
    { name: 'Settings', icon: 'settings', route: 'CustomerSettings' },
  ] as const;

  const professionalTabs = [
    { name: 'Home', icon: 'home', route: 'Home' },
    { name: 'Bookings', icon: 'calendar', route: 'BusinessBookings' },
    { name: 'Analytics', icon: 'stats-chart', route: 'BusinessAnalytics' },
    { name: 'Profile', icon: 'person', route: 'ProfessionalProfile' },
    { name: 'Settings', icon: 'settings', route: 'BusinessSettings' },
  ] as const;

  const tabs = userRole === 'CUSTOMER' ? customerTabs : professionalTabs;

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = route.name === tab.route;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => {
              console.log('[BottomNavigationBar] Navigating to:', tab.route);
              navigation.navigate(tab.route);
            }}
          >
            <Ionicons
              name={isActive ? tab.icon : `${tab.icon}-outline`}
              size={24}
              color={isActive ? '#FF5722' : '#666'}
            />
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
  },
  activeTabText: {
    color: '#FF5722',
    fontWeight: '600',
  },
});

export default BottomNavigationBar;