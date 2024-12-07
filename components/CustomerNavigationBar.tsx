import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Typography } from './Typography';

export const CustomerNavigationBar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const navigationItems = [
    { name: 'Home', icon: 'home', screen: 'CustomerHome' },
    { name: 'Search', icon: 'magnify', screen: 'CustomerSearch' },
    { name: 'Bookings', icon: 'calendar', screen: 'CustomerBookings' },
    { name: 'Rewards', icon: 'star', screen: 'CustomerRewards' },
    { name: 'Settings', icon: 'cog', screen: 'CustomerSettings' },
  ];

  return (
    <View style={styles.container}>
      {navigationItems.map((item) => {
        const isActive = route.name === item.screen;
        return (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={24}
              color={isActive ? '#FF5722' : '#666666'}
            />
            <Typography
              variant="caption"
              style={[
                styles.navText,
                { color: isActive ? '#FF5722' : '#666666' },
              ]}
            >
              {item.name}
            </Typography>
          </TouchableOpacity>
        );
      })}
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
    borderTopColor: '#F0F0F0',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navText: {
    marginTop: 4,
    fontSize: 12,
  },
});
