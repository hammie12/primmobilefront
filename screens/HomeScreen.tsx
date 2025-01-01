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
  ProfessionalProfile: { scrollTo?: 'businessHours' | 'services' } | undefined;
  DepositSettings: undefined;
  BusinessAnalytics: undefined;
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
  const [upcomingBookings, setUpcomingBookings] = useState<Array<{
    id: string;
    start_time: string;
    customer_first_name: string | null;
    customer_last_name: string | null;
    service_name: string | null;
    service_duration: number | null;
  }>>([]);

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

  // Add this effect to fetch upcoming bookings
  useEffect(() => {
    const fetchUpcomingBookings = async () => {
      if (!professionalId) return;

      try {
        const { data: bookings, error } = await supabase
          .from('professional_bookings')
          .select(`
            id,
            start_time,
            customer_first_name,
            customer_last_name,
            service_name,
            service_duration
          `)
          .eq('professional_id', professionalId)
          .eq('status', 'CONFIRMED')
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(3);

        if (error) throw error;
        
        setUpcomingBookings(bookings || []);
      } catch (error) {
        console.error('Error fetching upcoming bookings:', error);
        Alert.alert('Error', 'Failed to load upcoming bookings');
      }
    };

    if (professionalId) {
      fetchUpcomingBookings();
      // Refresh bookings every minute
      const interval = setInterval(fetchUpcomingBookings, 60000);
      return () => clearInterval(interval);
    }
  }, [professionalId]);

  // Add this helper function to format the time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderMetricCard = (title: string, value: string, icon: keyof typeof MaterialCommunityIcons.glyphMap) => (
    <LinearGradient
      colors={['#FFFFFF', '#FFF8F6']}
      style={styles.metricCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <MaterialCommunityIcons name={icon} size={28} color="#FF5722" />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
    </LinearGradient>
  );

  const renderActionCard = (
    icon: keyof typeof MaterialCommunityIcons.glyphMap,
    title: string,
    onPress: () => void
  ) => (
    <TouchableOpacity 
      style={styles.actionCard} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.actionIconContainer}>
        <MaterialCommunityIcons name={icon} size={24} color="#FF5722" />
      </View>
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
              {renderActionCard('calendar-plus', 'Bookings', () => navigation.navigate('BusinessBookings'))}
              {renderActionCard('clock', 'Edit Business Hours', () => navigation.navigate('ProfessionalProfile', { scrollTo: 'businessHours' }))}
              {renderActionCard('tag-multiple', 'Edit Services & Pricing', () => navigation.navigate('ProfessionalProfile', { scrollTo: 'services' }))}
              {renderActionCard('cash', 'Edit Deposit Settings', () => navigation.navigate('DepositSettings'))}
            </View>
          </View>

          {/* Upcoming Appointments */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <View key={booking.id} style={styles.appointmentCard}>
                  <LinearGradient
                    colors={['#FFFFFF', '#FFF8F6']}
                    style={styles.appointmentGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.appointmentHeader}>
                      <Text style={styles.appointmentTime}>{formatTime(booking.start_time)}</Text>
                      <View style={styles.statusBadge}>
                        <Text style={styles.appointmentStatus}>Confirmed</Text>
                      </View>
                    </View>
                    <Text style={styles.appointmentClient}>
                      {`${booking.customer_first_name} ${booking.customer_last_name}`}
                    </Text>
                    <Text style={styles.appointmentService}>
                      {`${booking.service_name} - ${booking.service_duration}min`}
                    </Text>
                  </LinearGradient>
                </View>
              ))
            ) : (
              <View style={styles.appointmentCard}>
                <Text style={styles.noAppointments}>No upcoming appointments</Text>
              </View>
            )}
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
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    minHeight: 120,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 8,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  metricTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
    marginTop: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF3F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
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
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  appointmentGradient: {
    padding: 16,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  appointmentStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  appointmentTime: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  appointmentClient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  appointmentService: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  noAppointments: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    padding: 16,
  },
});