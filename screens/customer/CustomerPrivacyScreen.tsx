import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/Typography';

export const CustomerPrivacyScreen = () => {
  const sections = [
    {
      title: 'Information We Collect',
      content: `We collect information that you provide directly to us, including:
• Personal information (name, email address, phone number)
• Payment information
• Location data
• Service preferences and history
• Device information and usage data`,
    },
    {
      title: 'How We Use Your Information',
      content: `We use the information we collect to:
• Provide and improve our services
• Process your bookings and payments
• Send you important updates and notifications
• Personalize your experience
• Maintain the security of our platform`,
    },
    {
      title: 'Information Sharing',
      content: `We may share your information with:
• Service providers you book with
• Payment processors
• Analytics providers
• Legal authorities when required by law

We never sell your personal information to third parties.`,
    },
    {
      title: 'Your Rights',
      content: `You have the right to:
• Access your personal information
• Correct inaccurate information
• Request deletion of your information
• Opt out of marketing communications
• Export your data`,
    },
    {
      title: 'Data Security',
      content: `We implement appropriate technical and organizational measures to protect your personal information, including:
• Encryption of sensitive data
• Regular security assessments
• Secure data storage
• Employee training on data protection`,
    },
    {
      title: 'Contact Us',
      content: `If you have any questions about our Privacy Policy or how we handle your information, please contact us at:

privacy@priim.com
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
            Privacy Policy
          </Typography>
          <Typography variant="body2" style={styles.lastUpdated}>
            Last updated: May 2024
          </Typography>
        </View>

        <Typography variant="body1" style={styles.introduction}>
          At Priim, we take your privacy seriously. This Privacy Policy explains how
          we collect, use, and protect your personal information when you use our
          mobile application and services.
        </Typography>

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
  introduction: {
    padding: 16,
    lineHeight: 24,
    color: '#333333',
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
