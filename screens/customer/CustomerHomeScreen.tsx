import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Typography } from '../../components/Typography';
import { supabase } from '../../lib/supabase';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';

interface Professional {
  id: string;
  business_name: string;
  category: string;
  profile_image: string;
  rating: number;
  review_count: number;
  address: string | null;
  distance?: number;
  description?: string;
}

interface Booking {
  id: string;
  start_time: string;
  services: Array<{ name: string }>;
  professional_profiles: Array<{ business_name: string }>;
}

export const CustomerHomeScreen = () => {
  const navigation = useNavigation<any>();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [firstName, setFirstName] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const isFocused = useIsFocused();
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission denied');
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        fetchProfessionals(location);
      } catch (error) {
        console.error('Error getting location:', error);
        fetchProfessionals();
      }
    })();
    fetchUpcomingBookings();
    fetchUserName();
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchUpcomingBookings();
      
      const interval = setInterval(() => {
        fetchUpcomingBookings();
      }, 60000);
      
      setRefreshInterval(interval);
      
      return () => {
        if (refreshInterval) {
          clearInterval(refreshInterval);
        }
      };
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [isFocused]);

  const calculateDistance = async (address: string | null, userLat: number, userLon: number): Promise<number> => {
    if (!address || typeof address !== 'string') return -1;
    
    try {
      const addressObj = JSON.parse(address);
      const postcode = addressObj.postcode;
      
      if (!postcode) return -1;

      // Use the postcodes.io API to get coordinates from postcode
      const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
      const data = await response.json();
      
      if (!data.result) return -1;

      const profLat = data.result.latitude;
      const profLon = data.result.longitude;

      if (!profLat || !profLon) return -1;

      const R = 6371; // Earth's radius in km
      const dLat = (profLat - userLat) * Math.PI / 180;
      const dLon = (profLon - userLon) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(userLat * Math.PI / 180) * Math.cos(profLat * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    } catch (error) {
      console.error('Error calculating distance:', error);
      return -1;
    }
  };

  const fetchProfessionals = async (userLocation?: Location.LocationObject) => {
    try {
      const { data: professionalsData, error: professionalsError } = await supabase
        .from('professionals')
        .select(`
          id,
          business_name,
          category,
          profile_image,
          rating,
          review_count,
          address
        `);

      if (professionalsError) throw professionalsError;

      if (userLocation && professionalsData) {
        // Calculate distances for all professionals
        const professionalPromises = professionalsData.map(async prof => {
          const distance = await calculateDistance(
            prof.address,
            userLocation.coords.latitude,
            userLocation.coords.longitude
          );
          return { ...prof, distance };
        });

        const professionalsWithDistance = await Promise.all(professionalPromises);
        
        // Sort by distance
        const sortedProfessionals = professionalsWithDistance.sort((a, b) => {
          if (a.distance === -1) return 1;
          if (b.distance === -1) return -1;
          return a.distance - b.distance;
        });

        setProfessionals(sortedProfessionals);
      } else {
        setProfessionals(professionalsData || []);
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: customerProfile } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!customerProfile) return;

      const now = new Date().toISOString();

      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          start_time,
          end_time,
          status,
          services!service_id (
            name
          ),
          professional_profiles!professional_id (
            business_name
          )
        `)
        .eq('customer_id', customerProfile.id)
        .in('status', ['CONFIRMED', 'PENDING'])
        .gte('start_time', now)
        .order('start_time', { ascending: true })
        .limit(3);

      if (bookingsError) {
        console.error('Error in bookings query:', bookingsError);
        throw bookingsError;
      }

      console.log('Raw bookings data:', bookings);

      const formattedBookings = bookings?.map(booking => ({
        id: booking.id,
        start_time: booking.start_time,
        services: booking.services || [],
        professional_profiles: booking.professional_profiles || []
      })) || [];

      console.log('Formatted upcoming bookings:', formattedBookings);
      setUpcomingBookings(formattedBookings);
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
    }
  };

  const fetchUserName = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('customer_profiles')
        .select('first_name')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If the error is "no rows returned", we'll just set firstName to empty string
        if (error.code === 'PGRST116') {
          setFirstName('');
          return;
        }
        throw error;
      }
      
      if (profile?.first_name) {
        setFirstName(profile.first_name);
      } else {
        setFirstName('');
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
      // Set firstName to empty string on error to ensure the UI still renders
      setFirstName('');
    }
  };

  const handleProfessionalPress = (professional: Professional) => {
    navigation.navigate('CustomerViewProfessional', {
      professionalId: professional.id,
      name: professional.business_name,
      rating: professional.rating,
      category: professional.category,
      description: professional.description || '',
      title: professional.business_name
    });
  };

  const renderProfessionalCard = ({ item: professional, index }: { item: Professional, index: number }) => (
    <View style={styles.professionalCard}>
      <TouchableOpacity 
        style={styles.professionalCardContent}
        onPress={() => handleProfessionalPress(professional)}
      >
        <Image
          source={{ 
            uri: professional.profile_image || 'https://via.placeholder.com/150'
          }}
          style={styles.professionalImage}
        />
        <View style={styles.professionalInfo}>
          <Typography variant="body1" style={styles.professionalName}>
            {professional.business_name}
          </Typography>
          <View style={styles.categoryContainer}>
            <MaterialCommunityIcons 
              name={
                professional.category?.toLowerCase() === 'hair' ? 'content-cut' :
                professional.category?.toLowerCase() === 'nails' ? 'hand-back-right-outline' :
                professional.category?.toLowerCase() === 'lashes' ? 'eye' : 'store'
              }
              size={16} 
              color="#FF5722" 
            />
            <Typography variant="caption" style={styles.professionalService}>
              {professional.category?.toUpperCase()}
            </Typography>
          </View>
          <View style={styles.distanceContainer}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
            <Typography variant="caption" style={styles.distanceText}>
              {professional.distance && professional.distance !== -1
                ? `${professional.distance.toFixed(1)} km away`
                : 'Distance not available'}
            </Typography>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderRecentBookings = () => (
    <View style={styles.section}>
      <Typography variant="h2" style={styles.sectionTitle}>Upcoming Bookings</Typography>
      {upcomingBookings.length > 0 ? (
        <>
          {upcomingBookings.slice(0, 3).map((booking) => (
            <TouchableOpacity 
              key={booking.id} 
              style={styles.bookingCard}
              onPress={() => navigation.navigate('CustomerBookings', {
                selectedBookingId: booking.id,
                initialTab: 'upcoming'
              })}
            >
              <View style={styles.bookingHeader}>
                <Typography variant="body1" style={styles.bookingTitle}>
                  {booking.services?.name || 'Service'}
                </Typography>
                <Typography variant="caption" style={styles.bookingDate}>
                  {new Date(booking.start_time).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Typography>
              </View>
              <View style={styles.bookingDetails}>
                <MaterialCommunityIcons name="store" size={20} color="#FF5722" />
                <Typography variant="caption" style={styles.bookingService}>
                  {booking.professional_profiles?.business_name}
                </Typography>
              </View>
              <View style={styles.bookingTimeContainer}>
                <MaterialCommunityIcons name="clock-outline" size={20} color="#FF5722" />
                <Typography variant="caption" style={styles.bookingTime}>
                  {new Date(booking.start_time).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </Typography>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('CustomerBookings', { initialTab: 'upcoming' })}
          >
            <Typography variant="body1" style={styles.viewAllButtonText}>
              View All Bookings
            </Typography>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#FF5722" />
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.noBookingsContainer}>
          <MaterialCommunityIcons name="calendar-blank" size={48} color="#CCC" />
          <Typography variant="body1" style={styles.noBookingsText}>
            No upcoming bookings
          </Typography>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('CustomerBookings', { initialTab: 'upcoming' })}
          >
            <Typography variant="body1" style={styles.viewAllButtonText}>
              View All Bookings
            </Typography>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#FF5722" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const filteredProfessionals = professionals.filter(professional => 
    selectedCategory === 'ALL' || professional.category?.toUpperCase() === selectedCategory
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FFFFFF', '#FFF8F6', '#FFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <View>
          <Typography variant="body1" style={styles.greeting}>
            Hello {firstName ? firstName.toLowerCase() : ''}
          </Typography>
          <Typography variant="h1" style={styles.headerTitle}>
            Good morning!
          </Typography>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {['ALL', 'HAIR', 'NAILS', 'LASHES'].map((category) => (
              <TouchableOpacity 
                key={category} 
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.selectedCategoryChip
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Typography 
                  variant="caption" 
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.selectedCategoryText
                  ]}
                >
                  {category}
                </Typography>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Typography variant="h2" style={styles.sectionTitle}>
            Nearby Professionals
          </Typography>
          <FlatList
            data={filteredProfessionals}
            renderItem={renderProfessionalCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
        {renderRecentBookings()}
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
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
    paddingHorizontal: 20,
    color: '#1A1A1A',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  professionalCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  professionalCardContent: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  professionalImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
  },
  professionalInfo: {
    width: '100%',
  },
  professionalName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  professionalService: {
    color: '#FF5722',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  professionalBio: {
    color: '#666',
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FFE5E0',
  },
  rating: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  reviewCount: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
  bookingCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  bookingDate: {
    color: '#FF5722',
    fontWeight: '600',
    fontSize: 14,
  },
  bookingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  bookingService: {
    marginLeft: 8,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF8F6',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE5E0',
    marginRight: 8,
  },
  categoryText: {
    color: '#FF5722',
    fontWeight: '600',
    fontSize: 13,
  },
  bookingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F6',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  bookingTime: {
    marginLeft: 8,
    color: '#FF5722',
    fontWeight: '500',
  },
  noBookingsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#FFF8F6',
    borderRadius: 24,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#FFE5E0',
    marginTop: 8,
  },
  noBookingsText: {
    color: '#666',
    marginTop: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#FF5722',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#F8F8F8',
    padding: 8,
    borderRadius: 8,
  },
  distanceText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
    flex: 1,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8F6',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: 12,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#FFE5E0',
  },
  viewAllButtonText: {
    color: '#FF5722',
    fontWeight: '600',
    marginRight: 8,
  },
  greeting: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
});
