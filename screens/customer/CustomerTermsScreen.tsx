import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/Typography';

export const CustomerTermsScreen = () => {
  const sections = [
    {
      title: 'Acceptance of Terms',
      content: `By accessing or using the Priim mobile application ("App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.`,
    },
    {
      title: 'Service Description',
      content: `Priim provides a platform connecting customers with beauty and wellness service providers. We do not provide the services directly but facilitate the booking and payment process between customers and service providers.`,
    },
    {
      title: 'User Accounts',
      content: `• You must create an account to use our services
• You are responsible for maintaining the confidentiality of your account
• You must provide accurate and complete information
• You must be at least 18 years old to create an account
• You are responsible for all activities under your account`,
    },
    {
      title: 'Booking and Cancellation',
      content: `• Bookings are subject to service provider availability
• Payment is required at the time of booking
• Cancellation policies vary by service provider
• Late cancellations may incur fees
• No-shows may result in full charge`,
    },
    {
      title: 'PriimPoints Program',
      content: `• Earn 50 PriimPoints for every £50 spent
• Points can be redeemed for discounts
• Points have no cash value
• Points expire after 12 months of inactivity
• We reserve the right to modify the program`,
    },
    {
      title: 'Payment Terms',
      content: `• All prices are in GBP
• Payment is processed securely through our platform
• We accept major credit cards and digital payments
• Refunds are subject to cancellation policy
• Additional fees may apply for certain services`,
    },
    {
      title: 'User Conduct',
      content: `You agree not to:
• Violate any laws or regulations
• Harass service providers or other users
• Provide false information
• Attempt to gain unauthorized access
• Use the app for any illegal purpose`,
    },
    {
      title: 'Intellectual Property',
      content: `• The App and its content are owned by Priim
• You may not copy or modify the App
• You may not use our trademarks without permission
• You retain rights to your user content
• You grant us license to use your feedback`,
    },
    {
      title: 'Limitation of Liability',
      content: `• We are not liable for service provider actions
• We do not guarantee service availability
• We are not responsible for indirect damages
• Our liability is limited to fees paid
• Some jurisdictions may not allow these limitations`,
    },
    {
      title: 'Changes to Terms',
      content: `We may update these terms at any time. Continued use of the App after changes constitutes acceptance of new terms. We will notify users of significant changes.`,
    },
    {
      title: 'Contact Information',
      content: `For questions about these terms, contact us at:

legal@priim.com
+44 (0) 20 1234 5678

Priim Limited
123 Business Street
London, EC1A 1BB
United Kingdom`,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Typography variant="h1" style={styles.title}>
            Terms of Service
          </Typography>
          <Typography variant="body2" style={styles.lastUpdated}>
            Last updated: May 2024
          </Typography>
        </View>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Typography variant="h2" style={styles.sectionTitle}>
              {section.title}
            </Typography>
            <Typography variant="body1" style={styles.sectionContent}>
              {section.content}
            </Typography>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  lastUpdated: {
    color: '#666666',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
  },
  sectionContent: {
    lineHeight: 24,
    color: '#666666',
  },
});
