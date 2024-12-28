import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { StackNavigationProp } from '@react-navigation/stack';

const HEADER_HEIGHT = 150;
const AVATAR_SIZE = 100;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Define the service categories enum to match your database
const SERVICE_CATEGORIES = {
  HAIR: 'HAIR',
  NAILS: 'NAILS',
  LASHES: 'LASHES'
} as const;

type ServiceCategory = typeof SERVICE_CATEGORIES[keyof typeof SERVICE_CATEGORIES];

type Service = {
  id: string;
  professional_id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  deposit_price: number;
  category: ServiceCategory;
  images?: string[];
  created_at?: string;
  updated_at?: string;
};

// Define days of the week for business hours
const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

type RootStackParamList = {
  Booking: {
    professionalId: string;
    serviceName: string;
    servicePrice: number;
    serviceDuration: string;
    professionalName: string;
    serviceId: string;
  };
  // ... other routes
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'Booking'>;

export const CustomerViewProfessionalScreen = ({ route }) => {
  const navigation = useNavigation<NavigationProp>();
  const { professionalId } = route.params;
  console.log('CustomerViewProfessionalScreen received professionalId:', professionalId);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    id: '',
    userId: '',
    bannerImage: null as string | null,
    profileImage: null as string | null,
    name: '',
    title: '',
    businessName: '',
    category: '',
    about: '',
    address: {
      postcode: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      county: '',
    },
    phone: '',
    email: '',
    website: '',
    rating: 0,
    reviewCount: 0,
    services: [] as Service[],
    businessHours: {} as any,
    reviews: [] as any[]
  });

  useEffect(() => {
    fetchProfileData();
  }, [professionalId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching data for professional ID:', professionalId);
      
      // Fetch professional profile
      const { data: profile, error } = await supabase
        .from('professionals')
        .select('*, business_hours')
        .eq('id', professionalId)
        .single();

      if (error) {
        console.error('Error fetching professional profile:', error);
        throw error;
      }

      console.log('Fetched professional profile:', profile);

      // Fetch services using the professional's ID from the professionals table
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select(`
          id,
          professional_id,
          name,
          description,
          duration,
          price,
          deposit_price,
          category,
          images,
          created_at,
          updated_at
        `)
        .eq('professional_id', professionalId)
        .order('name', { ascending: true }); // Order by name to help identify duplicates

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
        throw servicesError;
      }

      console.log('Raw services from database:', services);

      // Create a Map to store unique services by ID
      const uniqueServices = new Map();
      services?.forEach(service => {
        if (!uniqueServices.has(service.id)) {
          uniqueServices.set(service.id, {
        id: service.id,
        professional_id: service.professional_id,
        name: service.name,
        description: service.description || '',
        duration: service.duration,
        price: service.price,
        deposit_price: service.deposit_price || service.price,
        category: service.category as ServiceCategory,
        images: service.images || [],
        created_at: service.created_at,
        updated_at: service.updated_at
          });
        } else {
          console.warn('Duplicate service found:', {
            id: service.id,
            name: service.name,
            category: service.category
          });
        }
      });

      // Convert Map to array
      const transformedServices = Array.from(uniqueServices.values());
      console.log('Transformed unique services:', transformedServices);

      const profileDataToSet = {
        id: profile?.id || '',
        userId: profile?.user_id || '',
        bannerImage: profile?.banner_image || null,
        profileImage: profile?.profile_image || null,
        name: profile?.name || '',
        title: profile?.title || '',
        businessName: profile?.business_name || '',
        category: profile?.category || '',
        about: profile?.about || '',
        address: typeof profile?.address === 'string' ? JSON.parse(profile.address) : profile?.address || {
          postcode: '',
          address_line_1: '',
          address_line_2: '',
          city: '',
          county: ''
        },
        phone: profile?.phone || '',
        email: profile?.email || '',
        website: profile?.website || '',
        rating: profile?.rating || 0,
        reviewCount: profile?.review_count || 0,
        services: transformedServices,
        businessHours: profile?.business_hours || {},
        reviews: [] // We'll fetch reviews separately if needed
      };

      console.log('Setting profile data with unique services:', {
        serviceCount: transformedServices.length,
        services: transformedServices.map(s => ({
          id: s.id,
          name: s.name,
          category: s.category
        }))
      });
      
      setProfileData(profileDataToSet);

    } catch (error) {
      console.error('Error in fetchProfileData:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderServiceCard = (service: Service) => {
    console.log('Rendering service card with professionalId:', professionalId);
    console.log('Rendering service:', service);
    
    // Validate required service fields
    if (!service.id || !service.name || !service.duration || !service.price) {
      console.error('Invalid service data:', service);
      return null;
    }

    return (
      <View key={service.id} style={styles.serviceCard}>
        <View style={styles.serviceHeader}>
          <View>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceCategory}>{service.category}</Text>
          </View>
        </View>

        {service.images && service.images.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.serviceImagesContainer}
          >
            {service.images.map((image, index) => (
              <Image 
                key={index}
                source={{ uri: image }} 
                style={styles.serviceCardImage} 
              />
            ))}
          </ScrollView>
        )}

        <Text style={styles.serviceDescription}>{service.description || 'No description available'}</Text>
        <View style={styles.serviceDetails}>
          <View style={styles.serviceDetail}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#666666" />
            <Text style={styles.serviceDetailText}>{service.duration} mins</Text>
          </View>
          <View style={styles.serviceDetail}>
            <MaterialCommunityIcons name="credit-card-outline" size={16} color="#666666" />
            <Text style={styles.serviceDetailText}>Deposit: £{service.price}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.bookServiceButton}
          onPress={() => {
            console.log('Service card navigating to Booking with professionalId:', professionalId);
            navigation.navigate('Booking', {
              professionalId,
              serviceName: service.name,
              servicePrice: service.price,
              serviceDuration: service.duration.toString(),
              professionalName: profileData.businessName,
              serviceId: service.id
            });
          }}
        >
          <Text style={styles.bookServiceButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderBusinessHours = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Business Hours</Text>
      </View>
      {loading ? (
        <Text style={styles.loadingText}>Loading business hours...</Text>
      ) : (
        DAYS_OF_WEEK.map((day) => {
          const hours = profileData.businessHours[day];
          return (
            <View key={day} style={styles.hourRow}>
              <Text style={styles.dayText}>{day}</Text>
              <Text style={styles.hoursText}>
                {hours?.isOpen ? `${hours.openTime} - ${hours.closeTime}` : 'Closed'}
              </Text>
            </View>
          );
        })
      )}
    </View>
  );

  const renderReviews = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Reviews</Text>
      </View>
      {profileData.reviews.map((review) => (
        <View key={review.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewUser}>{review.customer_name || 'Anonymous'}</Text>
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, i) => (
                <MaterialCommunityIcons
                  key={i}
                  name={i < review.rating ? 'star' : 'star-outline'}
                  size={16}
                  color="#FFD700"
                />
              ))}
            </View>
          </View>
          <Text style={styles.reviewComment}>{review.comment}</Text>
          <Text style={styles.reviewDate}>
            {new Date(review.created_at).toLocaleDateString()}
          </Text>
        </View>
      ))}
    </View>
  );

  const groupServicesByCategory = () => {
    console.log('Grouping services by category:', profileData.services);
    const grouped = {} as Record<ServiceCategory, Service[]>;
    
    // Initialize categories
    Object.values(SERVICE_CATEGORIES).forEach(category => {
      grouped[category] = [];
    });
    
    // Create a Set to track unique service IDs
    const processedServiceIds = new Set<string>();
    
    // Group services, ensuring no duplicates
    profileData.services.forEach(service => {
      // Skip if we've already processed this service
      if (processedServiceIds.has(service.id)) {
        console.log('Skipping duplicate service:', service.id);
        return;
      }
      
      if (service.category && grouped[service.category]) {
        grouped[service.category].push(service);
        processedServiceIds.add(service.id);
      } else {
        console.warn('Service with invalid category:', service);
      }
    });
    
    console.log('Grouped services (unique):', grouped);
    return grouped;
  };

  const renderServices = () => {
    console.log('Rendering services:', profileData.services);
    
    if (!profileData.services || profileData.services.length === 0) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Services</Text>
          </View>
          <Text style={styles.noServicesText}>No services available</Text>
        </View>
      );
    }

    const groupedServices = groupServicesByCategory();
    
    // Only show categories that have services
    const categoriesWithServices = Object.entries(groupedServices)
      .filter(([_, services]) => services.length > 0);

    if (categoriesWithServices.length === 0) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Services</Text>
          </View>
          <Text style={styles.noServicesText}>No services available</Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Services</Text>
        </View>
        {categoriesWithServices.map(([category, services]) => (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {services.map(renderServiceCard)}
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          {/* Banner */}
          <View style={styles.bannerContainer}>
            {profileData.bannerImage ? (
              <Image source={{ uri: profileData.bannerImage }} style={styles.bannerImage} />
            ) : (
              <LinearGradient colors={['#FF5722', '#FF8A65']} style={styles.bannerPlaceholder} />
            )}
          </View>

          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            {profileData.profileImage ? (
              <Image source={{ uri: profileData.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <MaterialCommunityIcons name="account" size={32} color="#FFFFFF" />
              </View>
            )}
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <View style={styles.profileHeader}>
              <View>
                <Text style={styles.businessName}>{`${profileData.name} @ ${profileData.businessName}`}</Text>
                <Text style={styles.category}>{profileData.category || 'Category not set'}</Text>
                <Text style={styles.title}>{profileData.title}</Text>
                
                {/* Contact Information */}
                <View style={styles.contactInfo}>
                  {profileData.address && (
                    <View style={styles.contactItem}>
                      <MaterialCommunityIcons name="map-marker" size={16} color="#666666" />
                      <Text style={[styles.contactText, styles.addressText]}>
                        {[
                          profileData.address.address_line_1,
                          profileData.address.address_line_2,
                          profileData.address.city,
                          profileData.address.county,
                          profileData.address.postcode
                        ].filter(Boolean).join('\n')}
                      </Text>
                    </View>
                  )}
                  
                  {profileData.phone && (
                    <View style={styles.contactItem}>
                      <MaterialCommunityIcons name="phone" size={16} color="#666666" />
                      <Text style={styles.contactText}>{profileData.phone}</Text>
                    </View>
                  )}
                  
                  {profileData.email && (
                    <View style={styles.contactItem}>
                      <MaterialCommunityIcons name="email" size={16} color="#666666" />
                      <Text style={styles.contactText}>{profileData.email}</Text>
                    </View>
                  )}
                  
                  {profileData.website && (
                    <View style={styles.contactItem}>
                      <MaterialCommunityIcons name="web" size={16} color="#666666" />
                      <Text style={styles.contactText}>{profileData.website}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{profileData.rating.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{profileData.reviewCount}</Text>
                <Text style={styles.statLabel}>Reviews</Text>
              </View>
            </View>
            <Text style={styles.about}>{profileData.about}</Text>
          </View>

          {/* Services */}
          {renderServices()}

          {/* Business Hours */}
          {renderBusinessHours()}

          {/* Reviews */}
          {renderReviews()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  bannerContainer: {
    height: HEADER_HEIGHT,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
  },
  profileImageContainer: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    marginTop: -AVATAR_SIZE / 2,
    marginLeft: 20,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR_SIZE / 2,
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: '#FF5722',
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: '#666666',
  },
  contactInfo: {
    marginTop: 12,
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  addressText: {
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  about: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
    lineHeight: 24,
  },
  section: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  serviceCategory: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  serviceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceDetailText: {
    fontSize: 14,
    color: '#666666',
  },
  serviceImagesContainer: {
    marginVertical: 8,
  },
  serviceCardImage: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginRight: 8,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  dayText: {
    fontSize: 16,
    color: '#333333',
  },
  hoursText: {
    fontSize: 16,
    color: '#666666',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewUser: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999999',
  },
  bookServiceButton: {
    backgroundColor: '#FF5722',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  bookServiceButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    marginTop: 8,
  },
  noServicesText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 16,
  },
});
