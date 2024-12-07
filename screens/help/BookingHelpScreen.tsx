import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';
import { SettingsSection } from '../../components/SettingsComponents';
import { Typography } from '../../components/Typography';

export const BookingHelpScreen = () => {
  const navigation = useNavigation();

  return (
    <BaseSettingsScreen
      title="Booking Management"
      showSaveButton={false}
    >
      <ScrollView style={styles.container}>
        <SettingsSection>
          <Typography variant="h2" style={styles.heading}>
            Managing Your Calendar
          </Typography>
          
          <Typography variant="body1" style={styles.text}>
            Your calendar is the heart of your business. Here's how to make the most of it.
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Viewing Appointments
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • Switch between day, week, and month views
            • See all appointment details at a glance
            • Color-coded appointments for different services
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Handling Booking Requests
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • Review new booking requests
            • Accept or decline appointments
            • Send custom messages to clients
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Making Changes
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • Reschedule appointments
            • Add notes or special requirements
            • Cancel bookings when necessary
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Setting Your Availability
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • Set regular working hours
            • Block out time for breaks
            • Mark days off and holidays
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Booking Rules
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • Set minimum notice for bookings
            • Configure maximum bookings per day
            • Add buffer time between appointments
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Still Have Questions?
          </Typography>
          <Typography variant="body1" style={styles.text}>
            Contact our support team for personalized assistance with your booking management needs.
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
