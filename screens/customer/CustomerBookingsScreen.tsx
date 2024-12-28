import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Typography } from '../../components/Typography';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=0D8ABC&color=fff';

type Booking = {
  id: string;
  professional_profiles: {
    id: string;
    first_name: string;
    last_name: string;
    profile_image: string | null;
    business_name: string;
  };
  professional_profile: {
    id: string;
    first_name: string;
    last_name: string;
    profile_image: string | null;
    business_name: string;
  };
  service: {
    id: string;
    name: string;
  } | null;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
};

export const CustomerBookingsScreen = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchBookings = async () => {
    try {
      if (!user) {
        console.log('No user found in CustomerBookingsScreen');
        return;
      }

      const now = new Date().toISOString();
      console.log('Fetching bookings at:', now);
      
      const { data: customerProfile } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!customerProfile) {
        console.log('No customer profile found');
        return;
      }

      console.log('Fetching bookings for customer:', customerProfile.id);
      console.log('Active tab:', activeTab);

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          start_time,
          end_time,
          status,
          notes,
          professional_profiles!professional_id (
            id,
            first_name,
            last_name,
            profile_image,
            business_name
          ),
          service:service_id (
            id,
            name
          )
        `)
        .eq('customer_id', customerProfile.id)
        .in('status', activeTab === 'upcoming' ? ['CONFIRMED', 'PENDING'] : ['COMPLETED'])
        .gte('start_time', activeTab === 'upcoming' ? now : '1900-01-01')
        .lt('start_time', activeTab === 'upcoming' ? '2100-01-01' : now)
        .order('start_time', { ascending: activeTab === 'upcoming' });

      if (error) {
        console.error('Error fetching bookings:', error);
        throw error;
      }

      console.log('Raw bookings data:', data);
      
      // Only filter based on professional_profiles
      const validBookings = (data || []).filter(
        booking => booking.professional_profiles
      );
      
      console.log('Valid bookings after filter:', validBookings);
      
      const formattedBookings = validBookings.map(booking => ({
        ...booking,
        professional_profile: booking.professional_profiles,
        professional_profiles: booking.professional_profiles,
        service: booking.service || {
          id: 'unknown',
          name: booking.notes?.replace('Service: ', '') || 'Service Unavailable'
        }
      })) as unknown as Booking[];  // Use double type assertion to fix type error

      console.log('Formatted bookings:', formattedBookings);
      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error in fetchBookings:', error);
    }
  };

  // Update useFocusEffect to properly handle cleanup and refresh
  useFocusEffect(
    React.useCallback(() => {
      console.log('Screen focused - fetching bookings');
      let isActive = true;

      const loadBookings = async () => {
        try {
          setIsLoading(true);
          await fetchBookings();
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      };

      loadBookings();

      return () => {
        console.log('Screen unfocused - cleanup');
        isActive = false;
      };
    }, [activeTab, user])
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchBookings();
    setIsRefreshing(false);
  };

  const renderTabs = () => (
    <LinearGradient
      colors={['#FFFFFF', '#FFF8F6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.tabsContainer}
    >
      <TouchableOpacity
        style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
        onPress={() => setActiveTab('upcoming')}
      >
        <Typography
          variant="body1"
          style={[
            styles.tabText,
            activeTab === 'upcoming' && styles.activeTabText
          ]}
        >
          Upcoming
        </Typography>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'past' && styles.activeTab]}
        onPress={() => setActiveTab('past')}
      >
        <Typography
          variant="body1"
          style={[
            styles.tabText,
            activeTab === 'past' && styles.activeTabText
          ]}
        >
          Past
        </Typography>
      </TouchableOpacity>
    </LinearGradient>
  );

  const renderBookingCard = (booking: Booking, index: number) => {
    const startTime = new Date(booking.start_time);
    const endTime = new Date(booking.end_time);

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        style={styles.bookingCard}
        key={booking.id}
      >
        <View style={styles.bookingHeader}>
          <Image
            source={{ 
              uri: booking.professional_profile.profile_image || DEFAULT_AVATAR
            }}
            style={styles.professionalImage}
            defaultSource={{ uri: DEFAULT_AVATAR }}
          />
          <View style={styles.bookingInfo}>
            <Typography variant="body1" style={styles.professionalName}>
              {booking.professional_profile.business_name || 
                `${booking.professional_profile.first_name} ${booking.professional_profile.last_name}`}
            </Typography>
            <View style={styles.serviceContainer}>
              <MaterialCommunityIcons 
                name="content-cut" 
                size={16} 
                color="#FF5722" 
              />
              <Typography variant="caption" style={styles.serviceType}>
                {booking.service?.name || 'Service Unavailable'}
              </Typography>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#FF5722" />
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="calendar" size={20} color="#FF5722" />
            <Typography variant="body2" style={styles.detailText}>
              {format(startTime, 'MMMM d, yyyy')}
            </Typography>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#FF5722" />
            <Typography variant="body2" style={styles.detailText}>
              {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
            </Typography>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#FF5722" />
            <Typography variant="body2" style={styles.detailText}>
              {booking.professional_profile.business_name || '123 Professional St, London'}
            </Typography>
          </View>
        </View>

        {activeTab === 'upcoming' && (
          <View style={styles.bookingActions}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="calendar-edit" size={20} color="#FF5722" />
              <Typography variant="body2" style={styles.actionButtonText}>
                Reschedule
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
              <MaterialCommunityIcons name="calendar-remove" size={20} color="#FF3B30" />
              <Typography variant="body2" style={[styles.actionButtonText, styles.cancelButtonText]}>
                Cancel
              </Typography>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'past' && (
          <View style={styles.bookingActions}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="star" size={20} color="#FF5722" />
              <Typography variant="body2" style={styles.actionButtonText}>
                Leave Review
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="calendar-plus" size={20} color="#FF5722" />
              <Typography variant="body2" style={styles.actionButtonText}>
                Book Again
              </Typography>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FFFFFF', '#FFF8F6', '#FFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <Typography variant="h1" style={styles.headerTitle}>
          My Bookings
        </Typography>
      </LinearGradient>
      {renderTabs()}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF5722" />
          </View>
        ) : bookings.length > 0 ? (
          <View style={styles.bookingsContainer}>
            {bookings.map((booking, index) => renderBookingCard(booking, index))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calendar-blank" size={64} color="#CCC" />
            <Typography variant="body1" style={styles.emptyText}>
              No {activeTab} bookings
            </Typography>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#FFF8F6',
    borderWidth: 1,
    borderColor: '#FFE5E0',
  },
  activeTab: {
    backgroundColor: '#FF5722',
    borderColor: '#FF5722',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5722',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  bookingsContainer: {
    padding: 20,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  professionalImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#FFF8F6',
    borderWidth: 2,
    borderColor: '#FFE5E0',
  },
  bookingInfo: {
    flex: 1,
  },
  professionalName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  serviceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceType: {
    color: '#FF5722',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  bookingDetails: {
    backgroundColor: '#FFF8F6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE5E0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 12,
    color: '#666',
    flex: 1,
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#FFE5E0',
  },
  actionButtonText: {
    marginLeft: 8,
    color: '#FF5722',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FFD1D1',
  },
  cancelButtonText: {
    color: '#FF3B30',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    color: '#666',
    textAlign: 'center',
  },
});
