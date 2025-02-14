export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string
          county: string
          created_at: string | null
          customer_profile_id: string | null
          id: string
          is_default: boolean
          postal_code: string
          postcode: string
          professional_id: string | null
          state: string
          street: string
          updated_at: string | null
        }
        Insert: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string
          county?: string
          created_at?: string | null
          customer_profile_id?: string | null
          id?: string
          is_default?: boolean
          postal_code?: string
          postcode: string
          professional_id?: string | null
          state?: string
          street?: string
          updated_at?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string
          county?: string
          created_at?: string | null
          customer_profile_id?: string | null
          id?: string
          is_default?: boolean
          postal_code?: string
          postcode?: string
          professional_id?: string | null
          state?: string
          street?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_customer_profile_id_fkey"
            columns: ["customer_profile_id"]
            isOneToOne: true
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "addresses_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: true
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          created_at: string | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      booking_status_history: {
        Row: {
          booking_id: string
          created_at: string | null
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["booking_status"]
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          status: Database["public"]["Enums"]["booking_status"]
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
        }
        Relationships: [
          {
            foreignKeyName: "booking_status_history_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_status_history_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "professional_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_status_history_booking_id_fkey1"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_status_history_booking_id_fkey1"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "professional_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_status_updates: {
        Row: {
          booking_id: string
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["booking_status"]
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          status: Database["public"]["Enums"]["booking_status"]
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
        }
        Relationships: [
          {
            foreignKeyName: "booking_status_updates_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_status_updates_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "professional_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          business_id: string | null
          completed_at: string | null
          completion_notes: string | null
          created_at: string | null
          customer_id: string | null
          end_time: string
          id: string
          notes: string | null
          professional_id: string | null
          schedule_id: string | null
          service_id: string | null
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          customer_id?: string | null
          end_time: string
          id?: string
          notes?: string | null
          professional_id?: string | null
          schedule_id?: string | null
          service_id?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          customer_id?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          professional_id?: string | null
          schedule_id?: string | null
          service_id?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      breaks: {
        Row: {
          created_at: string | null
          end_time: string
          id: string
          schedule_id: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_time: string
          id?: string
          schedule_id?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string
          id?: string
          schedule_id?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "breaks_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: Json
          appointment_types: Json
          booking_rules: Json
          business_hours: Json
          created_at: string | null
          description: string | null
          email: string
          id: string
          name: string
          notification_settings: Json
          owner_id: string | null
          payment_settings: Json
          phone: string
          services: Json
          updated_at: string | null
          vat_number: string | null
        }
        Insert: {
          address: Json
          appointment_types?: Json
          booking_rules?: Json
          business_hours?: Json
          created_at?: string | null
          description?: string | null
          email: string
          id?: string
          name: string
          notification_settings?: Json
          owner_id?: string | null
          payment_settings?: Json
          phone: string
          services?: Json
          updated_at?: string | null
          vat_number?: string | null
        }
        Update: {
          address?: Json
          appointment_types?: Json
          booking_rules?: Json
          business_hours?: Json
          created_at?: string | null
          description?: string | null
          email?: string
          id?: string
          name?: string
          notification_settings?: Json
          owner_id?: string | null
          payment_settings?: Json
          phone?: string
          services?: Json
          updated_at?: string | null
          vat_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          first_name: string
          id: string
          last_name: string
          phone_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          first_name: string
          id?: string
          last_name: string
          phone_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          created_at: string
          expiry_date: string | null
          id: string
          is_default: boolean | null
          last4: string
          payment_method_id: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_default?: boolean | null
          last4: string
          payment_method_id: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_default?: boolean | null
          last4?: string
          payment_method_id?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          id?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "professional_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_images: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          portfolio_id: string | null
          thumbnail_url: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          portfolio_id?: string | null
          thumbnail_url: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          portfolio_id?: string | null
          thumbnail_url?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_images_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          professional_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          professional_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          professional_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: true
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_metrics: {
        Row: {
          average_rating: number | null
          bookings_by_hour: Json | null
          created_at: string | null
          date: string
          id: string
          professional_id: string | null
          revenue_by_service: Json | null
          total_bookings: number | null
          total_revenue: number | null
          unique_clients: number | null
          updated_at: string | null
        }
        Insert: {
          average_rating?: number | null
          bookings_by_hour?: Json | null
          created_at?: string | null
          date: string
          id?: string
          professional_id?: string | null
          revenue_by_service?: Json | null
          total_bookings?: number | null
          total_revenue?: number | null
          unique_clients?: number | null
          updated_at?: string | null
        }
        Update: {
          average_rating?: number | null
          bookings_by_hour?: Json | null
          created_at?: string | null
          date?: string
          id?: string
          professional_id?: string | null
          revenue_by_service?: Json | null
          total_bookings?: number | null
          total_revenue?: number | null
          unique_clients?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_metrics_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_profiles: {
        Row: {
          about: string | null
          average_rating: number | null
          business_name: string
          created_at: string | null
          email: string | null
          first_name: string | null
          header_image: string | null
          id: string
          last_name: string | null
          number_of_reviews: number | null
          phone_number: string | null
          profile_image: string | null
          updated_at: string | null
          user_id: string | null
          years_of_experience: number | null
        }
        Insert: {
          about?: string | null
          average_rating?: number | null
          business_name: string
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          header_image?: string | null
          id?: string
          last_name?: string | null
          number_of_reviews?: number | null
          phone_number?: string | null
          profile_image?: string | null
          updated_at?: string | null
          user_id?: string | null
          years_of_experience?: number | null
        }
        Update: {
          about?: string | null
          average_rating?: number | null
          business_name?: string
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          header_image?: string | null
          id?: string
          last_name?: string | null
          number_of_reviews?: number | null
          phone_number?: string | null
          profile_image?: string | null
          updated_at?: string | null
          user_id?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          about: string | null
          address: string | null
          banner_image: string | null
          business_name: string | null
          category: string | null
          created_at: string | null
          email: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          profile_image: string | null
          rating: number | null
          review_count: number | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
          years_of_experience: number | null
        }
        Insert: {
          about?: string | null
          address?: string | null
          banner_image?: string | null
          business_name?: string | null
          category?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          profile_image?: string | null
          rating?: number | null
          review_count?: number | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
          years_of_experience?: number | null
        }
        Update: {
          about?: string | null
          address?: string | null
          banner_image?: string | null
          business_name?: string | null
          category?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          profile_image?: string | null
          rating?: number | null
          review_count?: number | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "professionals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          rating: number
          review: string | null
          updated_at: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          rating: number
          review?: string | null
          updated_at?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          review?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "professional_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payment_id: string | null
          reason: string
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payment_id?: string | null
          reason: string
          status: Database["public"]["Enums"]["payment_status"]
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payment_id?: string | null
          reason?: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          professional_id: string | null
          rating: number
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          professional_id?: string | null
          rating: number
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          professional_id?: string | null
          rating?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards_profiles: {
        Row: {
          created_at: string | null
          customer_profile_id: string | null
          id: string
          points: number | null
          tier: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_profile_id?: string | null
          id?: string
          points?: number | null
          tier?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_profile_id?: string | null
          id?: string
          points?: number | null
          tier?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_profiles_customer_profile_id_fkey"
            columns: ["customer_profile_id"]
            isOneToOne: true
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string | null
          id: string
          professional_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          professional_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          professional_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: true
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_images: {
        Row: {
          created_at: string | null
          id: string
          service_id: string | null
          thumbnail_url: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          service_id?: string | null
          thumbnail_url: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          service_id?: string | null
          thumbnail_url?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_images_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string
          created_at: string | null
          deposit_price: number
          description: string
          duration_hours: number
          duration_minutes: number
          duration_total_minutes: number
          full_price: number
          id: string
          images: string[] | null
          name: string
          professional_id: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          deposit_price: number
          description: string
          duration_hours?: number
          duration_minutes?: number
          duration_total_minutes: number
          full_price?: number
          id?: string
          images?: string[] | null
          name: string
          professional_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          deposit_price?: number
          description?: string
          duration_hours?: number
          duration_minutes?: number
          duration_total_minutes?: number
          full_price?: number
          id?: string
          images?: string[] | null
          name?: string
          professional_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          payment_id: string | null
          refund_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          id?: string
          payment_id?: string | null
          refund_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          payment_id?: string | null
          refund_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_refund_id_fkey"
            columns: ["refund_id"]
            isOneToOne: false
            referencedRelation: "refunds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          password: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          password?: string | null
          role: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          password?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      working_hours: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_open: boolean | null
          professional_id: string | null
          schedule_id: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_open?: boolean | null
          professional_id?: string | null
          schedule_id?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_open?: boolean | null
          professional_id?: string | null
          schedule_id?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "working_hours_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "working_hours_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      client_retention_metrics: {
        Row: {
          month: string | null
          new_clients: number | null
          professional_id: string | null
          repeat_visit_rate: number | null
          repeat_visits: number | null
          total_visits: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      popular_booking_times: {
        Row: {
          avg_appointment_duration: number | null
          day_of_week: number | null
          hour_of_day: number | null
          number_of_bookings: number | null
          professional_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_bookings: {
        Row: {
          customer_first_name: string | null
          customer_last_name: string | null
          end_time: string | null
          id: string | null
          professional_id: string | null
          service_duration: number | null
          service_id: string | null
          service_name: string | null
          service_price: number | null
          start_time: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_customer_retention: {
        Row: {
          customer_id: string | null
          customer_lifetime: unknown | null
          first_booking: string | null
          last_booking: string | null
          professional_id: string | null
          total_bookings: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_popular_hours: {
        Row: {
          booking_count: number | null
          day_of_week: number | null
          hour_of_day: number | null
          professional_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_revenue_periods: {
        Row: {
          booking_date: string | null
          booking_month: string | null
          booking_week: string | null
          booking_year: string | null
          number_of_bookings: number | null
          professional_id: string | null
          revenue: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_time_metrics: {
        Row: {
          average_rating: number | null
          new_clients: number | null
          period_start: string | null
          period_type: string | null
          professional_id: string | null
          total_bookings: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      revenue_by_service_type: {
        Row: {
          average_revenue_per_booking: number | null
          category: string | null
          month: string | null
          number_of_bookings: number | null
          professional_id: string | null
          total_revenue: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_booking_conflict:
        | {
            Args: {
              p_professional_id: string
              p_start_time: string
              p_end_time: string
            }
            Returns: boolean
          }
        | {
            Args: {
              p_professional_id: string
              p_start_time: string
              p_end_time: string
              p_booking_id?: string
            }
            Returns: boolean
          }
      check_booking_overlap: {
        Args: {
          p_start_time: string
          p_end_time: string
          p_professional_id: string
        }
        Returns: boolean
      }
      check_booking_time_overlap: {
        Args: {
          start_time: string
          end_time: string
          professional_id: string
        }
        Returns: boolean
      }
      complete_booking: {
        Args: {
          p_booking_id: string
          p_completion_notes?: string
        }
        Returns: boolean
      }
      complete_booking_no_overlap_check: {
        Args: {
          booking_id: string
          completion_notes?: string
        }
        Returns: boolean
      }
      create_booking: {
        Args: {
          p_professional_id: string
          p_customer_id: string
          p_start_time: string
          p_end_time: string
          p_status?: Database["public"]["Enums"]["booking_status"]
        }
        Returns: string
      }
      create_new_user: {
        Args: {
          user_id: string
          user_email: string
          user_role: string
          first_name: string
          last_name: string
          business_name?: string
        }
        Returns: undefined
      }
      create_payment_intent: {
        Args: {
          p_amount: number
          p_currency: string
          p_customer_email: string
          p_metadata: Json
        }
        Returns: Json
      }
      create_setup_intent: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      create_simple_booking: {
        Args: {
          p_customer_id: string
          p_professional_id: string
          p_service_id: string
          p_start_time: string
          p_end_time: string
        }
        Returns: Json
      }
      dblink: {
        Args: {
          "": string
        }
        Returns: Record<string, unknown>[]
      }
      dblink_cancel_query: {
        Args: {
          "": string
        }
        Returns: string
      }
      dblink_close: {
        Args: {
          "": string
        }
        Returns: string
      }
      dblink_connect: {
        Args: {
          "": string
        }
        Returns: string
      }
      dblink_connect_u: {
        Args: {
          "": string
        }
        Returns: string
      }
      dblink_current_query: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dblink_disconnect:
        | {
            Args: Record<PropertyKey, never>
            Returns: string
          }
        | {
            Args: {
              "": string
            }
            Returns: string
          }
      dblink_error_message: {
        Args: {
          "": string
        }
        Returns: string
      }
      dblink_exec: {
        Args: {
          "": string
        }
        Returns: string
      }
      dblink_fdw_validator: {
        Args: {
          options: string[]
          catalog: unknown
        }
        Returns: undefined
      }
      dblink_get_connections: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      dblink_get_notify:
        | {
            Args: Record<PropertyKey, never>
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              conname: string
            }
            Returns: Record<string, unknown>[]
          }
      dblink_get_pkey: {
        Args: {
          "": string
        }
        Returns: Database["public"]["CompositeTypes"]["dblink_pkey_results"][]
      }
      dblink_get_result: {
        Args: {
          "": string
        }
        Returns: Record<string, unknown>[]
      }
      dblink_is_busy: {
        Args: {
          "": string
        }
        Returns: number
      }
      delete_payment_method: {
        Args: {
          payment_method_id: string
        }
        Returns: Json
      }
      force_complete_booking: {
        Args: {
          p_booking_id: string
          p_completion_notes?: string
        }
        Returns: boolean
      }
      gbt_bit_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_bool_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_bool_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_bpchar_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_bytea_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_cash_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_cash_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_date_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_date_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_enum_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_enum_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_float4_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_float4_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_float8_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_float8_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_inet_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_int2_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_int2_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_int4_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_int4_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_int8_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_int8_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_intv_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_intv_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_intv_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_macad_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_macad_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_macad8_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_macad8_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_numeric_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_oid_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_oid_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_text_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_time_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_time_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_timetz_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_ts_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_ts_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_tstz_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_uuid_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_uuid_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_var_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbt_var_fetch: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey_var_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey_var_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey16_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey16_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey2_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey2_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey32_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey32_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey4_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey4_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey8_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gbtreekey8_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      get_payment_method: {
        Args: {
          payment_method_id: string
        }
        Returns: Json
      }
      get_setting: {
        Args: {
          setting_key: string
        }
        Returns: string
      }
      get_setup_intent: {
        Args: {
          client_secret: string
        }
        Returns: Json
      }
      reschedule_booking: {
        Args: {
          p_old_booking_id: string
          p_professional_id: string
          p_customer_id: string
          p_service_id: string
          p_start_time: string
          p_end_time: string
          p_status: Database["public"]["Enums"]["booking_status"]
        }
        Returns: string
      }
      submit_review: {
        Args: {
          p_professional_id: string
          p_customer_id: string
          p_booking_id: string
          p_rating: number
          p_comment: string
        }
        Returns: Json
      }
      update_booking_status: {
        Args: {
          p_booking_id: string
          p_status: Database["public"]["Enums"]["booking_status"]
          p_notes?: string
        }
        Returns: boolean
      }
      update_booking_status_direct: {
        Args: {
          p_booking_id: string
          p_status: Database["public"]["Enums"]["booking_status"]
          p_notes?: string
        }
        Returns: boolean
      }
      update_professional_metrics: {
        Args: {
          p_date: string
        }
        Returns: undefined
      }
    }
    Enums: {
      booking_status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
      payment_method: "CREDIT_CARD" | "DEBIT_CARD" | "PAYPAL"
      payment_status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
      service_category: "hair" | "nails" | "lashes"
      transaction_type: "PAYMENT" | "REFUND" | "EARNING" | "WITHDRAWAL"
      user_role: "CUSTOMER" | "PROFESSIONAL" | "ADMIN"
      user_role_enum: "CUSTOMER" | "PROFESSIONAL"
      user_status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
    }
    CompositeTypes: {
      dblink_pkey_results: {
        position: number | null
        colname: string | null
      }
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
