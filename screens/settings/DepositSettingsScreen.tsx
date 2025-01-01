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

export const DepositSettingsScreen = () => {
  const [depositSettings, setDepositSettings] = useState({
    requireDeposit: true,
    depositType: 'percentage', // 'percentage' or 'fixed'
    depositPercentage: '20',
    depositAmount: '10',
    minimumBookingValue: '50',
    refundable: true,
    refundPeriod: '24',
  });

  const handleSave = () => {
    Alert.alert('Success', 'Deposit settings saved successfully');
  };

  return (
    <>
      <BusinessTopBar />
      <BaseSettingsScreen>
        <View style={styles.header}>
          <Text style={styles.title}>Deposit Settings</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <MaterialCommunityIcons name="content-save" size={24} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Require Deposit</Text>
            <Switch
              value={depositSettings.requireDeposit}
              onValueChange={(value) => 
                setDepositSettings({ ...depositSettings, requireDeposit: value })
              }
              trackColor={{ false: '#767577', true: '#FF5722' }}
              thumbColor={depositSettings.requireDeposit ? '#fff' : '#f4f3f4'}
            />
          </View>

          {depositSettings.requireDeposit && (
            <>
              <View style={styles.segmentedControl}>
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    depositSettings.depositType === 'percentage' && styles.segmentButtonActive,
                  ]}
                  onPress={() => 
                    setDepositSettings({ ...depositSettings, depositType: 'percentage' })
                  }
                >
                  <Text style={[
                    styles.segmentButtonText,
                    depositSettings.depositType === 'percentage' && styles.segmentButtonTextActive,
                  ]}>Percentage</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    depositSettings.depositType === 'fixed' && styles.segmentButtonActive,
                  ]}
                  onPress={() => 
                    setDepositSettings({ ...depositSettings, depositType: 'fixed' })
                  }
                >
                  <Text style={[
                    styles.segmentButtonText,
                    depositSettings.depositType === 'fixed' && styles.segmentButtonTextActive,
                  ]}>Fixed Amount</Text>
                </TouchableOpacity>
              </View>

              {depositSettings.depositType === 'percentage' ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Deposit Percentage</Text>
                  <View style={styles.percentageInput}>
                    <TextInput
                      style={styles.input}
                      value={depositSettings.depositPercentage}
                      onChangeText={(text) =>
                        setDepositSettings({ ...depositSettings, depositPercentage: text })
                      }
                      placeholder="Enter percentage"
                      keyboardType="numeric"
                    />
                    <Text style={styles.percentageSymbol}>%</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Fixed Deposit Amount (£)</Text>
                  <View style={styles.currencyInput}>
                    <Text style={styles.currencySymbol}>£</Text>
                    <TextInput
                      style={styles.input}
                      value={depositSettings.depositAmount}
                      onChangeText={(text) =>
                        setDepositSettings({ ...depositSettings, depositAmount: text })
                      }
                      placeholder="Enter amount"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Minimum Booking Value for Deposit (£)</Text>
                <View style={styles.currencyInput}>
                  <Text style={styles.currencySymbol}>£</Text>
                  <TextInput
                    style={styles.input}
                    value={depositSettings.minimumBookingValue}
                    onChangeText={(text) =>
                      setDepositSettings({ ...depositSettings, minimumBookingValue: text })
                    }
                    placeholder="Enter minimum value"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.label}>Refundable Deposit</Text>
                <Switch
                  value={depositSettings.refundable}
                  onValueChange={(value) =>
                    setDepositSettings({ ...depositSettings, refundable: value })
                  }
                  trackColor={{ false: '#767577', true: '#FF5722' }}
                  thumbColor={depositSettings.refundable ? '#fff' : '#f4f3f4'}
                />
              </View>

              {depositSettings.refundable && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Refund Period (hours)</Text>
                  <TextInput
                    style={styles.input}
                    value={depositSettings.refundPeriod}
                    onChangeText={(text) =>
                      setDepositSettings({ ...depositSettings, refundPeriod: text })
                    }
                    placeholder="Enter hours"
                    keyboardType="numeric"
                  />
                </View>
              )}
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
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333333',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 10,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  percentageInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 4,
  },
  percentageSymbol: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  currencyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 4,
  },
  currencySymbol: {
    marginRight: 12,
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 24,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  segmentButtonText: {
    fontSize: 15,
    color: '#666666',
    fontWeight: '500',
  },
  segmentButtonTextActive: {
    color: '#FF5722',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#FF5722',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
