// Database schema types for the Prim Mobile app

export type UserType = 'professional' | 'customer' | 'admin';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type NotificationType = 'booking_reminder' | 'review_request' | 'system_notification';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type PaymentMethodType = 'stripe' | 'paypal' | 'bank_transfer';
export type DepositType = 'percentage' | 'fixed';
export type CurrencyCode = 'USD' | 'GBP' | 'EUR';
export type MetricChangeType = 'positive' | 'negative' | 'neutral';
export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'year';
export type ChartType = 'line' | 'bar' | 'pie' | 'scatter';
export type ViewMode = 'day' | 'week' | 'month';
export type NotificationChannel = 'push' | 'email' | 'sms';
export type NotificationCategory = 
  | 'booking_new'
  | 'booking_reminder'
  | 'booking_cancelled'
  | 'booking_modified'
  | 'payment_received'
  | 'payment_failed'
  | 'review_received'
  | 'reward_earned'
  | 'promotion'
  | 'system';

// UI and Theme types
export type ThemeMode = 'light' | 'dark' | 'system';
export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'body1' | 'body2' | 'caption';
export type ColorScheme = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  error: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
};

export interface AppSettings {
  id: string;
  user_id: string;
  theme_mode: ThemeMode;
  color_scheme: ColorScheme;
  language: string;
  timezone: string;
  currency: CurrencyCode;
  date_format: string;
  time_format: '12h' | '24h';
  distance_unit: 'km' | 'mi';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  phone_number?: string;
  user_type: UserType;
  created_at: string;
  updated_at: string;
}

export interface ProfessionalProfile {
  id: string;
  user_id: string;
  name: string;
  title: string;
  about: string;
  avatar_url?: string;
  banner_image_url?: string;
  banner_colors: string[];
  rating: number;
  category: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  business_settings?: {
    booking_settings: BookingSettings;
    deposit_settings: DepositSettings;
    vat_settings: VATSettings;
    notification_settings: NotificationSettings;
  };
  portfolio?: Portfolio;
  schedule: Schedule;
  active_promotions: Promotion[];
  created_at: string;
  updated_at: string;
}

export interface BusinessHours {
  id: string;
  professional_id: string;
  day_of_week: DayOfWeek;
  is_open: boolean;
  start_time: string;
  end_time: string;
}

export interface Service {
  id: string;
  professional_id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  color: string;
  image_url?: string;
  description: string;
  is_active: boolean;
  category_id: string;
  category?: ServiceCategory;
  images: ServiceImage[];
  requirements?: string[];
  cancellation_policy?: string;
  preparation_instructions?: string[];
  promotion_id?: string;
  promotion?: Promotion;
  portfolio_images?: PortfolioImage[];
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  service_id: string;
  professional_id: string;
  customer_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  deposit_amount?: number;
  deposit_paid: boolean;
  deposit_payment_id?: string;
  cancellation_reason?: string;
  cancellation_date?: string;
  refund_status?: 'none' | 'pending' | 'completed';
  client_email: string;
  client_phone: string;
  client_notes?: string;
  professional_notes?: string;
  reminder_sent: boolean;
  reminder_send_at?: string;
  check_in_time?: string;
  check_out_time?: string;
  late_cancellation?: boolean;
  reschedule_count: number;
  reschedule_history?: {
    previous_date: string;
    previous_time: string;
    change_reason: string;
    changed_at: string;
  }[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  professional_id: string;
  rating: number;
  comment: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  category: NotificationCategory;
  channels: NotificationChannel[];
  recipient_id: string;
  recipient_type: 'professional' | 'customer';
  action_url?: string;
  action_data?: Record<string, any>;
  scheduled_for?: string;
  sent_via: NotificationChannel[];
  delivery_status: Record<NotificationChannel, 'pending' | 'sent' | 'failed'>;
  created_at: string;
}

export interface BusinessAnalytics {
  id: string;
  professional_id: string;
  date: string;
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  revenue: number;
  average_rating: number;
  revenue_breakdown: {
    services: number;
    deposits: number;
    cancellation_fees: number;
  };
  customer_metrics: {
    new_customers: number;
    returning_customers: number;
    cancellation_rate: number;
  };
  popular_services: Array<{
    service_id: string;
    bookings_count: number;
    revenue: number;
  }>;
  peak_hours: Array<{
    hour: number;
    bookings_count: number;
  }>;
  metrics: {
    total_revenue: BusinessMetric;
    total_bookings: BusinessMetric;
    new_clients: BusinessMetric;
    average_rating: BusinessMetric;
    repeat_customers: BusinessMetric;
    cancellation_rate: BusinessMetric;
  };
  charts: {
    monthly_revenue: AnalyticsChart;
    service_distribution: AnalyticsChart;
    customer_retention: AnalyticsChart;
    peak_hours: AnalyticsChart;
  };
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: PaymentMethodType;
  last4: string;
  expiry_date?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface DepositSettings {
  id: string;
  professional_id: string;
  require_deposit: boolean;
  deposit_type: DepositType;
  deposit_percentage?: number;
  deposit_amount?: number;
  minimum_booking_value: number;
  is_refundable: boolean;
  refund_period_hours: number;
  created_at: string;
  updated_at: string;
}

export interface BookingSettings {
  id: string;
  professional_id: string;
  auto_accept: boolean;
  require_deposit: boolean;
  allow_cancellations: boolean;
  send_reminders: boolean;
  buffer_time_minutes: number;
  max_advance_booking_days: number;
  min_notice_hours: number;
  cancellation_policy?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  reminder_before_hours: number;
  marketing_emails: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  booking_id?: string;
  user_id: string;
  amount: number;
  currency: CurrencyCode;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method_id: string;
  type: 'payment' | 'deposit' | 'refund';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface VATSettings {
  id: string;
  professional_id: string;
  vat_number?: string;
  vat_rate: number;
  is_vat_registered: boolean;
  created_at: string;
  updated_at: string;
}

// Customer related types
export interface CustomerProfile {
  id: string;
  user_id: string;
  addresses: Address[];
  default_address_id?: string;
  favorite_professionals: string[];
  rewards: RewardsProfile;
  notification_settings: NotificationSettings;
  app_settings: AppSettings;
  favorite_services: string[];
  saved_promotions: string[];
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  name: string;
  street: string;
  city: string;
  postcode: string;
  is_default: boolean;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface RewardsProfile {
  id: string;
  user_id: string;
  points_balance: number;
  tier: RewardsTier;
  lifetime_points: number;
  bookings_count: number;
  created_at: string;
  updated_at: string;
}

export interface RewardsTier {
  id: string;
  name: string;
  required_points: number;
  benefits: RewardBenefit[];
  icon: string;
}

export interface RewardBenefit {
  id: string;
  name: string;
  description: string;
  points_required: number;
  discount_percentage?: number;
  discount_amount?: number;
  valid_days: number;
  icon: string;
}

export interface PointsTransaction {
  id: string;
  user_id: string;
  type: 'earned' | 'redeemed' | 'expired';
  points: number;
  description: string;
  booking_id?: string;
  reward_id?: string;
  created_at: string;
}

// Service related types
export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  parent_category_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceImage {
  id: string;
  service_id: string;
  url: string;
  is_primary: boolean;
  order: number;
  created_at: string;
}

// Favorite and Rating types
export interface FavoriteProfessional {
  id: string;
  user_id: string;
  professional_id: string;
  created_at: string;
}

export interface ServiceRating {
  id: string;
  service_id: string;
  user_id: string;
  booking_id: string;
  rating: number;
  review?: string;
  created_at: string;
  updated_at: string;
}

// Professional Portfolio
export interface Portfolio {
  id: string;
  professional_id: string;
  title: string;
  description: string;
  images: PortfolioImage[];
  categories: string[];
  is_featured: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export interface PortfolioImage {
  id: string;
  portfolio_id: string;
  url: string;
  thumbnail_url: string;
  description?: string;
  order: number;
  metadata?: {
    width: number;
    height: number;
    size: number;
    format: string;
  };
  created_at: string;
}

// Marketing and Promotions
export interface Promotion {
  id: string;
  professional_id: string;
  title: string;
  description: string;
  type: 'discount' | 'package' | 'special_offer';
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  services: string[];
  start_date: string;
  end_date: string;
  usage_limit?: number;
  used_count: number;
  conditions?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Availability and Schedule
export interface Schedule {
  id: string;
  professional_id: string;
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
  regular_hours: Record<DayOfWeek, DaySchedule>;
  special_hours: SpecialHours[];
  break_times: BreakTime[];
  created_at: string;
  updated_at: string;
}

export interface DaySchedule {
  is_working_day: boolean;
  start_time?: string;
  end_time?: string;
  max_appointments?: number;
}

export interface SpecialHours {
  id: string;
  schedule_id: string;
  date: string;
  is_working_day: boolean;
  start_time?: string;
  end_time?: string;
  reason?: string;
  created_at: string;
}

export interface BreakTime {
  id: string;
  schedule_id: string;
  day_of_week?: DayOfWeek;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  created_at: string;
}

// Helper type for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper types for common queries
export interface ServiceWithProfessional extends Service {
  professional: ProfessionalProfile;
}

export interface BookingWithDetails extends Booking {
  service: Service;
  professional: ProfessionalProfile;
  customer: User;
  review?: Review;
}

export interface ProfessionalWithServices extends ProfessionalProfile {
  services: Service[];
  business_hours: BusinessHours[];
}

// Search types
export interface SearchFilters {
  category?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
  };
  price_range?: {
    min: number;
    max: number;
  };
  rating?: number;
  availability?: {
    date: string;
    start_time: string;
    end_time: string;
  };
  service_categories?: string[];
  has_rewards_program?: boolean;
  accepts_card_payment?: boolean;
  sort_by?: 'rating' | 'distance' | 'price_low' | 'price_high' | 'availability';
  page?: number;
  per_page?: number;
}

export interface SearchResults {
  professionals: ProfessionalWithServices[];
  total_count: number;
  page: number;
  per_page: number;
}

// Analytics types
export interface MetricChange {
  value: number;
  percentage: number;
  type: MetricChangeType;
  comparison_period: AnalyticsPeriod;
}

export interface BusinessMetric {
  id: string;
  professional_id: string;
  name: string;
  value: number;
  currency?: string;
  change: MetricChange;
  period: AnalyticsPeriod;
  created_at: string;
}

export interface AnalyticsChart {
  id: string;
  professional_id: string;
  title: string;
  type: ChartType;
  data: any; // Specific chart data structure
  period: AnalyticsPeriod;
  created_at: string;
}

// Calendar and Booking types
export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_buffer: boolean;
  booking_id?: string;
}

export interface CalendarDay {
  date: string;
  time_slots: TimeSlot[];
  is_past: boolean;
  is_holiday?: boolean;
  special_hours?: {
    start_time: string;
    end_time: string;
  };
}

// Notification types
export interface NotificationTemplate {
  id: string;
  category: NotificationCategory;
  title_template: string;
  message_template: string;
  channels: NotificationChannel[];
  active: boolean;
}

// Help and Support types
export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'account' | 'service' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  attachments?: string[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: 'user' | 'support' | 'system';
  message: string;
  attachments?: string[];
  created_at: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
}
