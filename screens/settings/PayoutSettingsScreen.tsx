import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';
import { Typography } from '../../components/Typography';
import { SettingsSection } from '../../components/SettingsSection';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

type PayoutScheduleOptionProps = {
  title: string;
  value: 'instant' | 'daily' | 'weekly';
  description: string;
};

export const PayoutSettingsScreen: React.FC = () => {
  const { user } = useAuth();
  const [payoutSchedule, setPayoutSchedule] = useState<'instant' | 'daily' | 'weekly'>('instant');
  const [minimumPayout, setMinimumPayout] = useState('50');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPayoutSettings();
    }
  }, [user]);

  const loadPayoutSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('payout_schedule, minimum_payout')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setPayoutSchedule(data.payout_schedule || 'instant');
        setMinimumPayout(data.minimum_payout?.toString() || '50');
      }
    } catch (error) {
      console.error('Error loading payout settings:', error);
      Alert.alert('Error', 'Failed to load payout settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const { error } = await supabase
        .from('professionals')
        .update({
          payout_schedule: payoutSchedule,
          minimum_payout: parseInt(minimumPayout),
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      Alert.alert('Success', 'Payout settings updated successfully');
    } catch (error) {
      console.error('Error saving payout settings:', error);
      Alert.alert('Error', 'Failed to save payout settings');
    }
  };

  const PayoutScheduleOption: React.FC<PayoutScheduleOptionProps> = ({ title, value, description }) => (
    <TouchableOpacity
      style={[
        styles.optionContainer,
        payoutSchedule === value && styles.selectedOption,
      ]}
      onPress={() => setPayoutSchedule(value)}
    >
      <View style={styles.optionContent}>
        <View style={styles.optionHeader}>
          <Typography variant="body1" style={styles.optionTitle}>
            {title}
          </Typography>
          {payoutSchedule === value && (
            <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
          )}
        </View>
        <Typography variant="body2" style={styles.optionDescription}>
          {description}
        </Typography>
      </View>
    </TouchableOpacity>
  );

  return (
    <BaseSettingsScreen 
      title="Payout Settings"
      onSave={handleSaveSettings}
      showSaveButton
    >
      <ScrollView style={styles.container}>
        <SettingsSection>
          <Typography variant="h2" style={styles.sectionTitle}>
            Payout Schedule
          </Typography>
          
          <PayoutScheduleOption
            title="Instant Payouts"
            value="instant"
            description="Receive payments immediately after service completion (small fee applies)"
          />
          
          <PayoutScheduleOption
            title="Daily Payouts"
            value="daily"
            description="Receive accumulated payments every day"
          />
          
          <PayoutScheduleOption
            title="Weekly Payouts"
            value="weekly"
            description="Receive accumulated payments every Monday"
          />
        </SettingsSection>

        <SettingsSection>
          <Typography variant="h2" style={styles.sectionTitle}>
            Minimum Payout Amount
          </Typography>
          
          <View style={styles.infoContainer}>
            <Typography variant="body1" style={styles.infoText}>
              • Minimum amount required for payout: £{minimumPayout}
            </Typography>
            <Typography variant="body1" style={styles.infoText}>
              • Amounts below minimum will roll over
            </Typography>
            <Typography variant="body1" style={styles.infoText}>
              • Instant payouts have no minimum
            </Typography>
          </View>
        </SettingsSection>

        <SettingsSection>
          <Typography variant="h2" style={styles.sectionTitle}>
            Bank Account
          </Typography>
          
          <TouchableOpacity
            style={styles.bankButton}
            onPress={() => Alert.alert('Info', 'Please manage your bank account in Stripe Dashboard')}
          >
            <MaterialCommunityIcons name="bank" size={24} color="#FF5722" />
            <Typography variant="body1" style={styles.bankButtonText}>
              Manage Bank Account
            </Typography>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666666" />
          </TouchableOpacity>
        </SettingsSection>
      </ScrollView>
    </BaseSettingsScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333333',
  },
  optionContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedOption: {
    backgroundColor: '#FFF5F2',
    borderColor: '#FF5722',
    borderWidth: 1,
  },
  optionContent: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666666',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
  },
  infoText: {
    color: '#666666',
    marginBottom: 8,
  },
  bankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
  },
  bankButtonText: {
    flex: 1,
    marginLeft: 12,
    color: '#333333',
  },
}); 