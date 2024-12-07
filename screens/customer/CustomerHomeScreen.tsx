import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CustomerNavigationBar } from '../../components/CustomerNavigationBar';
import { Typography } from '../../components/Typography';

export const CustomerHomeScreen = () => {
  const renderFeaturedServices = () => (
    <View style={styles.section}>
      <Typography variant="h2" style={styles.sectionTitle}>Featured Services</Typography>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[1, 2, 3].map((item) => (
          <TouchableOpacity key={item} style={styles.serviceCard}>
            <View style={styles.serviceImageContainer}>
              <Image
                source={{ uri: 'https://via.placeholder.com/150' }}
                style={styles.serviceImage}
              />
            </View>
            <Typography variant="body1" style={styles.serviceTitle}>Service Name</Typography>
            <Typography variant="caption" style={styles.servicePrice}>From £30</Typography>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderNearbyProfessionals = () => (
    <View style={styles.section}>
      <Typography variant="h2" style={styles.sectionTitle}>Nearby Professionals</Typography>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[1, 2, 3].map((item) => (
          <TouchableOpacity key={item} style={styles.professionalCard}>
            <Image
              source={{ uri: 'https://via.placeholder.com/150' }}
              style={styles.professionalImage}
            />
            <Typography variant="body1" style={styles.professionalName}>Professional Name</Typography>
            <Typography variant="caption" style={styles.professionalService}>Service Type</Typography>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
              <Typography variant="caption" style={styles.rating}>4.8</Typography>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderRecentBookings = () => (
    <View style={styles.section}>
      <Typography variant="h2" style={styles.sectionTitle}>Your Recent Bookings</Typography>
      {[1, 2].map((item) => (
        <TouchableOpacity key={item} style={styles.bookingCard}>
          <View style={styles.bookingHeader}>
            <Typography variant="body1" style={styles.bookingTitle}>Appointment with Professional</Typography>
            <Typography variant="caption" style={styles.bookingDate}>Tomorrow, 2:00 PM</Typography>
          </View>
          <View style={styles.bookingDetails}>
            <MaterialCommunityIcons name="calendar" size={20} color="#666" />
            <Typography variant="caption" style={styles.bookingService}>Service Name</Typography>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Typography variant="h1" style={styles.headerTitle}>Welcome back!</Typography>
        <TouchableOpacity onPress={() => {}} style={styles.notificationButton}>
          <MaterialCommunityIcons name="bell-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderFeaturedServices()}
        {renderNearbyProfessionals()}
        {renderRecentBookings()}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  notificationButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  serviceCard: {
    marginLeft: 16,
    marginRight: 8,
    width: 150,
  },
  serviceImageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  serviceImage: {
    width: 150,
    height: 150,
  },
  serviceTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  servicePrice: {
    color: '#666',
  },
  professionalCard: {
    marginLeft: 16,
    marginRight: 8,
    width: 120,
  },
  professionalImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
  },
  professionalName: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  professionalService: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rating: {
    marginLeft: 4,
    color: '#666',
  },
  bookingCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  bookingDate: {
    color: '#666',
  },
  bookingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingService: {
    marginLeft: 8,
    color: '#666',
  },
});
