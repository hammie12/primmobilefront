import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CustomerNavigationBar } from '../../components/CustomerNavigationBar';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const HEADER_HEIGHT = 150;
const AVATAR_SIZE = 100;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const serviceColors = ['#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#F44336'];

export const CustomerViewProfessionalScreen = ({ route }) => {
  const navigation = useNavigation();
  const { professionalId, name: routeName, rating, category, description } = route.params || {};
  
  const name = routeName || 'Sarah Johnson';
  const title = `Professional ${category || 'Hair'} Stylist`;
  const about = description || 
    'Professional stylist with over 3 years of experience. Specialized in modern techniques and styling. Passionate about helping clients look and feel their best.';
  
  const services = [
    {
      id: '1',
      name: 'Haircut & Styling',
      price: '£50',
      duration: '45 min',
      color: serviceColors[0],
    },
    {
      id: '2',
      name: 'Color Treatment',
      price: '£120',
      duration: '2 hours',
      color: serviceColors[1],
    },
    {
      id: '3',
      name: 'Beard Trim',
      price: '£25',
      duration: '30 min',
      color: serviceColors[2],
    },
  ];

  const reviews = [
    {
      id: '1',
      user: 'John D.',
      rating: 5,
      comment: 'Amazing service! Best haircut I\'ve ever had.',
      date: '2023-08-15',
    },
    {
      id: '2',
      user: 'Mary S.',
      rating: 4,
      comment: 'Very professional and friendly.',
      date: '2023-08-10',
    },
  ];

  const businessHours = [
    { day: 'Monday', isOpen: true, start: '09:00', end: '17:00' },
    { day: 'Tuesday', isOpen: true, start: '09:00', end: '17:00' },
    { day: 'Wednesday', isOpen: true, start: '09:00', end: '17:00' },
    { day: 'Thursday', isOpen: true, start: '09:00', end: '17:00' },
    { day: 'Friday', isOpen: true, start: '09:00', end: '17:00' },
    { day: 'Saturday', isOpen: false, start: '10:00', end: '15:00' },
    { day: 'Sunday', isOpen: false, start: '10:00', end: '15:00' },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const renderServiceCard = (service: any) => (
    <TouchableOpacity 
      key={service.id} 
      style={styles.serviceCard}
      onPress={() => navigation.navigate('ServiceDetails', {
        professionalId,
        serviceName: service.name,
        servicePrice: service.price,
        serviceDuration: service.duration,
        professionalName: name,
        category: category
      })}
    >
      <View style={[styles.serviceImagePlaceholder, { backgroundColor: service.color }]}>
        <Text style={styles.serviceInitials}>{getInitials(service.name)}</Text>
      </View>
      <View style={styles.serviceContent}>
        <Text style={styles.serviceName}>{service.name}</Text>
        <View style={styles.serviceDetails}>
          <View style={styles.serviceDetail}>
            <MaterialCommunityIcons name="cash" size={16} color="#666666" />
            <Text style={styles.serviceDetailText}>{service.price}</Text>
          </View>
          <View style={styles.serviceDetail}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#666666" />
            <Text style={styles.serviceDetailText}>{service.duration}</Text>
          </View>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#666666" />
    </TouchableOpacity>
  );

  const renderReviews = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Reviews</Text>
      </View>
      {reviews.map((review) => (
        <View key={review.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewUser}>{review.user}</Text>
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
          <Text style={styles.reviewDate}>{review.date}</Text>
        </View>
      ))}
    </View>
  );

  const renderBusinessHours = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Business Hours</Text>
      </View>
      {businessHours.map((hours) => (
        <View key={hours.day} style={styles.hoursRow}>
          <View style={styles.dayContainer}>
            <Text style={styles.dayText}>{hours.day}</Text>
            <View style={[
              styles.statusIndicator, 
              { backgroundColor: hours.isOpen ? '#4CAF50' : '#FF5722' }
            ]} />
          </View>
          <Text style={styles.hoursText}>
            {hours.isOpen ? `${hours.start} - ${hours.end}` : 'Closed'}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} stickyHeaderIndices={[1]}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#FF5722', '#FF8A65']}
            style={styles.headerBackground}
          />
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>{getInitials(name)}</Text>
            </View>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>142</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>3y+</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>About</Text>
          </View>
          <Text style={styles.aboutText}>{about}</Text>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Services</Text>
          </View>
          <View style={styles.servicesContainer}>
            {services.map((service) => renderServiceCard(service))}
          </View>
        </View>

        {renderBusinessHours()}
        {renderReviews()}
      </ScrollView>
      <CustomerNavigationBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    height: HEADER_HEIGHT + AVATAR_SIZE / 2,
    marginBottom: AVATAR_SIZE / 2,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -AVATAR_SIZE / 2,
    left: (SCREEN_WIDTH - AVATAR_SIZE) / 2,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  profileInfo: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
  },
  title: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#EEEEEE',
    marginHorizontal: 16,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  aboutText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  servicesContainer: {
    gap: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInitials: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  serviceContent: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  serviceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceDetailText: {
    marginLeft: 4,
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
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    color: '#333333',
    width: 100,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  hoursText: {
    fontSize: 14,
    color: '#666666',
  },
});
