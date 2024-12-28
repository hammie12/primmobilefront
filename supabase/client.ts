import { createClient } from '@supabase/supabase-js';
import { Database } from './schema';
import Constants from 'expo-constants';

// Get the environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anonymous Key. Please check your app.config.js file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Typed helper functions for common operations
export const db = {
  // Users
  users: {
    get: (id: string) => 
      supabase.from('users').select('*').eq('id', id).single(),
    update: (id: string, data: Database['public']['users']['Update']) =>
      supabase.from('users').update(data).eq('id', id),
    create: (data: Database['public']['users']['Insert']) =>
      supabase.from('users').insert(data),
  },

  // Businesses
  businesses: {
    get: (id: string) => 
      supabase.from('businesses').select('*').eq('id', id).single(),
    getByOwner: (ownerId: string) =>
      supabase.from('businesses').select('*').eq('owner_id', ownerId),
    update: (id: string, data: Database['public']['businesses']['Update']) =>
      supabase.from('businesses').update(data).eq('id', id),
    create: (data: Database['public']['businesses']['Insert']) =>
      supabase.from('businesses').insert(data),
  },

  // Services
  services: {
    getByBusiness: (businessId: string) =>
      supabase.from('services').select('*').eq('business_id', businessId),
    create: (data: Database['public']['services']['Insert']) =>
      supabase.from('services').insert(data),
    update: (id: string, data: Database['public']['services']['Update']) =>
      supabase.from('services').update(data).eq('id', id),
    delete: (id: string) =>
      supabase.from('services').delete().eq('id', id),
  },

  // Bookings
  bookings: {
    getByBusiness: (businessId: string) =>
      supabase
        .from('bookings')
        .select(`
          *,
          services (
            id,
            name,
            price,
            duration
          ),
          users:customer_id (
            id,
            email,
            full_name
          ),
          professionals (
            id,
            name
          )
        `)
        .eq('business_id', businessId)
        .order('start_time', { ascending: true }),

    getByCustomer: (customerId: string) =>
      supabase
        .from('bookings')
        .select(`
          *,
          services (
            id,
            name,
            price,
            duration
          ),
          businesses:business_id (
            id,
            name
          ),
          professionals (
            id,
            name
          )
        `)
        .eq('customer_id', customerId)
        .order('start_time', { ascending: true }),

    create: (data: Database['public']['bookings']['Insert']) =>
      supabase.from('bookings').insert(data),

    update: (id: string, data: Database['public']['bookings']['Update']) =>
      supabase.from('bookings').update(data).eq('id', id),

    delete: (id: string) =>
      supabase.from('bookings').delete().eq('id', id),
  },

  // Reviews
  reviews: {
    getByBusiness: (businessId: string) =>
      supabase.from('reviews').select('*').eq('business_id', businessId),
    getByBooking: (bookingId: string) =>
      supabase.from('reviews').select('*').eq('booking_id', bookingId).single(),
    create: (data: Database['public']['reviews']['Insert']) =>
      supabase.from('reviews').insert(data),
    update: (id: string, data: Database['public']['reviews']['Update']) =>
      supabase.from('reviews').update(data).eq('id', id),
  },

  // Analytics
  analytics: {
    getByBusiness: (businessId: string, period: Database['public']['analytics']['Row']['period']) =>
      supabase
        .from('analytics')
        .select('*')
        .eq('business_id', businessId)
        .eq('period', period)
        .single(),
    create: (data: Database['public']['analytics']['Insert']) =>
      supabase.from('analytics').insert(data),
    update: (id: string, data: Database['public']['analytics']['Update']) =>
      supabase.from('analytics').update(data).eq('id', id),
  },
};

// Real-time subscriptions helper
export const subscriptions = {
  bookings: (businessId: string, callback: (booking: Database['public']['bookings']['Row']) => void) => {
    return supabase
      .channel('bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => callback(payload.new as Database['public']['bookings']['Row'])
      )
      .subscribe();
  },

  services: (businessId: string, callback: (service: Database['public']['services']['Row']) => void) => {
    return supabase
      .channel('services')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services',
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => callback(payload.new as Database['public']['services']['Row'])
      )
      .subscribe();
  },
}; 