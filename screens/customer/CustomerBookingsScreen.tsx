import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CustomerNavigationBar } from '../../components/CustomerNavigationBar';
import { Typography } from '../../components/Typography';

export const CustomerBookingsScreen = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
        onPress={() => setActiveTab('upcoming')}
      >
        <Typography
          variant="body1"
          style={[
            styles.tabText,
            activeTab === 'upcoming' && styles.activeTabText,
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
            activeTab === 'past' && styles.activeTabText,
          ]}
        >
          Past
        </Typography>
      </TouchableOpacity>
    </View>
  );

  const renderBookingCard = (booking: any) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Image
          source={{ uri: 'https://via.placeholder.com/50' }}
          style={styles.professionalImage}
        />
        <View style={styles.bookingInfo}>
          <Typography variant="body1" style={styles.professionalName}>
            Professional Name
          </Typography>
          <Typography variant="caption" style={styles.serviceType}>
            Service Type
          </Typography>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="calendar" size={20} color="#666" />
          <Typography variant="body2" style={styles.detailText}>
            Monday, March 15, 2024
          </Typography>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
          <Typography variant="body2" style={styles.detailText}>
            2:00 PM - 3:00 PM
          </Typography>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
          <Typography variant="body2" style={styles.detailText}>
            123 Professional St, London
          </Typography>
        </View>
      </View>

      {activeTab === 'upcoming' && (
        <View style={styles.bookingActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rescheduleButton]}
            onPress={() => {}}
          >
            <Typography variant="body2" style={styles.rescheduleButtonText}>
              Reschedule
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => {}}
          >
            <Typography variant="body2" style={styles.cancelButtonText}>
              Cancel
            </Typography>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'past' && (
        <View style={styles.bookingActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.reviewButton]}
            onPress={() => {}}
          >
            <Typography variant="body2" style={styles.reviewButtonText}>
              Leave Review
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rebookButton]}
            onPress={() => {}}
          >
            <Typography variant="body2" style={styles.rebookButtonText}>
              Book Again
            </Typography>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Typography variant="h1" style={styles.headerTitle}>
          My Bookings
        </Typography>
      </View>

      {renderTabs()}

      <ScrollView style={styles.content}>
        {[1, 2, 3].map((booking) => (
          <View key={`booking-${booking}`}>
            {renderBookingCard(booking)}
          </View>
        ))}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#F0F0F0',
  },
  activeTab: {
    borderBottomColor: '#FF5722',
  },
  tabText: {
    color: '#666',
  },
  activeTabText: {
    color: '#FF5722',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  professionalImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  bookingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  professionalName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  serviceType: {
    color: '#666',
  },
  bookingDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 12,
    color: '#333',
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  rescheduleButton: {
    backgroundColor: '#FFF5F2',
  },
  cancelButton: {
    backgroundColor: '#FFF5F5',
  },
  reviewButton: {
    backgroundColor: '#F0F8FF',
  },
  rebookButton: {
    backgroundColor: '#F0FFF0',
  },
  rescheduleButtonText: {
    color: '#FF5722',
  },
  cancelButtonText: {
    color: '#FF3B30',
  },
  reviewButtonText: {
    color: '#007AFF',
  },
  rebookButtonText: {
    color: '#34C759',
  },
});
