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
import type { Database } from '../lib/supabase/schema';

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

type BookingWithRefs = Database['public']['Tables']['bookings']['Row'] & {
  customer_id: Database['public']['Tables']['customer_profiles']['Row'] & {
    user_id: {
      email: string;
    } | null;
  } | null;
  service_id: Database['public']['Tables']['services']['Row'] | null;
};

type Booking = {
  id: string;
  start_time: string;
  end_time: string;
  customer_name: string;
  service_name: string;
  status: Database['public']['Enums']['booking_status'];
  deposit_price: number;
  full_price: number;
  customer_email: string;
  customer_phone: string;
  notes: string;
};

export const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    bookingsToday: 0,
    revenueToday: 0,
    totalClients: 0,
  });
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);

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
            services!inner (
              full_price
            )
          `)
          .eq('professional_id', professionalId)
          .gte('start_time', today.toISOString())
          .lt('start_time', tomorrow.toISOString());

        if (bookingsError) throw bookingsError;

        // Calculate today's revenue using full_price
        const revenueToday = todayBookings?.reduce((sum, booking) => {
          const service = booking.services as unknown as { full_price: number };
          return sum + (service.full_price || 0);
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

  // Add new effect for upcoming bookings
  useEffect(() => {
    const fetchUpcomingBookings = async () => {
      if (!professionalId) return;

      try {
        console.log('Fetching upcoming bookings for professional:', professionalId);
        
        // Finally, check future confirmed bookings
        const { data, error } = await supabase
          .from('professional_bookings')
          .select(`
            id,
            start_time,
            end_time,
            status,
            customer_first_name,
            customer_last_name,
            service_name,
            service_price
          `)
          .eq('professional_id', professionalId)
          .in('status', ['CONFIRMED', 'PENDING'])
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(3);

        console.log('Future confirmed bookings:', data);

        if (error) {
          console.error('Error fetching bookings:', error);
          throw error;
        }

        // Transform the data
        const formattedBookings: Booking[] = (data || [])
          .filter(booking => booking.start_time && booking.end_time)
          .map(booking => {
            const customerName = `${booking.customer_first_name || ''} ${booking.customer_last_name || ''}`.trim() || 'Customer';

            return {
              id: booking.id || '',
              start_time: booking.start_time || '',
              end_time: booking.end_time || '',
              customer_name: customerName,
              service_name: booking.service_name || 'Unknown Service',
              status: booking.status || 'PENDING',
              deposit_price: 0, // These fields aren't available in the view
              full_price: booking.service_price || 0,
              customer_email: '',
              customer_phone: '',
              notes: ''
            };
          });

        console.log('Setting upcoming bookings:', formattedBookings);
        setUpcomingBookings(formattedBookings);
      } catch (error) {
        console.error('Error fetching upcoming bookings:', error);
        Alert.alert('Error', 'Failed to load upcoming bookings');
      }
    };

    if (professionalId) {
      console.log('Professional ID available, fetching bookings...');
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderMetricCard = (
    title: string, 
    value: string | number, 
    icon: keyof typeof MaterialCommunityIcons.glyphMap,
    onPress?: () => void
  ) => (
    <TouchableOpacity 
      style={styles.metricCardWrapper}
      onPress={onPress}
      activeOpacity={0.7}
    >
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
    </TouchableOpacity>
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
            {renderMetricCard(
              'Bookings Today', 
              metrics.bookingsToday.toString(), 
              'calendar-today',
              () => navigation.navigate('BusinessBookings')
            )}
            {renderMetricCard(
              'Revenue Made Today', 
              `£${metrics.revenueToday.toFixed(2)}`, 
              'cash',
              () => navigation.navigate('BusinessAnalytics')
            )}
            {renderMetricCard(
              'Total Clients', 
              metrics.totalClients.toString(), 
              'account-plus',
              () => navigation.navigate('BusinessAnalytics')
            )}
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
                      <View>
                        <Text style={styles.appointmentDate}>
                          {new Date(booking.start_time).toLocaleDateString('en-GB', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })}
                        </Text>
                        <Text style={styles.appointmentTime}>
                          {new Date(booking.start_time).toLocaleTimeString('en-GB', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false 
                          })} - {new Date(booking.end_time).toLocaleTimeString('en-GB', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false 
                          })}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.appointmentClient}>
                      {booking.customer_name}
                    </Text>
                    <Text style={styles.appointmentService}>
                      {booking.service_name} - £{booking.full_price.toFixed(2)}
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
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 8,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  metricTitle: {
    fontSize: 12,
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
  metricCardWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 2,
  },
  pendingStatusBadge: {
    backgroundColor: '#FFF3E0',
  },
  pendingAppointmentStatus: {
    color: '#FF9800',
  },
});