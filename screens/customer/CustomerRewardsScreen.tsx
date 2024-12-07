import React from 'react';
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

export const CustomerRewardsScreen = () => {
  // Mock user data
  const userPoints = 150; // Points after 3 £50 bookings
  const pointsToReward = 250; // Points needed for 20% discount
  const bookingsCount = 3;
  const bookingsNeeded = 5;

  // Mock rewards data
  const availableRewards = [
    {
      id: 1,
      name: "20% Off Next Appointment",
      points: 250,
      description: "Get 20% off your next beauty service booking",
      icon: "ticket-percent",
    }
  ];

  // Mock points earning info
  const pointsInfo = [
    {
      id: 1,
      title: "Book Any Service",
      description: "Earn 50 PriimPoints for every £50 spent",
      icon: "calendar-check",
    },
    {
      id: 2,
      title: "Loyalty Milestone",
      description: "Complete 5 bookings to earn a 20% discount",
      icon: "star-circle",
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: "earned",
      points: 50,
      description: "Haircut Service - £50",
      date: "2024-01-15",
    },
    {
      id: 2,
      type: "earned",
      points: 50,
      description: "Nail Service - £50",
      date: "2024-01-10",
    },
    {
      id: 3,
      type: "earned",
      points: 50,
      description: "Lash Service - £50",
      date: "2024-01-05",
    },
  ];

  const renderPointsCard = () => (
    <View style={styles.pointsCard}>
      <View style={styles.pointsCardContent}>
        <View style={styles.pointsCardLeft}>
          <View style={styles.currentTier}>
            <MaterialCommunityIcons name="crown" size={24} color="#FFD700" />
            <Typography variant="body2" style={styles.tierLabel}>PriimPoints</Typography>
          </View>
          <Typography variant="h1" style={styles.pointsText}>{userPoints}</Typography>
          <Typography variant="caption" style={styles.pointsLabel}>POINTS BALANCE</Typography>
        </View>
        <View style={styles.pointsCardRight}>
          <View style={styles.nextTierContainer}>
            <Typography variant="caption" style={styles.nextTierLabel}>Progress to Reward</Typography>
            <Typography variant="body1" style={styles.nextTierText}>{bookingsCount}/{bookingsNeeded} Bookings</Typography>
            <Typography variant="caption" style={styles.pointsToNext}>
              {pointsToReward - userPoints} points to 20% discount
            </Typography>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(userPoints / pointsToReward) * 100}%` }]} />
            </View>
            <View style={styles.progressLabels}>
              <Typography variant="caption" style={styles.progressStart}>{userPoints}</Typography>
              <Typography variant="caption" style={styles.progressEnd}>{pointsToReward}</Typography>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderRewards = () => (
    <View style={styles.rewardsSection}>
      <Typography variant="h2" style={styles.sectionTitle}>Available Rewards</Typography>
      {availableRewards.map((reward) => (
        <TouchableOpacity key={reward.id} style={styles.rewardCard}>
          <View style={styles.rewardIcon}>
            <MaterialCommunityIcons name={reward.icon} size={24} color="#FF5722" />
          </View>
          <View style={styles.rewardInfo}>
            <Typography variant="body1" style={styles.rewardName}>{reward.name}</Typography>
            <Typography variant="caption" style={styles.rewardDescription}>{reward.description}</Typography>
          </View>
          <View style={styles.rewardPoints}>
            <Typography variant="body2" style={styles.pointsRequired}>{reward.points}</Typography>
            <Typography variant="caption" style={styles.pointsLabel}>points</Typography>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPointsInfo = () => (
    <View style={styles.rewardsSection}>
      <Typography variant="h2" style={styles.sectionTitle}>How to Earn Points</Typography>
      {pointsInfo.map((info) => (
        <View key={info.id} style={styles.infoCard}>
          <View style={styles.rewardIcon}>
            <MaterialCommunityIcons name={info.icon} size={24} color="#FF5722" />
          </View>
          <View style={styles.rewardInfo}>
            <Typography variant="body1" style={styles.rewardName}>{info.title}</Typography>
            <Typography variant="caption" style={styles.rewardDescription}>{info.description}</Typography>
          </View>
        </View>
      ))}
    </View>
  );

  const renderActivity = () => (
    <View style={styles.activitySection}>
      <Typography variant="h2" style={styles.sectionTitle}>Recent Activity</Typography>
      {recentActivity.map((activity) => (
        <View key={activity.id} style={styles.activityItem}>
          <View style={styles.activityIcon}>
            <MaterialCommunityIcons
              name={activity.type === 'earned' ? 'plus-circle' : 'minus-circle'}
              size={24}
              color={activity.type === 'earned' ? '#4CAF50' : '#FF5722'}
            />
          </View>
          <View style={styles.activityInfo}>
            <Typography variant="body2" style={styles.activityDescription}>{activity.description}</Typography>
            <Typography variant="caption" style={styles.activityDate}>{activity.date}</Typography>
          </View>
          <Typography
            variant="body2"
            style={[
              styles.activityPoints,
              { color: activity.type === 'earned' ? '#4CAF50' : '#FF5722' }
            ]}
          >
            {activity.type === 'earned' ? '+' : '-'}{activity.points}
          </Typography>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.content}>
        {renderPointsCard()}
        {renderRewards()}
        {renderPointsInfo()}
        {renderActivity()}
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
  content: {
    flex: 1,
  },
  pointsCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FF5722',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pointsCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pointsCardLeft: {
    flex: 1,
    marginRight: 16,
  },
  pointsCardRight: {
    flex: 1,
    justifyContent: 'center',
  },
  currentTier: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierLabel: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 16,
  },
  pointsText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  pointsLabel: {
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 12,
    letterSpacing: 1,
  },
  nextTierContainer: {
    marginBottom: 12,
  },
  nextTierLabel: {
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 12,
    marginBottom: 4,
  },
  nextTierText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pointsToNext: {
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 12,
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStart: {
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 12,
  },
  progressEnd: {
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 12,
  },
  rewardsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  rewardName: {
    fontWeight: '500',
    marginBottom: 4,
  },
  rewardDescription: {
    color: '#666666',
  },
  rewardPoints: {
    alignItems: 'center',
  },
  pointsRequired: {
    fontWeight: '600',
    color: '#FF5722',
  },
  activitySection: {
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityIcon: {
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityDescription: {
    marginBottom: 4,
  },
  activityDate: {
    color: '#666666',
  },
  activityPoints: {
    fontWeight: '600',
  },
});
