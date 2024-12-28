import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
  Dimensions,
  Platform,
  TouchableOpacity
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
  const [categories] = useState([
    { id: 1, name: 'HAIR', icon: 'content-cut' },
    { id: 2, name: 'NAILS', icon: 'hand-back-right-outline' },
    { id: 3, name: 'LASHES', icon: 'eye' },
  ]);
  const [nearbyServices, setNearbyServices] = useState<(Professional & { 
    coordinates: { latitude: number; longitude: number } 
  })[]>([]);

  const fetchData = async () => {
    try {
      const { data: professionals, error: professionalsError } = await supabase
        .from('professionals')
        .select('*');

      if (professionalsError) throw professionalsError;

      const professionalsWithCoords = await Promise.all(
        (professionals || []).map(async (professional) => {
          if (professional.address) {
            const coords = await getCoordinatesFromAddress(professional.address);
            return {
              ...professional,
              coordinates: coords || { 
                latitude: location.latitude, 
                longitude: location.longitude 
              }
            };
          }
          return {
            ...professional,
            coordinates: { 
              latitude: location.latitude, 
              longitude: location.longitude 
            }
          };
        })
      );

      setNearbyServices(professionalsWithCoords);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      {categories.map((category) => (
        <View key={category.id} style={styles.categoryItem}>
          <View style={styles.categoryIcon}>
            <MaterialCommunityIcons 
              name={category.icon as any} 
              size={24} 
              color="#FF5722" 
            />
          </View>
          <Typography variant="caption" style={styles.categoryName}>
            {category.name}
          </Typography>
        </View>
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
        {nearbyServices.map((service) => (
          <Marker
            key={service.id}
            coordinate={service.coordinates}
          >
            <View style={styles.markerContainer}>
              <MaterialCommunityIcons
                name={
                  service.category?.toLowerCase() === 'hair' ? 'content-cut' :
                  service.category?.toLowerCase() === 'nails' ? 'hand-back-right-outline' :
                  service.category?.toLowerCase() === 'lashes' ? 'eye' : 'store'
                }
                size={24}
                color="#FF5722"
              />
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
                  <Typography variant="caption" style={styles.calloutDescription}>
                    {service.about}
                  </Typography>
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
      {nearbyServices.map((service) => (
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
                <Typography variant="caption" style={styles.location}>2.5 mi</Typography>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={24} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      {renderCategories()}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
      >
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
    color: '#FF5722',
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
    padding: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FF5722',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
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
});
