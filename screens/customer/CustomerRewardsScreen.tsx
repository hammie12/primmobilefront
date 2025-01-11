import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  View as LoadingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Typography } from '../../components/Typography';
import { supabase } from '../../lib/supabase';
import { Reward, PointsActivity, UserRewards } from '../../types/rewards';
import { useAuth } from '../../contexts/AuthContext';

const LoadingScreen = () => (
  <LoadingView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#FF5722" />
  </LoadingView>
);

interface ExtendedPointsActivity extends PointsActivity {
  service_name: string;
  business_name: string;
  amount: number;
}

export const CustomerRewardsScreen = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userRewards, setUserRewards] = useState<UserRewards>({
    total_points: 0,
    bookings_count: 0
  });
  const [activities, setActivities] = useState<ExtendedPointsActivity[]>([]);
  
  const BOOKINGS_NEEDED = 5; // Could move to env or rewards config
  const POINTS_FOR_DISCOUNT = 250;

  useEffect(() => {
    if (user) {
      loadRewardsData();
    }
  }, [user]);

  const loadRewardsData = async () => {
    try {
      setIsLoading(true);
      
      if (!user) return;

      // Get customer profile first
      const { data: customerProfile, error: customerError } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (customerError) throw customerError;

      // Get total amount spent from bookings
      const { data: totalSpentData, error: spentError } = await supabase
        .from('bookings')
        .select(`
          services:service_id (
            deposit_price,
            full_price
          ),
          status
        `)
        .eq('customer_id', customerProfile.id)
        .in('status', ['PENDING', 'CONFIRMED', 'COMPLETED']);

      if (spentError) {
        console.error('Error fetching total spent:', spentError);
      }

      // Calculate total points based on booking status
      const totalPoints = totalSpentData?.reduce((sum, booking) => {
        const service = booking.services as any;
        
        switch (booking.status) {
          case 'COMPLETED':
            // Use full_price for completed bookings
            return sum + (service?.full_price || 0);
            
          case 'CONFIRMED':
          case 'PENDING':
            // Use deposit_price for pending or confirmed bookings
            return sum + (service?.deposit_price || 0);
            
          default:
            return sum;
        }
      }, 0) || 0;

      // Get or create rewards profile
      let rewardsProfile;
      const { data: existingProfile, error: fetchError } = await supabase
        .from('rewards_profiles')
        .select('*')
        .eq('customer_profile_id', customerProfile.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching rewards profile:', fetchError);
      }

      // If no profile exists, create one with the calculated points
      if (!existingProfile) {
        const { data: newProfile, error: createError } = await supabase
          .from('rewards_profiles')
          .insert([
            { 
              customer_profile_id: customerProfile.id,
              points: totalPoints,
              tier: 'STANDARD'
            }
          ])
          .select()
          .single();

        if (createError) {
          console.error('Error creating rewards profile:', createError);
        } else {
          rewardsProfile = newProfile;
        }
      } else {
        // If profile exists, update the points if they're different
        if (existingProfile.points !== totalPoints) {
          const { data: updatedProfile, error: updateError } = await supabase
            .from('rewards_profiles')
            .update({ points: totalPoints })
            .eq('id', existingProfile.id)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating rewards points:', updateError);
          } else {
            rewardsProfile = updatedProfile;
          }
        } else {
          rewardsProfile = existingProfile;
        }
      }

      // Set user rewards using the rewards profile data
      setUserRewards({
        total_points: rewardsProfile?.points || 0,
        bookings_count: totalSpentData?.length || 0
      });

      // Fetch recent bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          start_time,
          status,
          service_id,
          professional_id,
          services:service_id (
            name,
            deposit_price,
            full_price
          ),
          professional_profiles:professional_id (
            business_name
          )
        `)
        .eq('customer_id', customerProfile.id)
        .in('status', ['CONFIRMED', 'COMPLETED'])
        .order('start_time', { ascending: false })
        .limit(3);

      if (bookingsError) {
        console.error('Bookings error:', bookingsError);
        throw bookingsError;
      }

      // Transform booking data into activity format
      const transformedActivities = (bookings || []).map(booking => {
        const service = booking.services as any;
        const points = booking.status === 'COMPLETED' 
          ? (service?.full_price || 0)  // Full price for completed
          : (service?.deposit_price || 0);  // Deposit price for others
        
        return {
          id: booking.id,
          type: 'earned' as const,
          points: points,
          description: `Booking with ${(booking.professional_profiles as any)?.business_name}`,
          created_at: booking.start_time,
          service_name: service?.name || 'Service',
          business_name: (booking.professional_profiles as any)?.business_name || 'Business',
          amount: points, // Use the same points value for amount
          user_id: user.id,
          status: booking.status
        };
      });

      setActivities(transformedActivities);

      console.log('Calculated total points:', totalPoints);

      if (existingProfile && existingProfile.points !== totalPoints) {
        const { error: updateError } = await supabase
          .from('rewards_profiles')
          .update({ points: totalPoints })
          .eq('id', existingProfile.id);

        if (updateError) {
          console.error('Error updating rewards points:', updateError);
        }
      }

      // Add this query to check booking statuses
      const { data: bookingStatuses, error: statusError } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          start_time,
          services:service_id (
            name,
            deposit_price,
            full_price
          )
        `)
        .eq('customer_id', customerProfile.id)
        .order('start_time', { ascending: false });

      if (statusError) {
        console.error('Error fetching booking statuses:', statusError);
      } else {
        console.log('All customer bookings:', bookingStatuses?.map(booking => ({
          id: booking.id,
          status: booking.status,
          date: new Date(booking.start_time).toLocaleDateString(),
          service: booking.services?.name,
          deposit: booking.services?.deposit_price,
          full_price: booking.services?.full_price
        })));
      }

    } catch (error) {
      console.error('Error loading rewards data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const renderPointsCard = () => (
    <View style={styles.pointsCard}>
      <View style={styles.pointsCardContent}>
        <View style={styles.pointsCardLeft}>
          <View style={styles.currentTier}>
            <MaterialCommunityIcons name="crown" size={24} color="#FFD700" />
            <Typography variant="body1" style={styles.tierLabel}>PriimPoints</Typography>
          </View>
          <Typography variant="h1" style={styles.pointsText}>{userRewards.total_points}</Typography>
          <Typography variant="caption" style={styles.pointsLabel}>POINTS BALANCE</Typography>
        </View>
        <View style={styles.pointsCardRight}>
          <View style={styles.nextTierContainer}>
            <Typography variant="caption" style={styles.nextTierLabel}>Progress to Reward</Typography>
            <Typography variant="body1" style={styles.nextTierText}>
              {userRewards.total_points}/{POINTS_FOR_DISCOUNT} points
            </Typography>
            <Typography variant="caption" style={styles.pointsToNext}>
              {POINTS_FOR_DISCOUNT - userRewards.total_points} points to 20% discount
            </Typography>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min((userRewards.total_points / POINTS_FOR_DISCOUNT) * 100, 100)}%` }
                ]} 
              />
            </View>
            <View style={styles.progressLabels}>
              <Typography variant="caption" style={styles.progressStart}>
                {userRewards.total_points}
              </Typography>
              <Typography variant="caption" style={styles.progressEnd}>
                {POINTS_FOR_DISCOUNT}
              </Typography>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderRewards = () => (
    <View style={styles.rewardsSection}>
      <Typography variant="h2" style={styles.sectionTitle}>Available Rewards</Typography>
      <TouchableOpacity style={styles.rewardCard}>
        <View style={styles.rewardIcon}>
          <MaterialCommunityIcons name="ticket-percent" size={24} color="#FF5722" />
        </View>
        <View style={styles.rewardInfo}>
          <Typography variant="body1" style={styles.rewardName}>20% Discount on Next Appointment</Typography>
          <Typography variant="caption" style={styles.rewardDescription}>
            Spend £250 to earn a 20% discount on your next appointment
          </Typography>
          <Typography variant="caption" style={[styles.rewardDescription, styles.rewardNote]}>
            Every £1 spent earns you 1 point towards your reward
          </Typography>
        </View>
        <View style={styles.rewardPoints}>
          <Typography variant="body1" style={styles.pointsRequired}>250</Typography>
          <Typography variant="caption" style={styles.pointsLabel}>points</Typography>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderActivity = () => (
    <View style={styles.activitySection}>
      <Typography variant="h2" style={styles.sectionTitle}>Recent Bookings</Typography>
      {activities.length > 0 ? (
        activities.map((activity) => (
          <TouchableOpacity 
            key={activity.id} 
            style={styles.bookingCard}
            onPress={() => console.log('Activity details:', activity)} // Debug press handler
          >
            <View style={styles.bookingHeader}>
              <Typography variant="body1" style={styles.bookingTitle}>
                {activity.service_name || 'Service'}
              </Typography>
              <Typography variant="caption" style={styles.bookingDate}>
                {new Date(activity.created_at).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Typography>
            </View>
            <View style={styles.bookingDetails}>
              <MaterialCommunityIcons name="store" size={20} color="#FF5722" />
              <Typography variant="caption" style={styles.bookingService}>
                {activity.business_name || 'Business'}
              </Typography>
            </View>
            <View style={styles.bookingFooter}>
              <View style={styles.bookingTimeContainer}>
                <MaterialCommunityIcons name="clock-outline" size={20} color="#FF5722" />
                <Typography variant="caption" style={styles.bookingTime}>
                  {new Date(activity.created_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </Typography>
              </View>
              <View style={styles.pointsEarned}>
                <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
                <Typography variant="caption" style={styles.pointsText}>
                  +{activity.points} points
                </Typography>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.noBookingsContainer}>
          <MaterialCommunityIcons name="calendar-blank" size={48} color="#CCC" />
          <Typography variant="body1" style={styles.noBookingsText}>
            No recent bookings
          </Typography>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.content}>
        {renderPointsCard()}
        {renderRewards()}
        {renderActivity()}
      </ScrollView>
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
  rewardNote: {
    marginTop: 4,
    fontStyle: 'italic',
    color: '#888888',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activityPointsContainer: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    color: '#666',
    marginBottom: 4,
  },
  noActivitiesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    marginTop: 16,
  },
  noActivitiesText: {
    color: '#666',
    marginTop: 8,
  },
  bookingCard: {
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  bookingDate: {
    color: '#FF5722',
    fontWeight: '500',
  },
  bookingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  bookingService: {
    marginLeft: 8,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F6',
    padding: 8,
    borderRadius: 8,
  },
  bookingTime: {
    marginLeft: 8,
    color: '#FF5722',
    fontWeight: '500',
  },
  pointsEarned: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F6',
    padding: 8,
    borderRadius: 8,
  },
  pointsText: {
    marginLeft: 8,
    color: '#FF5722',
    fontWeight: '500',
    fontSize: 32,
  },
  noBookingsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    marginTop: 16,
  },
  noBookingsText: {
    color: '#666',
    marginTop: 8,
  },
});
