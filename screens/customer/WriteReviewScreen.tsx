import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Typography } from '../../components/Typography';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { showMessage } from 'react-native-flash-message';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=0D8ABC&color=fff';

export const WriteReviewScreen = ({ route, navigation }) => {
  const { bookingId, professionalId, professionalName, serviceId, serviceName } = route.params;
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  React.useEffect(() => {
    fetchProfessionalImage();
  }, []);

  const fetchProfessionalImage = async () => {
    try {
      const { data: professional, error } = await supabase
        .from('professional_profiles')
        .select(`
          id,
          profile_image,
          user:user_id (
            professionals!user_id (
              profile_image
            )
          )
        `)
        .eq('id', professionalId)
        .single();

      if (error) throw error;

      // Try to get the profile image from either the professional_profiles or the professionals table
      const profileImageUrl = professional?.profile_image || 
                            professional?.user?.professionals?.[0]?.profile_image ||
                            DEFAULT_AVATAR;
      
      setProfileImage(profileImageUrl);
    } catch (error) {
      console.error('Error fetching professional image:', error);
      setProfileImage(DEFAULT_AVATAR);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0 || rating > 5) {
      showMessage({
        message: "Please select a valid rating (1-5 stars)",
        type: "warning",
        backgroundColor: "#FFA000",
      });
      return;
    }

    if (!comment.trim()) {
      showMessage({
        message: "Please write a comment",
        type: "warning",
        backgroundColor: "#FFA000",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Get the customer profile ID
      const { data: customerProfile, error: customerError } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (customerError) throw customerError;

      // Check for existing review
      const { data: existingReview, error: existingError } = await supabase
        .from('reviews')
        .select('id')
        .eq('professional_id', professionalId)
        .eq('customer_id', customerProfile.id)
        .eq('booking_id', bookingId)
        .single();

      if (existingReview) {
        showMessage({
          message: "You have already reviewed this service",
          type: "warning",
          backgroundColor: "#FFA000",
        });
        return;
      }

      // Start a transaction for data consistency
      const { data, error: transactionError } = await supabase.rpc('submit_review', {
        p_professional_id: professionalId,
        p_customer_id: customerProfile.id,
        p_booking_id: bookingId,
        p_rating: rating,
        p_comment: comment
      });

      if (transactionError) throw transactionError;

      showMessage({
        message: "Review submitted successfully",
        type: "success",
        backgroundColor: "#4CAF50",
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error submitting review:', error);
      showMessage({
        message: "Failed to submit review",
        type: "danger",
        backgroundColor: "#F44336",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const starDescriptions = [
      'Poor',
      'Fair',
      'Good',
      'Very Good',
      'Excellent'
    ];

    return (
      <View style={styles.ratingContainer}>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
            >
              <MaterialCommunityIcons
                name={star <= rating ? 'star' : 'star-outline'}
                size={40}
                color={star <= rating ? '#FFD700' : '#E0E0E0'}
              />
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <Animated.Text 
            entering={FadeInDown}
            style={styles.ratingDescription}
          >
            {starDescriptions[rating - 1]}
          </Animated.Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <LinearGradient
          colors={['#FFFFFF', '#FFF8F6']}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333333" />
          </TouchableOpacity>
          <Typography variant="h1" style={styles.headerTitle}>
            Write a Review
          </Typography>
        </LinearGradient>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            entering={FadeInUp.delay(100)}
            style={styles.serviceInfo}
          >
            <View style={styles.professionalContainer}>
              <Image
                source={{ uri: profileImage || DEFAULT_AVATAR }}
                style={styles.professionalImage}
              />
              <View style={styles.professionalDetails}>
                <Typography variant="h2" style={styles.professionalName}>
                  {professionalName}
                </Typography>
                <Typography variant="body1" style={styles.serviceName}>
                  {serviceName}
                </Typography>
              </View>
            </View>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.delay(200)}
            style={styles.ratingSection}
          >
            <Typography variant="h2" style={styles.sectionTitle}>
              Rate your experience
            </Typography>
            {renderStars()}
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.delay(300)}
            style={styles.commentSection}
          >
            <Typography variant="h2" style={styles.sectionTitle}>
              Write your review
            </Typography>
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Share your experience with others..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                value={comment}
                onChangeText={setComment}
                textAlignVertical="top"
                maxLength={500}
              />
              <Typography variant="caption" style={styles.characterCount}>
                {comment.length}/500 characters
              </Typography>
            </View>
          </Animated.View>
        </ScrollView>

        <Animated.View 
          entering={FadeInUp.delay(400)}
          style={styles.footer}
        >
          <TouchableOpacity
            style={[
              styles.submitButton,
              (isSubmitting || rating === 0 || !comment.trim()) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitReview}
            disabled={isSubmitting || rating === 0 || !comment.trim()}
          >
            <Typography variant="button" style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Typography>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5E0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: '#FFF8F6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  serviceInfo: {
    marginBottom: 24,
    backgroundColor: '#FFF8F6',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  professionalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  professionalImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#E0E0E0',
  },
  professionalDetails: {
    flex: 1,
  },
  professionalName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 16,
    color: '#666666',
  },
  ratingSection: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingDescription: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#FF5722',
  },
  commentSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  commentInputContainer: {
    backgroundColor: '#FFF8F6',
    borderRadius: 12,
    padding: 4,
  },
  commentInput: {
    borderWidth: 0,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  characterCount: {
    textAlign: 'right',
    marginTop: 8,
    marginRight: 8,
    color: '#666666',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#FFE5E0',
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#FF5722',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowColor: 'transparent',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 