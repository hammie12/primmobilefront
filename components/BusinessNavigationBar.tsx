import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export const BusinessNavigationBar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const isRouteActive = (routeName: string) => {
    return route.name === routeName;
  };

  const getIconColor = (routeName: string) => {
    return isRouteActive(routeName) ? '#FF5722' : '#666666';
  };

  const renderNavItem = (routeName: string, icon: string, label: string) => (
    <TouchableOpacity
      style={styles.navItem}
      onPress={() => navigation.navigate(routeName)}
    >
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color={getIconColor(routeName)}
      />
      <Text style={[
        styles.navLabel,
        isRouteActive(routeName) && styles.activeNavLabel
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {renderNavItem('Home', 'home', 'Home')}
      {renderNavItem('BusinessBookings', 'calendar', 'Bookings')}
      {renderNavItem('ProfessionalProfile', 'account', 'Profile')}
      {renderNavItem('BusinessAnalytics', 'chart-bar', 'Analytics')}
      {renderNavItem('BusinessSettings', 'cog', 'Settings')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#666666',
  },
  activeNavLabel: {
    color: '#FF5722',
  },
});
