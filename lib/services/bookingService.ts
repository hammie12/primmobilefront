import { supabase } from '../supabase';
import { Database } from '../supabase/schema';
import { TablesInsert, TableRow } from '../supabase/types';
import { createOrRetrievePayment } from '../supabase';
import { format } from 'date-fns';

type BookingValidationError = {
  code: string;
  message: string;
  details?: any;
};

type CreateBookingParams = {
  userId: string;
  professionalId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  professionalName: string;
  date: string;
  time: string;
  paymentMethodId: string;
  serviceId: string;
};

type BookingResult = {
  success: boolean;
  bookingId?: string;
  error?: BookingValidationError;
  formattedDateTime?: string;
};

type BusinessHours = {
  [key: string]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
};

export class BookingService {
  // Get professional's working hours
  public async getWorkingHours(professionalId: string): Promise<BusinessHours | null> {
    try {
      console.log('Fetching working hours for professional:', professionalId);
      
      // Fetch working hours as a single row with all days
      const { data: workingHours, error } = await supabase
        .from('professional_working_hours')  // Using the correct table name
        .select('*')
        .eq('professional_id', professionalId)
        .single();

      if (error) {
        console.error('Error fetching working hours:', error);
        // Instead of throwing, return default hours
        const defaultHours = this.getDefaultWorkingHours();
        return defaultHours;
      }

      // Map numbers to days
      const dayMap: { [key: number]: string } = {
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday',
        7: 'Sunday'
      };

      if (!workingHours) {
        return this.getDefaultWorkingHours();
      }

      // Transform working hours data into BusinessHours format
      const validatedHours: BusinessHours = {};

      for (let i = 1; i <= 7; i++) {
        validatedHours[dayMap[i]] = {
          isOpen: workingHours[`is_open_${i}`] ?? true,
          openTime: workingHours[`open_time_${i}`] || '09:00',
          closeTime: workingHours[`close_time_${i}`] || '17:00'
        };
      }

      return validatedHours;
    } catch (error) {
      console.error('Error in getWorkingHours:', error);
      return this.getDefaultWorkingHours();
    }
  }

  private getDefaultWorkingHours(): BusinessHours {
    const dayMap: { [key: number]: string } = {
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday',
      7: 'Sunday'
    };

    const defaultHours: BusinessHours = {};
    
    for (let i = 1; i <= 7; i++) {
      defaultHours[dayMap[i]] = {
        isOpen: true,
        openTime: '09:00',
        closeTime: '17:00'
      };
    }
    
    return defaultHours;
  }

  // Get available time slots for a specific date
  public async getAvailableTimeSlots(
    professionalId: string,
    date: Date,
    duration: number
  ): Promise<string[]> {
    try {
      // Get working hours for the day
      const workingHours = await this.getWorkingHours(professionalId);
      if (!workingHours) {
        console.log('No working hours found');
        return [];
      }

      const dayOfWeek = date.getDay();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const daySchedule = workingHours[days[dayOfWeek]];

      if (!daySchedule || !daySchedule.isOpen) {
        console.log('Day is not a working day:', days[dayOfWeek]);
        return [];
      }

      console.log('Working hours for', days[dayOfWeek], ':', daySchedule);

      // Get existing bookings for the date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('professional_id', professionalId)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .neq('status', 'CANCELLED');

      if (error) throw error;

      // Generate available time slots
      const slots: string[] = [];
      const [openHour, openMinute] = daySchedule.openTime.split(':').map(Number);
      const [closeHour, closeMinute] = daySchedule.closeTime.split(':').map(Number);

      console.log('Generating slots between', `${openHour}:${openMinute}`, 'and', `${closeHour}:${closeMinute}`);

      for (let hour = openHour; hour < closeHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          // Skip times before opening if we're on the opening hour
          if (hour === openHour && minute < openMinute) continue;
          // Skip times after closing if we're on the closing hour
          if (hour === closeHour && minute > closeMinute) continue;

          const slotTime = new Date(date);
          slotTime.setHours(hour, minute, 0, 0);
          
          const slotEndTime = new Date(slotTime);
          slotEndTime.setMinutes(slotEndTime.getMinutes() + duration);

          // Check if slot is in the past
          if (slotTime < new Date()) {
            console.log('Skipping past slot:', format(slotTime, 'HH:mm'));
            continue;
          }

          const isSlotAvailable = !bookings?.some(booking => {
            const bookingStart = new Date(booking.start_time);
            const bookingEnd = new Date(booking.end_time);
            const hasConflict = (
              (slotTime >= bookingStart && slotTime < bookingEnd) ||
              (slotEndTime > bookingStart && slotEndTime <= bookingEnd) ||
              (slotTime <= bookingStart && slotEndTime >= bookingEnd)
            );
            if (hasConflict) {
              console.log('Slot conflicts with booking:', format(slotTime, 'HH:mm'), '-', format(slotEndTime, 'HH:mm'));
            }
            return hasConflict;
          });

          if (isSlotAvailable) {
            console.log('Adding available slot:', format(slotTime, 'HH:mm'));
            slots.push(format(slotTime, 'HH:mm'));
          }
        }
      }

      return slots;
    } catch (error) {
      console.error('Error getting available time slots:', error);
      throw new Error('Failed to get available time slots');
    }
  }

  // Create a booking
  public async createBooking(params: CreateBookingParams): Promise<BookingResult> {
    try {
      if (!params.userId) {
        return {
          success: false,
          error: {
            code: 'AUTH_ERROR',
            message: 'Please sign in to book an appointment'
          }
        };
      }

      // Get customer profile
      const { data: customerProfile, error: customerError } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', params.userId)
        .single();

      if (customerError || !customerProfile) {
        throw { 
          code: 'CUSTOMER_ERROR', 
          message: 'Customer profile not found',
          details: customerError 
        };
      }

      // Create the booking date/time
      const bookingDate = new Date(params.date);
      const [hours, minutes] = params.time.split(':').map(Number);
      bookingDate.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(bookingDate);
      endTime.setMinutes(endTime.getMinutes() + params.serviceDuration);

      // Check for booking conflicts using basic comparison operators
      const { data: existingBookings, error: conflictError } = await supabase
        .from('bookings')
        .select('id')
        .eq('professional_id', params.professionalId)
        .in('status', ['CONFIRMED', 'PENDING'])
        .lt('start_time', endTime.toISOString())
        .gt('end_time', bookingDate.toISOString());

      if (conflictError) {
        console.error('Error checking booking conflicts:', conflictError);
        throw new Error('Failed to check booking availability');
      }

      if (existingBookings && existingBookings.length > 0) {
        return {
          success: false,
          error: {
            code: 'BOOKING_CONFLICT',
            message: 'This time slot is no longer available'
          }
        };
      }

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            professional_id: params.professionalId,
            customer_id: customerProfile.id,
            service_id: params.serviceId,
            start_time: bookingDate.toISOString(),
            end_time: endTime.toISOString(),
            status: 'CONFIRMED',
          }
        ])
        .select()
        .single();

      if (bookingError) throw bookingError;

      return {
        success: true,
        bookingId: booking.id,
        formattedDateTime: format(bookingDate, 'PPpp')
      };
    } catch (error) {
      console.error('Error in createBooking:', error);
      return {
        success: false,
        error: {
          code: error.code || 'BOOKING_ERROR',
          message: error.message || 'Failed to create booking',
          details: error.details || error
        }
      };
    }
  }
} 