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

export const BookingRulesScreen = () => {
  const [rules, setRules] = useState({
    minAdvanceTime: '24',
    maxAdvanceTime: '30',
    minBookingLength: '30',
    maxBookingsPerDay: '10',
    allowDoubleBooking: false,
    requireDeposit: true,
    depositAmount: '20',
  });

  const handleSave = () => {
    Alert.alert('Success', 'Booking rules saved successfully');
  };

  return (
    <>
      <BusinessTopBar />
      <BaseSettingsScreen>
        <View style={styles.header}>
          <Text style={styles.title}>Booking Rules</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <MaterialCommunityIcons name="content-save" size={24} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Minimum Advance Booking Time (hours)</Text>
            <TextInput
              style={styles.input}
              value={rules.minAdvanceTime}
              onChangeText={(text) => setRules({ ...rules, minAdvanceTime: text })}
              placeholder="Enter minimum hours"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Maximum Advance Booking Time (days)</Text>
            <TextInput
              style={styles.input}
              value={rules.maxAdvanceTime}
              onChangeText={(text) => setRules({ ...rules, maxAdvanceTime: text })}
              placeholder="Enter maximum days"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Minimum Booking Length (minutes)</Text>
            <TextInput
              style={styles.input}
              value={rules.minBookingLength}
              onChangeText={(text) => setRules({ ...rules, minBookingLength: text })}
              placeholder="Enter minimum minutes"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Maximum Bookings Per Day</Text>
            <TextInput
              style={styles.input}
              value={rules.maxBookingsPerDay}
              onChangeText={(text) => setRules({ ...rules, maxBookingsPerDay: text })}
              placeholder="Enter maximum bookings"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Allow Double Booking</Text>
            <Switch
              value={rules.allowDoubleBooking}
              onValueChange={(value) => setRules({ ...rules, allowDoubleBooking: value })}
              trackColor={{ false: '#767577', true: '#FF5722' }}
              thumbColor={rules.allowDoubleBooking ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Require Deposit</Text>
            <Switch
              value={rules.requireDeposit}
              onValueChange={(value) => setRules({ ...rules, requireDeposit: value })}
              trackColor={{ false: '#767577', true: '#FF5722' }}
              thumbColor={rules.requireDeposit ? '#fff' : '#f4f3f4'}
            />
          </View>

          {rules.requireDeposit && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Deposit Amount (%)</Text>
              <View style={styles.percentageInput}>
                <TextInput
                  style={styles.input}
                  value={rules.depositAmount}
                  onChangeText={(text) => setRules({ ...rules, depositAmount: text })}
                  placeholder="Enter deposit percentage"
                  keyboardType="numeric"
                />
                <Text style={styles.percentageSymbol}>%</Text>
              </View>
            </View>
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
