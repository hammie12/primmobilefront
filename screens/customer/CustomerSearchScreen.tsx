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
import { CustomerNavigationBar } from '../../components/CustomerNavigationBar';
import { Typography } from '../../components/Typography';
import { useNavigation } from '@react-navigation/native';

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

  // Sample nearby services data
  const nearbyServices = [
    {
      id: 1,
      name: "Sarah's Hair Salon",
      rating: 4.8,
      category: "Hair",
      latitude: 51.4620,  // Clapham
      longitude: -0.1680,
      description: "Expert hair styling and coloring services"
    },
    {
      id: 2,
      name: "Luxury Nails",
      rating: 4.6,
      category: "Nails",
      latitude: 51.4099,  // Mitcham
      longitude: -0.1667,
      description: "Premium nail care and designs"
    },
    {
      id: 3,
      name: "Lash Perfect",
      rating: 4.9,
      category: "Lashes",
      latitude: 51.4067,  // Crystal Palace
      longitude: -0.0825,
      description: "Expert lash extensions and styling"
    },
    {
      id: 4,
      name: "Style Studio Hair",
      rating: 4.7,
      category: "Hair",
      latitude: 51.4024,  // Bromley
      longitude: 0.0198,
      description: "Hair cutting, coloring, and styling services"
    },
    {
      id: 5,
      name: "Nail Art & Beauty",
      rating: 4.8,
      category: "Nails",
      latitude: 51.4316,  // Tooting
      longitude: -0.1686,
      description: "Nail art, gel extensions, and beauty services"
    },
    {
      id: 6,
      name: "London Lashes & Beauty",
      rating: 4.7,
      category: "Lashes",
      latitude: 51.4277,  // Tooting Broadway
      longitude: -0.1682,
      description: "Lash extensions, makeup, and beauty services"
    },
    {
      id: 7,
      name: "Glamour Hair Boutique",
      rating: 4.9,
      category: "Hair",
      latitude: 51.4519,  // Clapham South
      longitude: -0.1477,
      description: "Hair cutting, coloring, and styling services"
    },
    {
      id: 8,
      name: "Crystal Nails London",
      rating: 4.5,
      category: "Nails",
      latitude: 51.4180,  // Crystal Palace
      longitude: -0.0843,
      description: "Nail care, gel extensions, and beauty services"
    },
    {
      id: 9,
      name: "Flutter Beauty Bar",
      rating: 4.8,
      category: "Lashes",
      latitude: 51.4060,  // Bromley North
      longitude: 0.0176,
      description: "Lash extensions, makeup, and beauty services"
    }
  ];

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

  const categories = [
    { name: 'Hair', icon: 'content-cut' },
    { name: 'Nails', icon: 'hand-back-right-outline' },
    { name: 'Lashes', icon: 'eye' },
  ];

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      {categories.map((category) => (
        <View key={category.name} style={styles.categoryItem}>
          <View style={styles.categoryIcon}>
            <MaterialCommunityIcons name={category.icon} size={24} color="#FF5722" />
          </View>
          <Typography variant="caption" style={styles.categoryName}>{category.name}</Typography>
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
            coordinate={{
              latitude: service.latitude,
              longitude: service.longitude,
            }}
          >
            <View style={styles.markerContainer}>
              <MaterialCommunityIcons
                name={categories.find(cat => cat.name === service.category)?.icon || 'store'}
                size={24}
                color="#FF5722"
              />
            </View>
            <Callout tooltip onPress={() => {
              navigation.navigate('CustomerViewProfessional', { 
                professionalId: service.id,
                name: service.name,
                rating: service.rating,
                category: service.category,
                description: service.description
              });
            }}>
              <View style={styles.calloutContainer}>
                <View style={styles.calloutContent}>
                  <Typography variant="body1" style={styles.calloutTitle}>
                    {service.name}
                  </Typography>
                  <View style={styles.ratingContainer}>
                    <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                    <Typography variant="caption" style={styles.rating}>
                      {service.rating}
                    </Typography>
                  </View>
                  <Typography variant="caption" style={styles.calloutDescription}>
                    {service.description}
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
            source={{ uri: 'https://via.placeholder.com/100' }}
            style={styles.resultImage}
          />
          <View style={styles.resultInfo}>
            <Typography variant="body1" style={styles.resultTitle}>{service.name}</Typography>
            <Typography variant="caption" style={styles.resultService}>{service.category}</Typography>
            <View style={styles.resultDetails}>
              <View style={styles.ratingContainer}>
                <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                <Typography variant="caption" style={styles.rating}>{service.rating}</Typography>
              </View>
              <View style={styles.locationContainer}>
                <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
                <Typography variant="caption" style={styles.location}>2.5 mi</Typography>
              </View>
            </View>
            <TouchableOpacity
              style={styles.viewProfileButtonList}
              onPress={() => {
                navigation.navigate('CustomerViewProfessional', { 
                  professionalId: service.id,
                  name: service.name,
                  rating: service.rating,
                  category: service.category,
                  description: service.description
                });
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
      <CustomerNavigationBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  categoryItem: {
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryName: {
    color: '#333333',
  },
  mapContainer: {
    height: 350,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF5722',
  },
  searchResults: {
    padding: 16,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  resultService: {
    color: '#666666',
    marginVertical: 4,
  },
  resultDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  rating: {
    marginLeft: 4,
    color: '#666666',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    marginLeft: 4,
    color: '#666666',
  },
  calloutContainer: {
    width: 200,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  calloutContent: {
    padding: 12,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  calloutDescription: {
    color: '#666',
    marginTop: 4,
  },
  viewProfileButton: {
    backgroundColor: '#FF5722',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
    alignItems: 'center',
  },
  viewProfileButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  viewProfileButtonList: {
    backgroundColor: '#FF5722',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
});
