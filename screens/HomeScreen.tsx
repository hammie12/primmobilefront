import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BusinessNavigationBar } from '../components/BusinessNavigationBar';
import { BusinessTopBar } from '../components/BusinessTopBar';
import { LinearGradient } from 'expo-linear-gradient';

export const HomeScreen = () => {
  const navigation = useNavigation();

  const renderMetricCard = (title: string, value: string, icon: string) => (
    <View style={styles.metricCard}>
      <MaterialCommunityIcons name={icon as any} size={24} color="#FF5722" />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
    </View>
  );

  const renderActionCard = (icon: string, title: string, onPress: () => void) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={24} color="#FF5722" />
      <Text style={styles.actionText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <BusinessTopBar />
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {/* Metrics Section */}
          <View style={styles.metricsContainer}>
            {renderMetricCard('Today\'s Bookings', '8', 'calendar-today')}
            {renderMetricCard('Revenue', '$450', 'cash')}
            {renderMetricCard('New Clients', '3', 'account-plus')}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {renderActionCard('calendar-plus', 'New Booking', () => navigation.navigate('BusinessBookings'))}
              {renderActionCard('account-multiple', 'Clients', () => navigation.navigate('Clients'))}
              {renderActionCard('chart-bar', 'Analytics', () => navigation.navigate('BusinessAnalytics'))}
              {renderActionCard('cog', 'Settings', () => navigation.navigate('BusinessSettings'))}
            </View>
          </View>

          {/* Upcoming Appointments */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <View style={styles.appointmentCard}>
              <View style={styles.appointmentHeader}>
                <Text style={styles.appointmentTime}>2:30 PM</Text>
                <Text style={styles.appointmentStatus}>Confirmed</Text>
              </View>
              <Text style={styles.appointmentClient}>Sarah Johnson</Text>
              <Text style={styles.appointmentService}>Hair Styling - 1h</Text>
            </View>
          </View>

          {/* Business Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Management</Text>
            <View style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <MaterialCommunityIcons name="image-multiple" size={24} color="#FF5722" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Service Gallery</Text>
                <Text style={styles.menuDescription}>Manage your business services and pricing</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666666" />
            </View>
            <View style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <MaterialCommunityIcons name="clock-outline" size={24} color="#FF5722" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Business Hours</Text>
                <Text style={styles.menuDescription}>Set your business availability and working hours</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666666" />
            </View>
          </View>
        </View>
      </ScrollView>
      <BusinessNavigationBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#1A1A1A',
  },
  metricTitle: {
    fontSize: 12,
    color: '#666666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#1A1A1A',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF3F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#666666',
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  appointmentStatus: {
    fontSize: 14,
    color: '#4CAF50',
  },
  appointmentClient: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  appointmentService: {
    fontSize: 14,
    color: '#666666',
  },
});