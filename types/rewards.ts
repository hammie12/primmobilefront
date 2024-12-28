export interface Reward {
  id: number;
  name: string;
  points_required: number;
  description: string;
  icon_name: keyof typeof import('@expo/vector-icons/build/MaterialCommunityIcons').glyphMap;
  is_active: boolean;
}

export interface PointsActivity {
  id: number;
  user_id: string;
  points: number;
  type: 'earned' | 'redeemed';
  description: string;
  created_at: string;
}

export interface UserRewards {
  total_points: number;
  bookings_count: number;
} 