import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CustomerNavigationBar } from '../../components/CustomerNavigationBar';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ServiceDetailsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { 
    professionalId,
    serviceName,
    servicePrice,
    serviceDuration,
    professionalName,
    category
  } = route.params;

  // Sample service images (replace with actual service images)
  const serviceImages = [
    'https://example.com/service1.jpg',
    'https://example.com/service2.jpg',
    'https://example.com/service3.jpg',
  ];

  const serviceDescription = 'Experience our premium service delivered by skilled professionals. ' +
    'We use top-quality products and the latest techniques to ensure you get the best results. ' +
    'Our experienced team will work with you to achieve your desired look.';

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{serviceName}</Text>
    </View>
  );

  const renderImageGallery = () => (
    <ScrollView 
      horizontal 
      pagingEnabled 
      showsHorizontalScrollIndicator={false}
      style={styles.imageGallery}
    >
      {serviceImages.map((image, index) => (
        <View key={index} style={styles.imageContainer}>
          <LinearGradient
            colors={['#FF5722', '#FF8A65']}
            style={styles.imagePlaceholder}
          >
            <MaterialCommunityIcons 
              name={category === 'Hair' ? 'content-cut' : 
                    category === 'Nails' ? 'hand-back-right-outline' : 'eye'}
              size={48} 
              color="#FFF" 
            />
          </LinearGradient>
        </View>
      ))}
    </ScrollView>
  );

  const renderServiceDetails = () => (
    <View style={styles.detailsContainer}>
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceName}>{serviceName}</Text>
        <Text style={styles.professionalName}>by {professionalName}</Text>
      </View>

      <View style={styles.serviceInfo}>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="cash" size={24} color="#FF5722" />
          <Text style={styles.infoText}>{servicePrice}</Text>
        </View>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="clock-outline" size={24} color="#FF5722" />
          <Text style={styles.infoText}>{serviceDuration}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{serviceDescription}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What's Included</Text>
        <View style={styles.includedItems}>
          <View style={styles.includedItem}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.includedText}>Professional consultation</Text>
          </View>
          <View style={styles.includedItem}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.includedText}>Premium products used</Text>
          </View>
          <View style={styles.includedItem}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.includedText}>Aftercare advice</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {renderHeader()}
      <ScrollView style={styles.content}>
        {renderImageGallery()}
        {renderServiceDetails()}
      </ScrollView>
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
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
      <CustomerNavigationBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 60,
    backgroundColor: '#FF5722',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  imageGallery: {
    height: 300,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: 16,
  },
  serviceHeader: {
    marginBottom: 16,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  professionalName: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  serviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#333333',
    marginTop: 4,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
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
    fontSize: 14,
    color: '#333333',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  bookButton: {
    backgroundColor: '#FF5722',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
