import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BusinessTopBar } from '../components/BusinessTopBar';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../supabase/client';

// Define the navigation param list type
type RootStackParamList = {
  BusinessBookings: undefined;
  BusinessHours: undefined;
  ProfessionalProfile: undefined;
  DepositSettings: undefined;
  // Add other screen names as needed
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    bookingsToday: 0,
    revenueToday: 0,
    totalClients: 0,
  });
  const [professionalId, setProfessionalId] = useState<string | null>(null);

  // First fetch the professional profile ID for the current user
  useEffect(() => {
    const fetchProfessionalId = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from('professional_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        
        if (profile) {
          setProfessionalId(profile.id);
        }
      } catch (error) {
        console.error('Error fetching professional profile:', error);
        Alert.alert('Error', 'Failed to load professional information');
      }
    };

    fetchProfessionalId();
  }, [user]);

  // Then fetch metrics using the professional ID
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!professionalId) return;

      try {
        // Get today's start and end timestamps in ISO format
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Fetch today's bookings and revenue
        const { data: todayBookings, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            service_id,
            services (
              price
            )
          `)
          .eq('professional_id', professionalId)
          .gte('start_time', today.toISOString())
          .lt('start_time', tomorrow.toISOString());

        if (bookingsError) throw bookingsError;

        // Calculate today's revenue
        const revenueToday = todayBookings?.reduce((sum, booking) => {
          return sum + ((booking.services as any)?.price || 0);
        }, 0) || 0;

        // Fetch total unique clients (all time)
        const { data: uniqueClients, error: clientsError } = await supabase
          .from('bookings')
          .select('customer_id')
          .eq('professional_id', professionalId)
          .not('customer_id', 'is', null);

        if (clientsError) throw clientsError;

        // Count unique customer IDs
        const uniqueCustomerIds = new Set(uniqueClients?.map(b => b.customer_id));
        
        setMetrics({
          bookingsToday: todayBookings?.length || 0,
          revenueToday: revenueToday,
          totalClients: uniqueCustomerIds.size
        });

      } catch (error) {
        console.error('Error fetching metrics:', error);
        Alert.alert('Error', 'Failed to load metrics. Please try again.');
      }
    };

    if (professionalId) {
      fetchMetrics();
      // Set up an interval to refresh metrics every minute
      const interval = setInterval(fetchMetrics, 60000);
      return () => clearInterval(interval);
    }
  }, [professionalId]);

  const renderMetricCard = (title: string, value: string, icon: keyof typeof MaterialCommunityIcons.glyphMap) => (
    <View style={styles.metricCard}>
      <MaterialCommunityIcons name={icon} size={24} color="#FF5722" />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
    </View>
  );

  const renderActionCard = (
    icon: keyof typeof MaterialCommunityIcons.glyphMap,
    title: string,
    onPress: () => void
  ) => (
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
            {renderMetricCard('Bookings Today', metrics.bookingsToday.toString(), 'calendar-today')}
            {renderMetricCard('Revenue Made Today', `£${metrics.revenueToday.toFixed(2)}`, 'cash')}
            {renderMetricCard('Total Clients', metrics.totalClients.toString(), 'account-plus')}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {renderActionCard('calendar-plus', 'New Booking', () => navigation.navigate('BusinessBookings'))}
              {renderActionCard('clock', 'Edit Business Hours', () => navigation.navigate('BusinessHours'))}
              {renderActionCard('tag-multiple', 'Edit Services & Pricing', () => navigation.navigate('ProfessionalProfile'))}
              {renderActionCard('cash', 'Edit Deposit Settings', () => navigation.navigate('DepositSettings'))}
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
    paddingBottom: Platform.OS === 'ios' ? 140 : 120,
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
    justifyContent: 'center',
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
    textAlign: 'center',
  },
  metricTitle: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 4,
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