import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';
import { SettingsSection } from '../../components/SettingsComponents';
import { Typography } from '../../components/Typography';

export const PrivacyPolicyScreen = () => {
  return (
    <BaseSettingsScreen
      title="Privacy Policy"
      showSaveButton={false}
    >
      <ScrollView style={styles.container}>
        <SettingsSection>
          <Typography variant="body1" style={styles.text}>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            1. Information We Collect
          </Typography>
          <Typography variant="body1" style={styles.text}>
            We collect information that you provide directly to us, including:
            • Personal information (name, email, phone number)
            • Business information and profiles
            • Payment and transaction data
            • Service-related information
            • Device and usage information
            • Communication preferences
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            2. How We Use Your Information
          </Typography>
          <Typography variant="body1" style={styles.text}>
            We use the collected information for:
            • Providing and improving our services
            • Processing payments and transactions
            • Communicating with you about your account
            • Sending appointment reminders and notifications
            • Marketing and promotional purposes (with your consent)
            • Analytics and business optimization
            • Preventing fraud and ensuring security
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            3. Information Sharing
          </Typography>
          <Typography variant="body1" style={styles.text}>
            We may share your information with:
            • Third-party service providers
            • Payment processors
            • Analytics providers
            • Marketing partners (with your consent)
            • Legal authorities when required
            • Business partners for service delivery
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            4. Data Security
          </Typography>
          <Typography variant="body1" style={styles.text}>
            We implement appropriate technical and organizational security measures to protect your information, including:
            • Encryption of sensitive data
            • Regular security assessments
            • Access controls and authentication
            • Secure data storage and transmission
            • Regular security updates
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            5. Your Rights and Choices
          </Typography>
          <Typography variant="body1" style={styles.text}>
            You have the right to:
            • Access your personal information
            • Correct inaccurate data
            • Request deletion of your data
            • Opt-out of marketing communications
            • Export your data
            • Withdraw consent
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            6. Data Retention
          </Typography>
          <Typography variant="body1" style={styles.text}>
            We retain your information for as long as necessary to:
            • Provide our services
            • Comply with legal obligations
            • Resolve disputes
            • Enforce our agreements
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            7. Children's Privacy
          </Typography>
          <Typography variant="body1" style={styles.text}>
            Our services are not intended for children under 13. We do not knowingly collect or maintain information from children under 13 years of age.
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            8. International Data Transfers
          </Typography>
          <Typography variant="body1" style={styles.text}>
            Your information may be transferred and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            9. Changes to Privacy Policy
          </Typography>
          <Typography variant="body1" style={styles.text}>
            We may update this Privacy Policy from time to time. We will notify you of any material changes through the app or by email.
          </Typography>

          <Typography variant="h2" style={styles.heading}>
            10. Contact Us
          </Typography>
          <Typography variant="body1" style={styles.text}>
            If you have questions about this Privacy Policy or our privacy practices, please contact our Privacy Team at privacy@prim.com.
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
