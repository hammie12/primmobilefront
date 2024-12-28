import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';
import { Typography } from '../../components/Typography';

export const CancellationPolicyScreen = () => {
  const [policy, setPolicy] = useState({
    enabled: true,
    noticePeriod: '24',
    refundPercentage: '50',
    customMessage: '',
  });

  const handleSave = () => {
    Alert.alert('Success', 'Cancellation policy saved successfully');
  };

  return (
    <BaseSettingsScreen 
      title="Cancellation Policy"
      onSave={handleSave}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <Typography variant="body1" style={styles.label}>
              Enable Cancellation Policy
            </Typography>
            <Switch
              value={policy.enabled}
              onValueChange={(value) => setPolicy({ ...policy, enabled: value })}
              trackColor={{ false: '#767577', true: '#FF5722' }}
              thumbColor={policy.enabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          {policy.enabled && (
            <>
              <View style={styles.inputGroup}>
                <Typography variant="body2" style={styles.label}>
                  Notice Period (hours)
                </Typography>
                <TextInput
                  style={styles.input}
                  value={policy.noticePeriod}
                  onChangeText={(text) => setPolicy({ ...policy, noticePeriod: text })}
                  placeholder="Enter notice period in hours"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Typography variant="body2" style={styles.label}>
                  Refund Percentage
                </Typography>
                <View style={styles.percentageInput}>
                  <TextInput
                    style={styles.input}
                    value={policy.refundPercentage}
                    onChangeText={(text) => setPolicy({ ...policy, refundPercentage: text })}
                    placeholder="Enter refund percentage"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                  <Typography variant="body1" style={styles.percentageSymbol}>
                    %
                  </Typography>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Typography variant="body2" style={styles.label}>
                  Custom Message
                </Typography>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={policy.customMessage}
                  onChangeText={(text) => setPolicy({ ...policy, customMessage: text })}
                  placeholder="Enter custom cancellation message"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor="#999"
                />
              </View>
            </>
          )}
        </View>
      </View>
    </BaseSettingsScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#F8F8F8',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  percentageInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentageSymbol: {
    marginLeft: 8,
    color: '#333333',
  },
});
