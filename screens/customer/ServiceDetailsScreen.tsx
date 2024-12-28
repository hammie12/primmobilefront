import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '../../components/Typography';
import { BaseScreen } from '../../components/BaseScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 88 : 64;

export const ServiceDetailsScreen = ({ route }) => {
  const navigation = useNavigation();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { 
    professionalId,
    serviceName,
    servicePrice,
    serviceDuration,
    professionalName,
    category,
    description
  } = route.params;

  // Sample service images (replace with actual service images)
  const serviceImages = [
    'https://example.com/service1.jpg',
    'https://example.com/service2.jpg',
    'https://example.com/service3.jpg',
  ];

  const serviceDescription = description || 'Experience our premium service delivered by skilled professionals. ' +
    'We use top-quality products and the latest techniques to ensure you get the best results. ' +
    'Our experienced team will work with you to achieve your desired look.';

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.headerButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
      </TouchableOpacity>
      <Typography variant="h3" style={styles.headerTitle}>{serviceName}</Typography>
      <View style={styles.headerButton} />
    </View>
  );

  const renderImageGallery = () => (
    <View style={styles.imageContainer}>
      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveImageIndex(newIndex);
        }}
      >
        {serviceImages.map((image, index) => (
          <View key={index} style={styles.imageWrapper}>
            <LinearGradient
              colors={['#FF5722', '#FF8A65']}
              style={styles.imagePlaceholder}
            >
              <MaterialCommunityIcons 
                name={category === 'HAIR' ? 'content-cut' : 
                      category === 'NAILS' ? 'hand-back-right-outline' : 'eye'}
                size={64} 
                color="#FFF" 
              />
            </LinearGradient>
          </View>
        ))}
      </ScrollView>
      {serviceImages.length > 1 && (
        <View style={styles.paginationDots}>
          {serviceImages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeImageIndex && styles.paginationDotActive
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );

  return (
    <BaseScreen>
      <StatusBar style="dark" />
      {renderHeader()}
      <ScrollView style={styles.container} bounces={false}>
        {renderImageGallery()}
        
        <View style={styles.content}>
          {/* Professional Info */}
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <Typography variant="h2" style={styles.serviceName}>{serviceName}</Typography>
              <Typography variant="body2" style={styles.professionalName}>by {professionalName}</Typography>
            </View>
          </View>

          {/* Quick Info */}
          <View style={styles.quickInfo}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#FF5722" />
              <Typography variant="body2" style={styles.infoText}>{serviceDuration} mins</Typography>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="cash" size={20} color="#FF5722" />
              <Typography variant="body2" style={styles.infoText}>£{servicePrice}</Typography>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons 
                name={category === 'HAIR' ? 'content-cut' : 
                      category === 'NAILS' ? 'hand-back-right-outline' : 'eye'}
                size={20} 
                color="#FF5722" 
              />
              <Typography variant="body2" style={styles.infoText}>{category}</Typography>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Typography variant="h3" style={styles.sectionTitle}>About this service</Typography>
            <Typography variant="body2" style={styles.description}>{serviceDescription}</Typography>
          </View>

          {/* What's Included */}
          <View style={styles.section}>
            <Typography variant="h3" style={styles.sectionTitle}>What's included</Typography>
            <View style={styles.includedItems}>
              <View style={styles.includedItem}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                <Typography variant="body2" style={styles.includedText}>Professional consultation</Typography>
              </View>
              <View style={styles.includedItem}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                <Typography variant="body2" style={styles.includedText}>Premium products</Typography>
              </View>
              <View style={styles.includedItem}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                <Typography variant="body2" style={styles.includedText}>Aftercare advice</Typography>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => navigation.navigate('Booking', {
            professionalId,
            serviceName,
            servicePrice,
            serviceDuration,
            professionalName
          })}
        >
          <Typography variant="button" style={styles.bookButtonText}>Book Now</Typography>
        </TouchableOpacity>
      </View>
    </BaseScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#333333',
    flex: 1,
    textAlign: 'center',
  },
  imageContainer: {
    height: SCREEN_WIDTH,
    backgroundColor: '#F5F5F5',
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInfo: {
    flex: 1,
  },
  serviceName: {
    color: '#333333',
  },
  professionalName: {
    color: '#666666',
    marginTop: 4,
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoItem: {
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    color: '#333333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#333333',
    marginBottom: 12,
  },
  description: {
    color: '#666666',
    lineHeight: 22,
  },
  includedItems: {
    gap: 12,
  },
  includedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  includedText: {
    color: '#333333',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    padding: 16,
  },
  bookButton: {
    backgroundColor: '#FF5722',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
  },
});
