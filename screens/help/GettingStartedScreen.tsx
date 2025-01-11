import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';
import { SettingsSection } from '../../components/SettingsComponents';
import { Typography } from '../../components/Typography';

export const GettingStartedScreen = () => {
  const navigation = useNavigation();

  return (
    <BaseSettingsScreen
      title="Getting Started"
      showSaveButton={false}
    >
      <ScrollView style={styles.container}>
        <SettingsSection>
          <Typography variant="h2" style={styles.heading}>
            Welcome to Priim
          </Typography>
          
          <Typography variant="body1" style={styles.text}>
            Priim is your all-in-one solution for managing your beauty or wellness business. 
            This guide will help you get started with the essential features.
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            1. Complete Your Profile
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • Add your business details and profile photo
            • Set your working hours and location
            • List your services and prices
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            2. Set Up Your Calendar
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • Configure your availability
            • Set buffer times between appointments
            • Add any recurring breaks or time off
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            3. Configure Notifications
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • Choose how you want to be notified about bookings
            • Set up automated reminders for clients
            • Customize your notification preferences
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            4. Start Taking Bookings
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • Share your booking link with clients
            • Accept or decline booking requests
            • Manage your appointments in the calendar
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Need More Help?
          </Typography>
          <Typography variant="body1" style={styles.text}>
            Check out our other help topics or contact our support team if you need 
            additional assistance.
          </Typography>
        </SettingsSection>
      </ScrollView>
    </BaseSettingsScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    marginTop: 24,
    marginBottom: 8,
    color: '#333333',
  },
  text: {
    marginBottom: 16,
    color: '#666666',
    lineHeight: 24,
  },
});
