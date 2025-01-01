import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
  Dimensions,
  Platform,
  TouchableOpacity,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { Typography } from '../../components/Typography';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { Professional, Category } from '../../types/schema';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
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

export const CustomerSearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState({
    latitude: 51.5074,
    longitude: -0.1278,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [errorMsg, setErrorMsg] = useState(null);
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories] = useState([
    { id: 1, name: 'HAIR', icon: 'content-cut' },
    { id: 2, name: 'NAILS', icon: 'hand-back-right-outline' },
    { id: 3, name: 'LASHES', icon: 'eye' },
  ]);
  const [nearbyServices, setNearbyServices] = useState<(Professional & { 
    coordinates: { latitude: number; longitude: number } 
  })[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Filter and sort services based on category and distance
  const filteredServices = nearbyServices
    .map(service => ({
      ...service,
      distance: service.coordinates && location ? 
        getDistance(
          service.coordinates.latitude,
          service.coordinates.longitude,
          location.latitude,
          location.longitude
        ) : Infinity
    }))
    .filter(service => {
      const matchesCategory = !selectedCategory || service.category?.toUpperCase() === selectedCategory;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        service.business_name?.toLowerCase().includes(searchLower) ||
        service.category?.toLowerCase().includes(searchLower) ||
        service.services?.some(s => s.name.toLowerCase().includes(searchLower));
      
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => a.distance - b.distance);

  // Get search suggestions
  const searchSuggestions = searchQuery.length > 0 ? filteredServices.slice(0, 5) : [];

  const fetchData = async (currentLocation = location) => {
    try {
      console.log('Fetching professionals data...');
      const { data: professionals, error: professionalsError } = await supabase
        .from('professionals')
        .select('*');

      if (professionalsError) {
        console.error('Error fetching professionals:', professionalsError);
        throw professionalsError;
      }

      console.log('Professionals data received:', professionals?.length);
      
      const professionalsWithCoords = await Promise.all(
        (professionals || []).map(async (professional) => {
          if (professional.address) {
            const coords = await getCoordinatesFromAddress(professional.address);
            return {
              ...professional,
              coordinates: coords || { 
                latitude: currentLocation.latitude, 
                longitude: currentLocation.longitude 
              }
            };
          }
          return {
            ...professional,
            coordinates: { 
              latitude: currentLocation.latitude, 
              longitude: currentLocation.longitude 
            }
          };
        })
      );

      console.log('Professionals with coordinates:', professionalsWithCoords.length);
      setNearbyServices(professionalsWithCoords);
    } catch (error) {
      console.error('Error in fetchData:', error);
    }
  };

  // Separate useEffect for location
  useEffect(() => {
    const getLocation = async () => {
      try {
        console.log('Requesting location permissions...');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permission denied');
          setErrorMsg('Permission to access location was denied');
          // Still fetch data with default location
          await fetchData(location);
          return;
        }

        console.log('Getting current position...');
        const currentLocation = await Location.getCurrentPositionAsync({});
        const newLocation = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        console.log('Location received:', newLocation);
        setLocation(newLocation);
        
        // Fetch data with new location
        await fetchData(newLocation);
      } catch (error) {
        console.error('Error getting location:', error);
        // Still fetch data with default location
        await fetchData(location);
      }
    };

    getLocation();
  }, []);

  // Add focus effect to refresh data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log('Screen focused - refreshing data');
      fetchData(location);
      
      return () => {
        console.log('Screen unfocused');
      };
    }, [location])
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryItem,
            selectedCategory === category.name && styles.selectedCategoryItem
          ]}
          onPress={() => setSelectedCategory(
            selectedCategory === category.name ? null : category.name
          )}
        >
          {selectedCategory === category.name ? (
            <LinearGradient
              colors={['#FF7A59', '#FF5722']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.categoryIcon}
            >
              <MaterialCommunityIcons 
                name={category.icon as any} 
                size={24} 
                color="#FFFFFF"
              />
            </LinearGradient>
          ) : (
            <View style={styles.categoryIcon}>
              <MaterialCommunityIcons 
                name={category.icon as any} 
                size={24} 
                color="#FF5722"
              />
            </View>
          )}
          <Typography 
            variant="caption" 
            style={[
              styles.categoryName,
              selectedCategory === category.name && styles.selectedCategoryName
            ]}
          >
            {category.name}
          </Typography>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMap = () => (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        region={location}
        showsUserLocation={true}
      >
        {filteredServices.map((service) => (
          <Marker
            key={service.id}
            coordinate={service.coordinates}
          >
            <View>
              <View style={styles.markerContainer}>
                <View style={styles.markerIconContainer}>
                  <MaterialCommunityIcons
                    name={
                      service.category?.toLowerCase() === 'hair' ? 'content-cut' :
                      service.category?.toLowerCase() === 'nails' ? 'hand-back-right-outline' :
                      service.category?.toLowerCase() === 'lashes' ? 'eye' : 'store'
                    }
                    size={20}
                    color="#FF5722"
                  />
                </View>
                <View style={styles.markerPointer} />
              </View>
            </View>
            <Callout tooltip onPress={() => {
              navigation.navigate('CustomerViewProfessional' as never, { 
                professionalId: service.id,
                name: service.business_name,
                rating: service.rating,
                category: service.category,
                description: service.about
              } as never);
            }}>
              <View style={styles.calloutContainer}>
                <View style={styles.calloutContent}>
                  <Image
                    source={{ 
                      uri: service.profile_image || 'https://via.placeholder.com/100'
                    }}
                    style={styles.calloutImage}
                  />
                  <Typography variant="body1" style={styles.calloutTitle}>
                    {service.business_name}
                  </Typography>
                  <View style={styles.calloutCategoryContainer}>
                    <MaterialCommunityIcons 
                      name={
                        service.category?.toLowerCase() === 'hair' ? 'content-cut' :
                        service.category?.toLowerCase() === 'nails' ? 'hand-back-right-outline' :
                        service.category?.toLowerCase() === 'lashes' ? 'eye' : 'store'
                      }
                      size={16} 
                      color="#FF5722" 
                    />
                    <Typography variant="caption" style={styles.calloutCategory}>
                      {service.category?.toUpperCase()}
                    </Typography>
                  </View>
                  <View style={styles.ratingContainer}>
                    <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                    <Typography variant="caption" style={styles.rating}>
                      {service.rating}
                    </Typography>
                  </View>
                  <View style={styles.distanceContainer}>
                    <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
                    <Typography variant="caption" style={styles.distanceText}>
                      {service.coordinates && location ? 
                        `${getDistance(
                          service.coordinates.latitude,
                          service.coordinates.longitude,
                          location.latitude,
                          location.longitude
                        ).toFixed(1)} km away` 
                        : 'Distance not available'}
                    </Typography>
                  </View>
                  <View style={styles.viewProfileButton}>
                    <Typography variant="button" style={styles.viewProfileButtonText}>
                      View Profile
                    </Typography>
                  </View>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );

  const renderSearchResults = () => (
    <View style={styles.searchResults}>
      {filteredServices.map((service) => (
        <View key={service.id} style={styles.resultCard}>
          <Image
            source={{ 
              uri: service.profile_image || 'https://via.placeholder.com/100'
            }}
            style={styles.resultImage}
          />
          <View style={styles.resultInfo}>
            <Typography variant="body1" style={styles.resultTitle}>
              {service.business_name}
            </Typography>
            <View style={styles.categoryContainer}>
              <MaterialCommunityIcons 
                name={
                  service.category?.toLowerCase() === 'hair' ? 'content-cut' :
                  service.category?.toLowerCase() === 'nails' ? 'hand-back-right-outline' :
                  service.category?.toLowerCase() === 'lashes' ? 'eye' : 'store'
                }
                size={16} 
                color="#FF5722" 
              />
              <Typography variant="caption" style={styles.resultService}>
                {service.category?.toUpperCase()}
              </Typography>
            </View>
            <View style={styles.resultDetails}>
              <View style={styles.ratingContainer}>
                <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                <Typography variant="caption" style={styles.rating}>
                  {service.rating}
                </Typography>
              </View>
              <View style={styles.locationContainer}>
                <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
                <Typography variant="caption" style={styles.location}>
                  {service.coordinates && location ? 
                    `${getDistance(
                      service.coordinates.latitude,
                      service.coordinates.longitude,
                      location.latitude,
                      location.longitude
                    ).toFixed(1)} km away` 
                    : 'Distance not available'}
                </Typography>
              </View>
            </View>
            <TouchableOpacity
              style={styles.viewProfileButtonList}
              onPress={() => {
                navigation.navigate('CustomerViewProfessional' as never, { 
                  professionalId: service.id,
                  name: service.business_name,
                  rating: service.rating,
                  category: service.category,
                  description: service.about
                } as never);
              }}
            >
              <Typography variant="button" style={styles.viewProfileButtonText}>
                View Profile
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderSearchDropdown = () => {
    if (!isSearchFocused || searchQuery.length === 0) return null;

    return (
      <View style={styles.searchDropdown}>
        {searchSuggestions.length > 0 ? (
          searchSuggestions.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.suggestionItem}
              onPress={() => {
                navigation.navigate('CustomerViewProfessional' as never, {
                  professionalId: service.id,
                  name: service.business_name,
                  rating: service.rating,
                  category: service.category,
                  description: service.about
                } as never);
                setSearchQuery('');
                setIsSearchFocused(false);
              }}
            >
              <View style={styles.suggestionContent}>
                <Image
                  source={{ uri: service.profile_image || 'https://via.placeholder.com/100' }}
                  style={styles.suggestionImage}
                />
                <View style={styles.suggestionInfo}>
                  <Typography variant="body1" style={styles.suggestionTitle}>
                    {service.business_name}
                  </Typography>
                  <View style={styles.suggestionDetails}>
                    <MaterialCommunityIcons
                      name={
                        service.category?.toLowerCase() === 'hair' ? 'content-cut' :
                        service.category?.toLowerCase() === 'nails' ? 'hand-back-right-outline' :
                        service.category?.toLowerCase() === 'lashes' ? 'eye' : 'store'
                      }
                      size={16}
                      color="#FF5722"
                    />
                    <Typography variant="caption" style={styles.suggestionCategory}>
                      {service.category}
                    </Typography>
                    <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                    <Typography variant="caption" style={styles.suggestionRating}>
                      {service.rating}
                    </Typography>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noSuggestionsContainer}>
            <Typography variant="body2" style={styles.noSuggestionsText}>
              No matching professionals found
            </Typography>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {isSearchFocused && searchQuery.length > 0 && (
        <View style={styles.searchOverlay} />
      )}
      <View style={[styles.searchContainer, { zIndex: isSearchFocused ? 2 : 1 }]}>
        <View style={[
          styles.searchBar,
          isSearchFocused && styles.searchBarFocused
        ]}>
          <MaterialCommunityIcons name="magnify" size={24} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services, business names..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          />
          {searchQuery ? (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <MaterialCommunityIcons name="close" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
        {renderSearchDropdown()}
      </View>
      <ScrollView 
        style={[
          styles.content,
          { opacity: isSearchFocused && searchQuery.length > 0 ? 0.3 : 1 }
        ]} 
        showsVerticalScrollIndicator={false}
        pointerEvents={isSearchFocused && searchQuery.length > 0 ? "none" : "auto"}
      >
        {renderCategories()}
        {renderMap()}
        {renderSearchResults()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    padding: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FFE5E0',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    fontSize: 16,
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  categoryItem: {
    alignItems: 'center',
    width: 80,
    paddingHorizontal: 4,
    transform: [{ scale: 1 }],
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF8F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#FFE5E0',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryName: {
    color: '#666',
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  mapContainer: {
    height: 450,
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FF5722',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  markerPointer: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 16,
    backgroundColor: '#FF5722',
    transform: [{ rotate: '45deg' }],
  },
  markerIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResults: {
    padding: 16,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    transform: [{ scale: 1 }],
  },
  resultImage: {
    width: 110,
    height: 110,
    borderRadius: 20,
    marginRight: 16,
    backgroundColor: '#FFF8F6',
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  resultService: {
    color: '#FF5722',
    fontWeight: '500',
    fontSize: 14,
    marginBottom: 4,
  },
  resultDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FFE5E0',
    marginRight: 12,
  },
  rating: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  location: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  calloutContainer: {
    width: 260,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  calloutContent: {
    padding: 16,
  },
  calloutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  calloutDescription: {
    color: '#666',
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  viewProfileButton: {
    backgroundColor: '#FF5722',
    padding: 14,
    borderRadius: 16,
    marginTop: 12,
    alignItems: 'center',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  viewProfileButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  viewProfileButtonList: {
    backgroundColor: '#FF5722',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  calloutImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 12,
    backgroundColor: '#FFF8F6',
  },
  calloutCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  calloutCategory: {
    color: '#FF5722',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 4,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  distanceText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryItem: {
    transform: [{ scale: 1.05 }],
  },
  selectedCategoryIcon: {
    backgroundColor: 'transparent',
    borderColor: '#FFFFFF',
  },
  selectedCategoryName: {
    color: '#FF5722',
    fontWeight: '700',
  },
  clearButton: {
    padding: 8,
  },
  searchBarFocused: {
    borderColor: '#FF5722',
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1,
  },
  searchDropdown: {
    position: 'absolute',
    top: '100%',
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 4,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    zIndex: 1000,
    maxHeight: 300,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#FFF8F6',
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  suggestionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionCategory: {
    color: '#FF5722',
    marginLeft: 4,
    marginRight: 12,
    fontSize: 14,
  },
  suggestionRating: {
    color: '#666',
    marginLeft: 4,
    fontSize: 14,
  },
  noSuggestionsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noSuggestionsText: {
    color: '#666',
  },
});
