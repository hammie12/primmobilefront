import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BusinessTopBar } from '../../components/BusinessTopBar';
import { BusinessNavigationBar } from '../../components/BusinessNavigationBar';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';

export const DepositSettingsScreen = () => {
  const [depositSettings, setDepositSettings] = useState({
    requireDeposit: true,
    depositType: 'percentage',
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
    <BaseSettingsScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Deposit Settings</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <MaterialCommunityIcons name="content-save" size={24} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scheduleContainer}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.settingsContainer}>
            <View style={styles.settingRow}>
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
                  <View style={styles.settingRow}>
                    <Text style={styles.label}>Deposit Percentage</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={depositSettings.depositPercentage}
                        onChangeText={(text) =>
                          setDepositSettings({ ...depositSettings, depositPercentage: text })
                        }
                        placeholder="Enter percentage"
                        keyboardType="numeric"
                      />
                      <Text style={styles.inputSymbol}>%</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.settingRow}>
                    <Text style={styles.label}>Fixed Deposit Amount</Text>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputSymbol}>£</Text>
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

                <View style={styles.settingRow}>
                  <Text style={styles.label}>Minimum Booking Value</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputSymbol}>£</Text>
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

                <View style={styles.settingRow}>
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
                  <View style={styles.settingRow}>
                    <Text style={styles.label}>Refund Period</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={depositSettings.refundPeriod}
                        onChangeText={(text) =>
                          setDepositSettings({ ...depositSettings, refundPeriod: text })
                        }
                        placeholder="Enter hours"
                        keyboardType="numeric"
                      />
                      <Text style={styles.inputSymbol}>hrs</Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </BaseSettingsScreen>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
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
  scheduleContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  settingsContainer: {
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingHorizontal: 12,
    flex: 1,
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333333',
  },
  inputSymbol: {
    fontSize: 14,
    color: '#666666',
    marginHorizontal: 4,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
    marginVertical: 16,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
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
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  segmentButtonTextActive: {
    color: '#FF5722',
    fontWeight: '600',
  },
});

