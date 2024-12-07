import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BaseSettingsScreen from '../../components/BaseSettingsScreen';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const HelpCenterScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const faqItems: FAQItem[] = [
    {
      question: 'How do I change my business hours?',
      answer: 'You can change your business hours in Settings > Business Hours. Tap on any day to modify the hours or toggle the day on/off.',
      category: 'Business Settings',
    },
    {
      question: 'How do I manage my bookings?',
      answer: 'Navigate to the Bookings tab to view and manage all your appointments. You can accept, reject, or reschedule bookings from there.',
      category: 'Bookings',
    },
    {
      question: 'How do refunds work?',
      answer: 'Refunds can be processed through the Bookings section. Select the booking and tap "Issue Refund". Refunds typically process in 3-5 business days.',
      category: 'Payments',
    },
    {
      question: 'How do I add services?',
      answer: 'Go to your Professional Profile, scroll to the Services section, and tap the "+" button to add a new service. You can set prices, duration, and description.',
      category: 'Services',
    },
  ];

  const categories = [...new Set(faqItems.map(item => item.category))];

  const filteredFAQs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const FAQItem = ({ item }: { item: FAQItem }) => {
    const isExpanded = expandedItem === item.question;

    return (
      <TouchableOpacity
        style={[styles.faqItem, isExpanded && styles.faqItemExpanded]}
        onPress={() => setExpandedItem(isExpanded ? null : item.question)}
      >
        <View style={styles.faqHeader}>
          <Text style={styles.faqQuestion}>{item.question}</Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#FF5722"
          />
        </View>
        {isExpanded && (
          <Text style={styles.faqAnswer}>{item.answer}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <BaseSettingsScreen title="Help Center" navigation={navigation}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search help articles..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#666"
            />
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ContactSupport')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="chatbubble-outline" size={24} color="#FF5722" />
            </View>
            <Text style={styles.actionText}>Contact Support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIcon}>
              <Ionicons name="book-outline" size={24} color="#FF5722" />
            </View>
            <Text style={styles.actionText}>User Guide</Text>
          </TouchableOpacity>
        </View>

        {categories.map(category => {
          const categoryFAQs = filteredFAQs.filter(item => item.category === category);
          if (categoryFAQs.length === 0) return null;

          return (
            <View key={category} style={styles.section}>
              <Text style={styles.sectionTitle}>{category}</Text>
              <View style={styles.card}>
                {categoryFAQs.map((item, index) => (
                  <FAQItem key={index} item={item} />
                ))}
              </View>
            </View>
          );
        })}

        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Still need help?</Text>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => navigation.navigate('ContactSupport')}
          >
            <Text style={styles.supportButtonText}>Contact Support Team</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </BaseSettingsScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#1a1a1a',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    padding: 16,
  },
  faqItemExpanded: {
    backgroundColor: '#fff',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 16,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    lineHeight: 20,
  },
  supportSection: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  supportButton: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  supportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export { HelpCenterScreen };
