import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Typography } from '../../components/Typography';

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

export const CustomerHelpScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I book a service?',
      answer: 'To book a service, navigate to the Search tab, browse available services or search for a specific one, select your preferred time slot, and confirm your booking. You can pay using your saved payment methods.',
    },
    {
      id: '2',
      question: 'How does the PriimPoints system work?',
      answer: 'You earn 50 PriimPoints for every £50 spent on services. Once you accumulate 250 points (equivalent to 5 bookings of £50), you can redeem them for a 20% discount on your next appointment.',
    },
    {
      id: '3',
      question: 'How can I cancel or reschedule my booking?',
      answer: 'You can manage your bookings in the Bookings tab. Select the booking you want to modify and choose either "Cancel" or "Reschedule". Please note that cancellation policies may apply depending on how close to the appointment time you make changes.',
    },
    {
      id: '4',
      question: 'Is my payment information secure?',
      answer: 'Yes, we use industry-standard encryption and security measures to protect your payment information. We never store your complete card details on our servers.',
    },
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFAQItem = (item: FAQItem) => {
    const isExpanded = expandedId === item.id;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.faqItem}
        onPress={() => setExpandedId(isExpanded ? null : item.id)}
      >
        <View style={styles.faqHeader}>
          <Typography variant="body1" style={styles.question}>
            {item.question}
          </Typography>
          <MaterialCommunityIcons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#666666"
          />
        </View>
        {isExpanded && (
          <Typography variant="body2" style={styles.answer}>
            {item.answer}
          </Typography>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={24} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search help articles..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.section}>
          <Typography variant="h2" style={styles.sectionTitle}>
            Contact Support
          </Typography>
          <View style={styles.supportOptions}>
            <TouchableOpacity style={styles.supportOption}>
              <View style={styles.supportIconContainer}>
                <MaterialCommunityIcons name="chat" size={24} color="#FF5722" />
              </View>
              <Typography variant="body1">Live Chat</Typography>
            </TouchableOpacity>
            <TouchableOpacity style={styles.supportOption}>
              <View style={styles.supportIconContainer}>
                <MaterialCommunityIcons name="email" size={24} color="#FF5722" />
              </View>
              <Typography variant="body1">Email Us</Typography>
            </TouchableOpacity>
            <TouchableOpacity style={styles.supportOption}>
              <View style={styles.supportIconContainer}>
                <MaterialCommunityIcons name="phone" size={24} color="#FF5722" />
              </View>
              <Typography variant="body1">Call Us</Typography>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Typography variant="h2" style={styles.sectionTitle}>
            Frequently Asked Questions
          </Typography>
          <View style={styles.faqList}>
            {filteredFaqs.map(renderFAQItem)}
          </View>
        </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F8F8',
    margin: 16,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  supportOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  supportOption: {
    alignItems: 'center',
  },
  supportIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  faqList: {
    paddingHorizontal: 16,
  },
  faqItem: {
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  answer: {
    marginTop: 12,
    color: '#666666',
    lineHeight: 20,
  },
});
