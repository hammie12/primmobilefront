import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BaseScreen from '../components/BaseScreen';
import NotificationItem from '../components/NotificationItem';

export const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [notifications] = useState([
    {
      id: '1',
      type: 'booking',
      title: 'New Booking',
      message: 'You have a new booking for tomorrow at 2 PM',
      timestamp: new Date(),
      read: false,
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of £50 received for booking #1234',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      read: true,
    },
    {
      id: '3',
      type: 'review',
      title: 'New Review',
      message: 'A client has left a new 5-star review',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      read: false,
    },
  ]);

  return (
    <BaseScreen
      title="Notifications"
      rightButton={{
        icon: 'checkmark',
        onPress: () => {
          // Mark all as read
        },
      }}
    >
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => {
              // Handle notification press
              // navigation.navigate(getDestinationScreen(item));
            }}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </BaseScreen>
  );
};

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
  },
});

export default NotificationsScreen;
