import { Database } from '@supabase/supabase-js';
import {
  User,
  Business,
  Service,
  Booking,
  Address,
  BusinessHours,
  AppointmentType,
  BookingRules,
  PaymentSettings,
  NotificationSettings,
  Review,
  Analytics
} from '../types/schema';

export type Tables = {
  // Users table
  users: {
    Row: User;
    Insert: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt'>;
    Update: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;
  };

  // Businesses table
  businesses: {
    Row: Business;
    Insert: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>;
    Update: Partial<Omit<Business, 'id' | 'createdAt' | 'updatedAt'>>;
  };

  // Services table
  services: {
    Row: Service;
    Insert: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>;
    Update: Partial<Omit<Service, 'id' | 'createdAt' | 'updatedAt'>>;
  };

  // Bookings table
  bookings: {
    Row: Booking;
    Insert: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>;
    Update: Partial<Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>>;
  };

  // Addresses table (could be part of businesses or as separate table)
  addresses: {
    Row: Address & { id: string; businessId: string };
    Insert: Omit<Address & { businessId: string }, 'id'>;
    Update: Partial<Address>;
  };

  // Business Hours table
  business_hours: {
    Row: {
      id: string;
      businessId: string;
      dayOfWeek: keyof BusinessHours;
      isOpen: boolean;
      openTime?: string;
      closeTime?: string;
      breaks?: {
        start: string;
        end: string;
      }[];
    };
    Insert: Omit<Row, 'id'>;
    Update: Partial<Omit<Row, 'id' | 'businessId'>>;
  };

  // Appointment Types table
  appointment_types: {
    Row: AppointmentType;
    Insert: Omit<AppointmentType, 'id'>;
    Update: Partial<Omit<AppointmentType, 'id' | 'businessId'>>;
  };

  // Booking Rules table
  booking_rules: {
    Row: BookingRules & { id: string; businessId: string };
    Insert: BookingRules & { businessId: string };
    Update: Partial<BookingRules>;
  };

  // Payment Settings table
  payment_settings: {
    Row: PaymentSettings & { id: string; businessId: string };
    Insert: PaymentSettings & { businessId: string };
    Update: Partial<PaymentSettings>;
  };

  // Notification Settings table
  notification_settings: {
    Row: NotificationSettings & { id: string; businessId: string };
    Insert: NotificationSettings & { businessId: string };
    Update: Partial<NotificationSettings>;
  };

  // Reviews table
  reviews: {
    Row: Review;
    Insert: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>;
    Update: Partial<Omit<Review, 'id' | 'createdAt' | 'updatedAt'>>;
  };

  // Analytics table
  analytics: {
    Row: Analytics & { id: string };
    Insert: Omit<Analytics, 'id'>;
    Update: Partial<Analytics>;
  };

  // Professionals table
  professionals: {
    Row: {
      id: string;
      userId: string;
      name: string;
      title: string;
      businessName: string;
      about: string;
      yearsOfExperience: number;
      profileImage: string;
      bannerImage: string;
      rating: number;
      reviewCount: number;
      businessHours: {
        Monday: {
          isOpen: boolean;
          openTime: string;
          closeTime: string;
        };
        Tuesday: {
          isOpen: boolean;
          openTime: string;
          closeTime: string;
        };
        Wednesday: {
          isOpen: boolean;
          openTime: string;
          closeTime: string;
        };
        Thursday: {
          isOpen: boolean;
          openTime: string;
          closeTime: string;
        };
        Friday: {
          isOpen: boolean;
          openTime: string;
          closeTime: string;
        };
        Saturday: {
          isOpen: boolean;
          openTime: string;
          closeTime: string;
        };
        Sunday: {
          isOpen: boolean;
          openTime: string;
          closeTime: string;
        };
      };
      createdAt: string;
      updatedAt: string;
    };
    Insert: Omit<Row, 'id'>;
    Update: Partial<Omit<Row, 'id' | 'userId'>>;
  };
};

// Database type with tables
export type Database = {
  public: Tables;
};

// Helper type for getting table names
export type TableName = keyof Database['public'];

// Helper type for getting a specific table's row type
export type TableRow<T extends TableName> = Database['public'][T]['Row'];

// Helper type for getting a specific table's insert type
export type TableInsert<T extends TableName> = Database['public'][T]['Insert'];

// Helper type for getting a specific table's update type
export type TableUpdate<T extends TableName> = Database['public'][T]['Update'];

// SQL Definitions for creating tables
export const SQL_DEFINITIONS = {
  users: `
    CREATE TABLE users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      email VARCHAR NOT NULL UNIQUE,
      phone VARCHAR,
      first_name VARCHAR NOT NULL,
      last_name VARCHAR NOT NULL,
      type user_type NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_login_at TIMESTAMP WITH TIME ZONE,
      is_active BOOLEAN DEFAULT TRUE,
      profile_image VARCHAR,
      notification_preferences JSONB NOT NULL DEFAULT '{}'::jsonb
    );
  `,

  businesses: `
    CREATE TABLE businesses (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR NOT NULL,
      description TEXT,
      phone VARCHAR NOT NULL,
      email VARCHAR NOT NULL,
      address JSONB NOT NULL,
      vat_number VARCHAR,
      business_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
      services JSONB NOT NULL DEFAULT '[]'::jsonb,
      appointment_types JSONB NOT NULL DEFAULT '[]'::jsonb,
      booking_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
      payment_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
      notification_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,

  services: `
    CREATE TABLE services (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
      name VARCHAR NOT NULL,
      description TEXT,
      duration INTEGER NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,

  bookings: `
    CREATE TABLE bookings (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
      customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
      service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
      professional_id UUID REFERENCES professionals(id) ON DELETE RESTRICT,
      start_time TIMESTAMP WITH TIME ZONE NOT NULL,
      end_time TIMESTAMP WITH TIME ZONE NOT NULL,
      status booking_status DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,

  reviews: `
    CREATE TABLE reviews (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
      customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
      booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      reply TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,

  analytics: `
    CREATE TABLE analytics (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
      period analytics_period NOT NULL,
      metrics JSONB NOT NULL,
      start_date TIMESTAMP WITH TIME ZONE NOT NULL,
      end_date TIMESTAMP WITH TIME ZONE NOT NULL
    );
  `,

  professionals: `
    CREATE TABLE professionals (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR NOT NULL,
      title VARCHAR,
      business_name VARCHAR,
      about TEXT,
      years_of_experience INTEGER,
      profile_image VARCHAR,
      banner_image VARCHAR,
      rating DECIMAL(2,1) DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      business_hours JSONB DEFAULT '{
        "Monday": {"isOpen": true, "openTime": "09:00", "closeTime": "17:00"},
        "Tuesday": {"isOpen": true, "openTime": "09:00", "closeTime": "17:00"},
        "Wednesday": {"isOpen": true, "openTime": "09:00", "closeTime": "17:00"},
        "Thursday": {"isOpen": true, "openTime": "09:00", "closeTime": "17:00"},
        "Friday": {"isOpen": true, "openTime": "09:00", "closeTime": "17:00"},
        "Saturday": {"isOpen": false, "openTime": "10:00", "closeTime": "16:00"},
        "Sunday": {"isOpen": false, "openTime": "10:00", "closeTime": "16:00"}
      }'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
};

// Enums SQL definitions
export const ENUM_DEFINITIONS = `
  CREATE TYPE user_type AS ENUM ('professional', 'customer', 'admin');
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
  CREATE TYPE currency_code AS ENUM ('USD', 'GBP', 'EUR');
  CREATE TYPE analytics_period AS ENUM ('day', 'week', 'month', 'year');
`; 