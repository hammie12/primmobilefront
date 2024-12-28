import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Typography } from '../../components/Typography';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Professional {
  id: string;
  business_name: string;
  category: string;
  profile_image: string;
  rating: number;
  review_count: number;
  about?: string;
  title?: string;
}

interface Booking {
  id: string;
  start_time: string;
  services: {
    name: string;
  };
  professional_profiles: {
    business_name: string;
  };
}

export const CustomerHomeScreen = () => {
  const navigation = useNavigation<any>();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [firstName, setFirstName] = useState<string>('');

  useEffect(() => {
    fetchProfessionals();
    fetchUpcomingBookings();
    fetchUserName();
  }, []);

  const fetchProfessionals = async () => {
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
          about,
          title
        `)
        .order('rating', { ascending: false });

      if (professionalsError) throw professionalsError;
      setProfessionals(professionalsData || []);
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

      const { data: customerProfile, error: customerError } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (customerError) throw customerError;

      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          start_time,
          services (
            name
          ),
          professional_profiles (
            business_name
          )
        `)
        .eq('customer_id', customerProfile.id)
        .eq('status', 'CONFIRMED')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(3);

      if (bookingsError) throw bookingsError;
      setUpcomingBookings(bookings || []);
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

      if (error) throw error;
      if (profile?.first_name) {
        setFirstName(profile.first_name);
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
    }
  };

  const handleProfessionalPress = (professional: Professional) => {
    console.log('CustomerHomeScreen navigating to CustomerViewProfessional with professional:', professional);
    navigation.navigate('CustomerViewProfessional', {
      professionalId: professional.id,
      name: professional.business_name,
      rating: professional.rating,
      category: professional.category,
      description: professional.about,
      title: professional.title
    });
  };

  const renderProfessionalCard = ({ item: professional, index }: { item: Professional, index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.professionalCard}
    >
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
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
            <Typography variant="caption" style={styles.rating}>
              {professional.rating ? professional.rating.toFixed(1) : 'New'}
            </Typography>
            {professional.review_count > 0 && (
              <Typography variant="caption" style={styles.reviewCount}>
                ({professional.review_count})
              </Typography>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderRecentBookings = () => (
    <View style={styles.section}>
      <Typography variant="h2" style={styles.sectionTitle}>Upcoming Bookings</Typography>
      {upcomingBookings.length > 0 ? (
        upcomingBookings.map((booking) => (
          <TouchableOpacity key={booking.id} style={styles.bookingCard}>
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
        ))
      ) : (
        <View style={styles.noBookingsContainer}>
          <MaterialCommunityIcons name="calendar-blank" size={48} color="#CCC" />
          <Typography variant="body1" style={styles.noBookingsText}>
            No upcoming bookings
          </Typography>
        </View>
      )}
    </View>
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
          <Typography variant="h1" style={styles.headerTitle}>
            Welcome back{firstName ? `, ${firstName}` : ''}
          </Typography>
        </View>
        <TouchableOpacity onPress={() => {}} style={styles.notificationButton}>
          <MaterialCommunityIcons name="bell-outline" size={24} color="#FF5722" />
        </TouchableOpacity>
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
                style={styles.categoryChip}
              >
                <Typography variant="caption" style={styles.categoryText}>
                  {category}
                </Typography>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Typography variant="h2" style={styles.sectionTitle}>
            Top Rated Professionals
          </Typography>
          <FlatList
            data={professionals}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  notificationButton: {
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE5E0',
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
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    transform: [{ scale: 1 }],
  },
  professionalCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  professionalImage: {
    width: 110,
    height: 110,
    borderRadius: 20,
    marginRight: 16,
  },
  professionalInfo: {
    flex: 1,
    justifyContent: 'space-between',
    height: 80,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFF8F6',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#FFE5E0',
    marginRight: 10,
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryText: {
    color: '#FF5722',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
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
});
