import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  findNodeHandle,
  Alert,
  Location,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Typography } from '../../components/Typography';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { showMessage } from 'react-native-flash-message';
import Modal from 'react-native-modal';
import { Database } from '../../lib/supabase/schema';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=0D8ABC&color=fff';

// Add type for the address JSON structure
type AddressJson = {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
} | string;  // Include string type since it might be stored as a string

type Booking = {
  id: string;
  professional_profiles: {
    id: string;
    first_name: string;
    last_name: string;
    profile_image: string | null;
    business_name: string;
    user: {
      professionals: {
        address: string | null;
      }[];
    } | null;
  };
  professional_profile: {
    id: string;
    first_name: string;
    last_name: string;
    profile_image: string | null;
    business_name: string;
    user: {
      professionals: {
        address: string | null;
      }[];
    } | null;
  };
  service: {
    id: string;
    name: string;
    price: number;
    duration: number;
    professional_id: string;
  } | null;
  start_time: string;
  end_time: string;
  status: Database["public"]["Enums"]["booking_status"];
  notes: string | null;
};

type ActionCardProps = {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  confirmColor?: string;
};

const ActionCard = ({
  isVisible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmColor = '#FF5722'
}: ActionCardProps) => (
  <Modal
    isVisible={isVisible}
    onBackdropPress={onClose}
    onBackButtonPress={onClose}
    backdropOpacity={0.5}
    style={styles.modalContainer}
  >
    <View style={styles.actionCard}>
      <Typography variant="h2" style={styles.actionCardTitle}>
        {title}
      </Typography>
      <Typography variant="body1" style={styles.actionCardMessage}>
        {message}
      </Typography>
      <View style={styles.actionCardButtons}>
        <TouchableOpacity 
          style={[styles.actionCardButton, styles.cancelActionButton]} 
          onPress={onClose}
        >
          <Typography variant="body1" style={styles.cancelActionButtonText}>
            Cancel
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionCardButton, { backgroundColor: confirmColor }]} 
          onPress={onConfirm}
        >
          <Typography variant="body1" style={styles.confirmActionButtonText}>
            {confirmText}
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// Add these types to define our data structure
type ServiceDetails = {
  id: string;
  name: string;
  price: number;
  duration: number;
  professional_id: string;
  category: Database['public']['Enums']['service_category'];
};

type ProfessionalDetails = {
  id: string;
  business_name: string;
  first_name: string;
  last_name: string;
  addresses: {
    address_line1: string;
    address_line2: string | null;
    city: string;
    state: string;
    postal_code: string;
  }[] | null;
};

type BookingDetails = {
  id: string;
  start_time: string;
  end_time: string;
  status: Database['public']['Enums']['booking_status'];
  notes: string | null;
};

// Add a helper function to format the address
const formatAddress = (address: AddressJson | null): string => {
  if (!address) return 'Location not available';
  
  if (typeof address === 'string') {
    return address;
  }

  const { street, city, state } = address;
  if (street && city) {
    return `${street}, ${city}${state ? `, ${state}` : ''}`;
  }
  
  return 'Location not available';
};

// Add a helper function to format the address string
const formatLocation = (address: string | null): string => {
  if (!address) return 'Location not available';
  
  try {
    const addressObj = JSON.parse(address);
    
    // If we have address lines, format them with city and state
    if (addressObj.address_line1) {
      const line2 = addressObj.address_line2 ? `, ${addressObj.address_line2}` : '';
      return `${addressObj.address_line1}${line2}, ${addressObj.city}, ${addressObj.state}`;
    }
    
    // If no address lines, use postcode as fallback
    if (addressObj.postcode || addressObj.postal_code) {
      return `${addressObj.city}, ${addressObj.postcode || addressObj.postal_code}`;
    }
    
    // If we only have city and state
    if (addressObj.city && addressObj.state) {
      return `${addressObj.city}, ${addressObj.state}`;
    }
    
    // If nothing else works, return the raw address
    return address;
  } catch {
    // If parsing fails, return the address as is
    return address;
  }
};

const getCoordinatesFromAddress = async (address: string) => {
  try {
    const geocodedLocation = await Location.geocodeAsync(address);
    if (geocodedLocation && geocodedLocation.length > 0) {
      const { latitude, longitude } = geocodedLocation[0];
      return { latitude, longitude };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Add this type for reviews
type Review = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
};

export const CustomerBookingsScreen = ({ route }: { route: any }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRescheduleModalVisible, setIsRescheduleModalVisible] = useState(false);
  const [isCancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const scrollViewRef = useRef<ScrollView>(null);
  const bookingRefs = useRef<{ [key: string]: any }>({});

  const handleRescheduleBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsRescheduleModalVisible(true);
  };

  const confirmReschedule = async () => {
    if (selectedBooking && selectedBooking.service) {
      try {
        console.log('Starting reschedule process:', {
          isRescheduling: true,
          selectedBookingId: selectedBooking.id,
          bookingStatus: selectedBooking.status,
          serviceDetails: {
            name: selectedBooking.service.name,
            price: selectedBooking.service.price,
            duration: selectedBooking.service.duration
          }
        });

        // First get the professional profile to get the user_id
        const { data: profProfile, error: profileError } = await supabase
          .from('professional_profiles')
          .select('user_id')
          .eq('id', selectedBooking.professional_profiles.id)
          .single();

        if (profileError) {
          console.error('Error fetching professional profile:', profileError);
          throw profileError;
        }

        if (!profProfile?.user_id) {
          throw new Error('No user_id found for professional profile');
        }

        // Then get the professional record using the user_id
        const { data: professional, error: profError } = await supabase
          .from('professionals')
          .select('*, business_hours')
          .eq('user_id', profProfile.user_id)
          .single();

        if (profError) {
          console.error('Error fetching professional:', profError);
          throw profError;
        }

        // Default business hours structure
        const defaultHours = {
          Monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
          Tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
          Wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
          Thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
          Friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
          Saturday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
          Sunday: { isOpen: false, openTime: '09:00', closeTime: '17:00' }
        };

        // Use business hours from profile or default if not found
        const businessHours = professional?.business_hours || defaultHours;

        console.log('Navigating to BookingScreen with params:', {
          professionalId: professional.id,
          serviceName: selectedBooking.service.name,
          servicePrice: selectedBooking.service.price,
          serviceDuration: selectedBooking.service.duration,
          professionalName: selectedBooking.professional_profiles.business_name,
          serviceId: selectedBooking.service.id,
          isRescheduling: true,
          originalBookingId: selectedBooking.id,
          originalBookingStatus: selectedBooking.status
        });

        // Navigate to BookingScreen with all required data
        navigation.navigate('Booking', {
          professionalId: professional.id,
          serviceName: selectedBooking.service.name,
          servicePrice: selectedBooking.service.price,
          serviceDuration: selectedBooking.service.duration.toString(),
          professionalName: selectedBooking.professional_profiles.business_name,
          serviceId: selectedBooking.service.id,
          workingHours: businessHours,
          isRescheduling: true,
          originalBookingId: selectedBooking.id,
          originalBookingStatus: selectedBooking.status
        });

        setIsRescheduleModalVisible(false);
      } catch (error) {
        console.error('Error in reschedule process:', error);
        
        // Use default hours if there's an error
        const defaultHours = {
          Monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
          Tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
          Wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
          Thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
          Friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
          Saturday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
          Sunday: { isOpen: false, openTime: '09:00', closeTime: '17:00' }
        };

        // In error case, use the service's professional_id
        navigation.navigate('Booking', {
          professionalId: selectedBooking.service.professional_id,
          serviceName: selectedBooking.service.name,
          servicePrice: selectedBooking.service.price,
          serviceDuration: selectedBooking.service.duration.toString(),
          professionalName: selectedBooking.professional_profiles.business_name,
          serviceId: selectedBooking.service.id,
          workingHours: defaultHours
        });

        setIsRescheduleModalVisible(false);
        
        showMessage({
          message: "Using default business hours",
          type: "info",
          description: "Proceeding with standard business hours."
        });
      }
    }
  };

  const handleCancelBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelModalVisible(true);
  };

  const confirmCancel = async () => {
    if (selectedBooking) {
      try {
        const { error } = await supabase
          .from('bookings')
          .delete()
          .eq('id', selectedBooking.id);

        if (error) throw error;

        showMessage({
          message: "Booking cancelled successfully",
          type: "success",
          description: "Your booking has been cancelled. Please note that deposits are non-refundable."
        });

        // Refresh bookings list
        fetchBookings();
      } catch (error) {
        console.error('Error cancelling booking:', error);
        showMessage({
          message: "Failed to cancel booking",
          type: "danger",
        });
      }
    }
    setCancelModalVisible(false);
  };

  useEffect(() => {
    // Set initial tab based on route params
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  useEffect(() => {
    // Scroll to selected booking after bookings are loaded
    if (!isLoading && route.params?.selectedBookingId && bookings.length > 0) {
      const selectedBooking = bookings.find(b => b.id === route.params.selectedBookingId);
      if (selectedBooking) {
        const selectedRef = bookingRefs.current[selectedBooking.id];
        if (selectedRef) {
          const node = findNodeHandle(selectedRef);
          if (node && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
              y: node,
              animated: true
            });
          }
        }
      }
    }
  }, [isLoading, bookings, route.params?.selectedBookingId]);

  const fetchBookings = async () => {
    try {
      if (!user) {
        console.log('No user found in CustomerBookingsScreen');
        return;
      }

      const now = new Date().toISOString();
      console.log('Fetching bookings at:', now);
      
      const { data: customerProfile, error: customerError } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (customerError) {
        console.error('Error fetching customer profile:', customerError);
        return;
      }

      if (!customerProfile) {
        console.log('No customer profile found');
        return;
      }

      console.log('Fetching bookings for customer:', customerProfile.id);
      console.log('Active tab:', activeTab);

      const query = supabase
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
            business_name,
            user_id,
            user:user_id (
              professionals!user_id (
                id,
                profile_image,
                business_name,
                about,
                rating,
                category,
                address
              )
            )
          ),
          service:service_id (
            id,
            name,
            price,
            duration,
            professional_id,
            category
          )
        `)
        .eq('customer_id', customerProfile.id);

      // Add conditions based on active tab
      if (activeTab === 'upcoming') {
        query
          .in('status', ['CONFIRMED', 'PENDING'])
          .gte('start_time', now)
          .order('start_time', { ascending: true });
      } else {
        // Past bookings should include COMPLETED and CANCELLED status
        query
          .in('status', ['COMPLETED', 'CANCELLED'])
          .lt('start_time', now)
          .order('start_time', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching bookings:', error);
        throw error;
      }

      console.log('Raw bookings data:', data);
      
      if (!data || data.length === 0) {
        console.log('No bookings found');
        setBookings([]);
        return;
      }

      // Only filter out bookings without professional profiles
      const validBookings = data.filter(booking => 
        booking.professional_profiles && 
        booking.professional_profiles.business_name
      );
      
      console.log('Valid bookings after filter:', validBookings);
      
      const formattedBookings = validBookings.map(booking => ({
        ...booking,
        professional_profile: {
          ...booking.professional_profiles,
          profile_image: booking.professional_profiles.user?.professionals?.[0]?.profile_image || null,
          business_name: booking.professional_profiles.user?.professionals?.[0]?.business_name || booking.professional_profiles.business_name,
          about: booking.professional_profiles.user?.professionals?.[0]?.about,
          rating: booking.professional_profiles.user?.professionals?.[0]?.rating,
          category: booking.professional_profiles.user?.professionals?.[0]?.category
        },
        professional_profiles: booking.professional_profiles,
        service: booking.service || {
          id: 'unknown',
          name: booking.notes?.replace('Service: ', '') || 'Service Unavailable',
          price: 0,
          duration: 30,
          professional_id: booking.professional_profiles.id,
          category: booking.professional_profiles.user?.professionals?.[0]?.category
        }
      }));

      console.log('Formatted bookings:', formattedBookings);
      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error in fetchBookings:', error);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update useFocusEffect to handle animations better
  useFocusEffect(
    React.useCallback(() => {
      console.log('Screen focused - fetching bookings');
      let isActive = true;

      const loadBookings = async () => {
        try {
          if (isActive) {
            setIsLoading(true);
            await fetchBookings();
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      };

      // Small delay to ensure smooth animation
      const timer = setTimeout(() => {
        loadBookings();
      }, 100);

      return () => {
        console.log('Screen unfocused - cleanup');
        isActive = false;
        clearTimeout(timer);
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
            activeTab === 'upcoming' ? styles.activeTabText : {}
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
            activeTab === 'past' ? styles.activeTabText : {}
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

    const handleProfessionalPress = () => {
      // Get the professional ID from the same path as handleBookAgain
      const professional = booking.professional_profiles?.user?.professionals?.[0];
      
      if (professional?.id) {
        navigation.navigate('CustomerViewProfessional', {
          professionalId: professional.id,
          name: booking.professional_profiles.business_name
        });
      } else {
        console.error('No professional ID found in booking:', booking.professional_profiles);
        showMessage({
          message: "Could not find professional details",
          type: "danger"
        });
      }
    };

    return (
      <View
        style={styles.bookingCard}
        key={booking.id}
      >
        <TouchableOpacity 
          style={styles.bookingHeader}
          onPress={() => handleProfessionalPress(booking)}
        >
          <Image
            source={{ 
              uri: booking.professional_profile.profile_image || DEFAULT_AVATAR
            }}
            style={styles.professionalImage}
            defaultSource={{ uri: DEFAULT_AVATAR }}
          />
          <View style={styles.bookingInfo}>
            <Typography variant="body1" style={styles.professionalName}>
              {booking.professional_profile.business_name}
            </Typography>
            <View style={styles.serviceDetailsContainer}>
              <View style={styles.categoryContainer}>
                <MaterialCommunityIcons 
                  name={
                    booking.professional_profile.category?.toLowerCase() === 'hair' ? 'content-cut' :
                    booking.professional_profile.category?.toLowerCase() === 'nails' ? 'hand-back-right-outline' :
                    booking.professional_profile.category?.toLowerCase() === 'lashes' ? 'eye' : 'store'
                  }
                  size={16} 
                  color="#FF5722" 
                />
                <Typography variant="caption" style={styles.categoryText}>
                  {booking.professional_profile.category?.toUpperCase()}
                </Typography>
              </View>
              <View style={styles.ratingContainer}>
                <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                <Typography variant="caption" style={styles.rating}>
                  {booking.professional_profile.rating || 'N/A'}
                </Typography>
              </View>
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
              <View style={styles.timeContainer}>
                <MaterialCommunityIcons 
                  name="clock-outline" 
                  size={16} 
                  color="#FF5722" 
                />
                <Typography variant="caption" style={styles.timeText}>
                  {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                </Typography>
              </View>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#FF5722" />
        </TouchableOpacity>

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
              {formatLocation(booking.professional_profile.user?.professionals?.[0]?.address)}
            </Typography>
          </View>
        </View>

        {activeTab === 'upcoming' && (
          <View style={styles.bookingActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleRescheduleBooking(booking)}
            >
              <MaterialCommunityIcons name="calendar-edit" size={20} color="#FF5722" />
              <Typography variant="body2" style={styles.actionButtonText}>
                Reschedule
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancelBooking(booking)}
            >
              <MaterialCommunityIcons name="calendar-remove" size={20} color="#FF3B30" />
              <Typography 
                variant="body2" 
                style={[
                  styles.actionButtonText,
                  styles.cancelButtonText
                ]}
              >
                Cancel
              </Typography>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'past' && (
          <View style={styles.bookingActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleReviewSubmit(booking)}
            >
              <MaterialCommunityIcons name="star-outline" size={20} color="#FF5722" />
              <Typography variant="body2" style={styles.actionButtonText}>
                Leave Review
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleBookAgain(booking)}
            >
              <MaterialCommunityIcons name="calendar-plus" size={20} color="#FF5722" />
              <Typography variant="body2" style={styles.actionButtonText}>
                Book Again
              </Typography>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Add function to handle review submission
  const handleReviewSubmit = async (booking: Booking) => {
    try {
      // Navigate to review screen with booking details
      navigation.navigate('WriteReview', {
        bookingId: booking.id,
        professionalId: booking.professional_profiles.id,
        professionalName: booking.professional_profiles.business_name,
        serviceId: booking.service?.id,
        serviceName: booking.service?.name
      });
    } catch (error) {
      console.error('Error navigating to review:', error);
      showMessage({
        message: "Failed to open review form",
        type: "danger"
      });
    }
  };

  // Update the handleBookAgain function
  const handleBookAgain = (booking: Booking) => {
    // Get the professional ID from the same path we get the business name and profile image
    const professional = booking.professional_profiles?.user?.professionals?.[0];
    
    if (professional?.id) {
      navigation.navigate('CustomerViewProfessional', {
        professionalId: professional.id,
        name: booking.professional_profiles.business_name
      });
    } else {
      console.error('No professional ID found in booking:', booking.professional_profiles);
      showMessage({
        message: "Could not find professional details",
        type: "danger"
      });
    }
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
        ref={scrollViewRef}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#FF5722" style={styles.loader} />
        ) : bookings.length > 0 ? (
          bookings.map((booking, index) => (
            <TouchableOpacity
              key={booking.id}
              ref={ref => bookingRefs.current[booking.id] = ref}
              style={[
                styles.bookingCard,
                route.params?.selectedBookingId === booking.id && styles.selectedBookingCard
              ]}
            >
              {renderBookingCard(booking, index)}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noBookingsContainer}>
            <MaterialCommunityIcons name="calendar-blank" size={48} color="#CCC" />
            <Typography variant="body1" style={styles.noBookingsText}>
              No {activeTab} bookings
            </Typography>
          </View>
        )}
      </ScrollView>
      <ActionCard
        isVisible={isRescheduleModalVisible}
        onClose={() => setIsRescheduleModalVisible(false)}
        onConfirm={confirmReschedule}
        title="Reschedule Booking"
        message="Would you like to reschedule this booking? You'll be able to select a new date and time."
        confirmText="Reschedule"
      />
      <ActionCard
        isVisible={isCancelModalVisible}
        onClose={() => setCancelModalVisible(false)}
        onConfirm={confirmCancel}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? Please note that your deposit will not be refunded. This action cannot be undone."
        confirmText="Yes, Cancel"
        confirmColor="#FF3B30"
      />
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
  } as const,
  cancelButton: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FFD1D1',
  },
  cancelButtonText: {
    color: '#FF3B30',
  } as const,
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
  serviceDetailsContainer: {
    marginTop: 4,
    gap: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: '#666',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedBookingCard: {
    borderColor: '#FF5722',
    borderWidth: 2,
  },
  scrollView: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noBookingsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noBookingsText: {
    marginTop: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  actionCard: {
    backgroundColor: 'white',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 200,
  },
  actionCardTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1A1A1A',
  },
  actionCardMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 24,
  },
  actionCardButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCardButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelActionButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelActionButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  confirmActionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    marginLeft: 4,
    color: '#666666',
    fontSize: 14,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryText: {
    color: '#FF5722',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  pastBookingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  statusText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 12,
  },
  completedStatus: {
    backgroundColor: '#E8F5E9',
  },
  completedStatusText: {
    color: '#2E7D32',
  },
  cancelledStatus: {
    backgroundColor: '#FFEBEE',
  },
  cancelledStatusText: {
    color: '#C62828',
  },
});
