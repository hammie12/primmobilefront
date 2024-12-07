import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BaseSettingsScreen } from '../components/BaseSettingsScreen';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const imageWidth = width - 32; // Full width minus padding
const imageHeight = imageWidth * 0.75; // 4:3 aspect ratio

export const ServiceGalleryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  
  // Sample service data (replace with actual data from route.params)
  const service = {
    name: 'Hair Styling & Treatment',
    description: 'Professional hair styling service including cut, treatment, and styling. Our experienced stylists will help you achieve your desired look.',
    price: 75,
    duration: 60,
    images: [
      'https://picsum.photos/800/600?random=1',
      'https://picsum.photos/800/600?random=2',
      'https://picsum.photos/800/600?random=3',
      'https://picsum.photos/800/600?random=4',
    ],
    features: [
      'Professional consultation',
      'Premium hair products',
      'Style recommendations',
      'Aftercare advice',
    ],
  };

  return (
    <BaseSettingsScreen>
      {/* Main Image */}
      <View style={styles.mainImageContainer}>
        <Image
          source={{ uri: service.images[0] }}
          style={styles.mainImage}
          resizeMode="cover"
        />
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Image Gallery */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.galleryContainer}
      >
        {service.images.map((image, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedImage(index)}
          >
            <Image
              source={{ uri: image }}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Service Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.serviceName}>{service.name}</Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#666666" />
            <Text style={styles.metaText}>{service.duration} mins</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="currency-gbp" size={20} color="#666666" />
            <Text style={styles.metaText}>{service.price}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>About this service</Text>
        <Text style={styles.description}>{service.description}</Text>

        <Text style={styles.sectionTitle}>What's included</Text>
        {service.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.bookButton}>
        <Text style={styles.bookButtonText}>Book Now</Text>
      </TouchableOpacity>

      {/* Image Viewer Modal */}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedImage(null)}
          >
            <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {selectedImage !== null && (
            <Image
              source={{ uri: service.images[selectedImage] }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </BaseSettingsScreen>
  );
};

const styles = StyleSheet.create({
  mainImageContainer: {
    width: imageWidth,
    height: imageHeight,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryContainer: {
    marginBottom: 24,
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  detailsContainer: {
    flex: 1,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  metaText: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666666',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#1A1A1A',
    marginLeft: 12,
  },
  bookButton: {
    backgroundColor: '#FF5722',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: width,
    height: width,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
