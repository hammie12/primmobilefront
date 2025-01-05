import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Typography } from '../../components/Typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const DepositInformationScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="cash-lock" size={40} color="#FF5722" />
          <Typography variant="h1" style={styles.title}>
            Deposit Information
          </Typography>
        </View>

        <View style={styles.section}>
          <Typography variant="h2" style={styles.sectionTitle}>
            What is a deposit?
          </Typography>
          <Typography variant="body1" style={styles.text}>
            A deposit is a partial upfront payment required to secure your booking with a professional. 
            This helps ensure commitment from both parties and protects against last-minute cancellations.
          </Typography>
        </View>

        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information" size={24} color="#FF5722" />
          <Typography variant="body1" style={styles.infoText}>
            Deposits are typically 20-50% of the service price and are deducted from the final payment.
          </Typography>
        </View>

        <View style={styles.section}>
          <Typography variant="h2" style={styles.sectionTitle}>
            When is it charged?
          </Typography>
          <Typography variant="body1" style={styles.text}>
            The deposit is charged at the time of booking. You'll see the deposit amount clearly displayed 
            before confirming your appointment.
          </Typography>
        </View>

        <View style={styles.section}>
          <Typography variant="h2" style={styles.sectionTitle}>
            Refund Policy
          </Typography>
          <View style={styles.policyItem}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
            <Typography variant="body1" style={styles.policyText}>
              Full refund if cancelled 24+ hours before appointment
            </Typography>
          </View>
          <View style={styles.policyItem}>
            <MaterialCommunityIcons name="alert-circle" size={20} color="#FFA000" />
            <Typography variant="body1" style={styles.policyText}>
              50% refund if cancelled 12-24 hours before appointment
            </Typography>
          </View>
          <View style={styles.policyItem}>
            <MaterialCommunityIcons name="close-circle" size={20} color="#F44336" />
            <Typography variant="body1" style={styles.policyText}>
              No refund if cancelled less than 12 hours before appointment
            </Typography>
          </View>
        </View>

        <View style={styles.section}>
          <Typography variant="h2" style={styles.sectionTitle}>
            Payment Security
          </Typography>
          <Typography variant="body1" style={styles.text}>
            All payments are processed securely through our payment provider. Your financial information 
            is encrypted and never stored on our servers.
          </Typography>
        </View>

        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="shield-check" size={24} color="#4CAF50" />
          <Typography variant="body1" style={styles.infoText}>
            Your deposit is held securely until your appointment is completed or cancelled according to our refund policy.
          </Typography>
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF8F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFE5E0',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
  },
  policyText: {
    marginLeft: 12,
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
}); 