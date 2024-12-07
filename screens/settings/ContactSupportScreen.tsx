import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';

export const ContactSupportScreen = ({ navigation }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');

  const categories = [
    'Account Issues',
    'Booking Problems',
    'Payment Issues',
    'Technical Support',
    'Feature Request',
    'Other',
  ];

  const CategorySelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScroll}
    >
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat}
          style={[
            styles.categoryChip,
            category === cat && styles.categoryChipSelected,
          ]}
          onPress={() => setCategory(cat)}
        >
          <Text
            style={[
              styles.categoryText,
              category === cat && styles.categoryTextSelected,
            ]}
          >
            {cat}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const QuickHelp = () => (
    <View style={styles.quickHelpSection}>
      <Text style={styles.quickHelpTitle}>Quick Help</Text>
      <View style={styles.quickHelpGrid}>
        <TouchableOpacity style={styles.quickHelpItem}>
          <View style={styles.quickHelpIcon}>
            <Ionicons name="call-outline" size={24} color="#FF5722" />
          </View>
          <Text style={styles.quickHelpText}>Call Us</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickHelpItem}>
          <View style={styles.quickHelpIcon}>
            <Ionicons name="chatbubbles-outline" size={24} color="#FF5722" />
          </View>
          <Text style={styles.quickHelpText}>Live Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickHelpItem}>
          <View style={styles.quickHelpIcon}>
            <Ionicons name="help-circle-outline" size={24} color="#FF5722" />
          </View>
          <Text style={styles.quickHelpText}>FAQ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <BaseSettingsScreen title="Contact Support" navigation={navigation}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <QuickHelp />

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Send us a message</Text>
            <View style={styles.form}>
              <Text style={styles.label}>Category</Text>
              <CategorySelector />

              <Text style={styles.label}>Subject</Text>
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="Brief description of your issue"
                placeholderTextColor="#666"
              />

              <Text style={styles.label}>Message</Text>
              <TextInput
                style={styles.messageInput}
                value={message}
                onChangeText={setMessage}
                placeholder="Describe your issue in detail..."
                placeholderTextColor="#666"
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity style={styles.attachButton}>
                <Ionicons name="attach" size={24} color="#FF5722" />
                <Text style={styles.attachButtonText}>Add Attachment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!subject || !message || !category) && styles.submitButtonDisabled,
                ]}
                disabled={!subject || !message || !category}
              >
                <Text style={styles.submitButtonText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BaseSettingsScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  quickHelpSection: {
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
  quickHelpTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  quickHelpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickHelpItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  quickHelpIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickHelpText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  formSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  categoryScroll: {
    flexGrow: 0,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  categoryTextSelected: {
    color: '#FF5722',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  messageInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 16,
    height: 120,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    marginBottom: 16,
  },
  attachButtonText: {
    fontSize: 16,
    color: '#FF5722',
    fontWeight: '500',
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#FF5722',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
