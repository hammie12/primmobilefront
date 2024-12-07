import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BusinessTopBar } from '../../components/BusinessTopBar';
import { BusinessNavigationBar } from '../../components/BusinessNavigationBar';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';

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
    <>
      <BusinessTopBar />
      <BaseSettingsScreen>
        <View style={styles.header}>
          <Text style={styles.title}>Cancellation Policy</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <MaterialCommunityIcons name="content-save" size={24} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Enable Cancellation Policy</Text>
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
                <Text style={styles.label}>Notice Period (hours)</Text>
                <TextInput
                  style={styles.input}
                  value={policy.noticePeriod}
                  onChangeText={(text) => setPolicy({ ...policy, noticePeriod: text })}
                  placeholder="Enter notice period in hours"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Refund Percentage</Text>
                <View style={styles.percentageInput}>
                  <TextInput
                    style={styles.input}
                    value={policy.refundPercentage}
                    onChangeText={(text) => setPolicy({ ...policy, refundPercentage: text })}
                    placeholder="Enter refund percentage"
                    keyboardType="numeric"
                  />
                  <Text style={styles.percentageSymbol}>%</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Custom Message</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={policy.customMessage}
                  onChangeText={(text) => setPolicy({ ...policy, customMessage: text })}
                  placeholder="Enter custom cancellation message"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </>
          )}
        </View>
      </BaseSettingsScreen>
      <BusinessNavigationBar />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
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
    fontSize: 16,
    color: '#666666',
  },
  saveButton: {
    backgroundColor: '#FF5722',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
