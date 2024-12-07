import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';
import { SettingsSection, SettingsRow } from '../../components/SettingsComponents';
import { Ionicons } from '@expo/vector-icons';

export const HelpCentreScreen = () => {
  const navigation = useNavigation();

  const helpTopics = [
    {
      title: 'Getting Started',
      icon: 'rocket-outline',
      screen: 'GettingStarted',
    },
    {
      title: 'Booking Management',
      icon: 'calendar-outline',
      screen: 'BookingHelp',
    },
    {
      title: 'Payments & Billing',
      icon: 'card-outline',
      screen: 'PaymentHelp',
    },
    {
      title: 'Account Settings',
      icon: 'settings-outline',
      screen: 'AccountHelp',
    },
    {
      title: 'Troubleshooting',
      icon: 'build-outline',
      screen: 'Troubleshooting',
    },
  ];

  return (
    <BaseSettingsScreen
      title="Help Centre"
      showSaveButton={false}
    >
      <ScrollView style={styles.container}>
        <SettingsSection title="Popular Topics">
          {helpTopics.map((topic, index) => (
            <SettingsRow
              key={index}
              label={topic.title}
              icon={
                <Ionicons
                  name={topic.icon as any}
                  size={24}
                  color="#666"
                />
              }
              onPress={() => {
                // Navigate to specific help topic
                // navigation.navigate(topic.screen);
              }}
            />
          ))}
        </SettingsSection>

        <SettingsSection title="Contact Support">
          <SettingsRow
            label="Contact Us"
            onPress={() => navigation.navigate('ContactSupport')}
          />
        </SettingsSection>
      </ScrollView>
    </BaseSettingsScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HelpCentreScreen;
