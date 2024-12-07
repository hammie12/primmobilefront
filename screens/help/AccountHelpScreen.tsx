import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';
import { SettingsSection } from '../../components/SettingsComponents';
import { Typography } from '../../components/Typography';

export const AccountHelpScreen = () => {
  const navigation = useNavigation();

  return (
    <BaseSettingsScreen
      title="Account Settings"
      showSaveButton={false}
    >
      <ScrollView style={styles.container}>
        <SettingsSection>
          <Typography variant="h2" style={styles.heading}>
            Managing Your Account
          </Typography>
          
          <Typography variant="body1" style={styles.text}>
            Learn how to manage your Prim account settings and keep your information up to date.
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Profile Settings
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • Update personal information
            • Change profile picture
            • Edit business details
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Security
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • Change password
            • Enable two-factor authentication
            • Manage login devices
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Notifications
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • Set email preferences
            • Configure push notifications
            • Customize SMS alerts
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Business Hours
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • Set regular working hours
            • Add special holiday hours
            • Configure break times
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Service Management
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • Add/edit services
            • Update pricing
            • Set service duration
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Account Support
          </Typography>
          <Typography variant="body1" style={styles.text}>
            Contact our support team for help with account-related issues or questions.
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
