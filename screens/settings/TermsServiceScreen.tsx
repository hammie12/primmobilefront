import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import BaseSettingsScreen from '../../components/BaseSettingsScreen';

const TermsServiceScreen = ({ navigation }) => {
  const sections = [
    {
      title: 'Terms of Service',
      content: 'Last updated: January 2024',
    },
    {
      title: '1. Acceptance of Terms',
      content: `By accessing and using the PrimMobile application ("the App"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the App.`,
    },
    {
      title: '2. Use of Service',
      content: `The App provides a platform for service providers to manage their business operations. You agree to use the App only for its intended purposes and in compliance with all applicable laws and regulations.`,
    },
    {
      title: '3. User Accounts',
      content: `You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.`,
    },
    {
      title: '4. Service Provider Obligations',
      content: `As a service provider, you agree to:
• Provide accurate and up-to-date information
• Maintain appropriate business licenses and permits
• Honor your commitments to clients
• Maintain professional standards of service
• Comply with all applicable laws and regulations`,
    },
    {
      title: '5. Payments and Fees',
      content: `Service providers are responsible for setting their own prices and managing their payment processes. PrimMobile may charge service fees for use of the platform, which will be clearly communicated.`,
    },
    {
      title: '6. Cancellation Policy',
      content: `Service providers must establish and communicate clear cancellation policies to their clients. PrimMobile reserves the right to mediate disputes between service providers and clients.`,
    },
    {
      title: '7. Intellectual Property',
      content: `The App and its original content, features, and functionality are owned by PrimMobile and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.`,
    },
    {
      title: '8. Limitation of Liability',
      content: `PrimMobile shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the App.`,
    },
    {
      title: '9. Changes to Terms',
      content: `We reserve the right to modify these terms at any time. We will notify users of any material changes via the email address associated with their account.`,
    },
    {
      title: '10. Contact Information',
      content: `For questions about these Terms of Service, please contact us at support@primmobile.com`,
    },
  ];

  const Section = ({ title, content }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionContent}>{content}</Text>
    </View>
  );

  return (
    <BaseSettingsScreen title="Terms of Service" navigation={navigation}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {sections.map((section, index) => (
            <Section
              key={index}
              title={section.title}
              content={section.content}
            />
          ))}
        </View>
      </ScrollView>
    </BaseSettingsScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  },
});

export { TermsServiceScreen };
