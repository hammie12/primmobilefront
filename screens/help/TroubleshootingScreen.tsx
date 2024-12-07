import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';
import { SettingsSection } from '../../components/SettingsComponents';
import { Typography } from '../../components/Typography';

export const TroubleshootingScreen = () => {
  const navigation = useNavigation();

  return (
    <BaseSettingsScreen
      title="Troubleshooting"
      showSaveButton={false}
    >
      <ScrollView style={styles.container}>
        <SettingsSection>
          <Typography variant="h2" style={styles.heading}>
            Common Issues
          </Typography>
          
          <Typography variant="body1" style={styles.text}>
            Find solutions to common problems and learn how to resolve them quickly.
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Calendar Issues
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • Appointments not showing
            • Syncing problems
            • Double bookings
            • Calendar view issues
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Payment Problems
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • Failed transactions
            • Refund issues
            • Payment processing errors
            • Invoice problems
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Notification Troubles
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • Missing notifications
            • Delayed alerts
            • Email delivery issues
            • Push notification setup
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            App Performance
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • App running slowly
            • Crashing issues
            • Loading problems
            • Update errors
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Account Access
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • Login problems
            • Password reset
            • Account verification
            • Device authorization
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Contact Support
          </Typography>
          <Typography variant="body1" style={styles.text}>
            If you can't find a solution to your problem, our support team is available 24/7 to help.
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
