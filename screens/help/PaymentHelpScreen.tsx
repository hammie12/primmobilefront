import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';
import { SettingsSection } from '../../components/SettingsComponents';
import { Typography } from '../../components/Typography';

export const PaymentHelpScreen = () => {
  const navigation = useNavigation();

  return (
    <BaseSettingsScreen
      title="Payments & Billing"
      showSaveButton={false}
    >
      <ScrollView style={styles.container}>
        <SettingsSection>
          <Typography variant="h2" style={styles.heading}>
            Payment Methods
          </Typography>
          
          <Typography variant="body1" style={styles.text}>
            Priim supports various payment methods to make transactions smooth for you and your clients.
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Setting Up Payments
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • Connect your bank account
            • Set up payment processing
            • Configure automatic deposits
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Taking Payments
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • Accept card payments
            • Handle cash transactions
            • Process refunds when needed
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Deposits & Cancellation Fees
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • Set booking deposit amounts
            • Configure cancellation policies
            • Handle late cancellations
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Financial Reports
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • View daily/weekly/monthly earnings
            • Track payment history
            • Export financial reports
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Invoicing
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • Create professional invoices
            • Send automatic receipts
            • Manage outstanding payments
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            Need Help with Payments?
          </Typography>
          <Typography variant="body1" style={styles.text}>
            Our support team is here to help with any payment-related questions or issues.
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
