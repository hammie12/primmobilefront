import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';
import { SettingsSection } from '../../components/SettingsComponents';
import { Typography } from '../../components/Typography';

export const TermsOfServiceScreen = () => {
  return (
    <BaseSettingsScreen
      title="Terms of Service"
      showSaveButton={false}
    >
      <ScrollView style={styles.container}>
        <SettingsSection>
          <Typography variant="body1" style={styles.text}>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>
          
          <Typography variant="h2" style={styles.heading}>
            1. Acceptance of Terms
          </Typography>
          <Typography variant="body1" style={styles.text}>
            By accessing and using the PrimMobile application ("the Service"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            2. Service Description
          </Typography>
          <Typography variant="body1" style={styles.text}>
            PrimMobile is a platform that enables beauty and wellness professionals to manage their business operations, including but not limited to appointment scheduling, client management, payment processing, and business analytics.
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            3. User Registration and Account Security
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • You must provide accurate and complete information when creating an account
            • You are responsible for maintaining the security of your account credentials
            • You must notify us immediately of any unauthorized access or security breaches
            • We reserve the right to suspend or terminate accounts that violate these terms
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            4. Service Usage and Restrictions
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • The Service may only be used for lawful purposes
            • You may not use the Service to transmit harmful code or conduct malicious activities
            • You may not attempt to gain unauthorized access to the Service
            • We reserve the right to modify or discontinue the Service at any time
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            5. Payment Terms
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • All fees are charged in accordance with our current pricing structure
            • Payment processing is handled by secure third-party providers
            • Refunds are processed according to our refund policy
            • We reserve the right to modify our pricing with reasonable notice
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            6. Data Privacy and Security
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • We collect and process data in accordance with our Privacy Policy
            • You retain ownership of your content and data
            • We implement reasonable security measures to protect your information
            • We may share data with third parties as outlined in our Privacy Policy
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            7. Intellectual Property
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • The Service and its original content are protected by copyright and other laws
            • You retain rights to your content but grant us license to use it for the Service
            • Our trademarks and brand features may not be used without permission
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            8. Limitation of Liability
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • The Service is provided "as is" without warranties of any kind
            • We are not liable for any indirect, incidental, or consequential damages
            • Our liability is limited to the amount paid for the Service
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            9. Termination
          </Typography>
          <Typography variant="body1" style={styles.text}>
            • You may terminate your account at any time
            • We may terminate or suspend access to the Service immediately for violations
            • Upon termination, you may request a copy of your data
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            10. Changes to Terms
          </Typography>
          <Typography variant="body1" style={styles.text}>
            We reserve the right to modify these terms at any time. We will notify users of any material changes. Continued use of the Service after changes constitutes acceptance of the new terms.
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            11. Contact Information
          </Typography>
          <Typography variant="body1" style={styles.text}>
            For questions about these Terms of Service, please contact our support team through the app or email support@prim.com.
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

export default TermsOfServiceScreen;
