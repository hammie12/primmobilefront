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

type RescheduleBookingParams = {
  bookingId: string;
  newStartTime: string;
  newEndTime: string;
  status: Database["public"]["Enums"]["booking_status"];
};

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export class BookingService {
  // Get professional's working hours
  public async getWorkingHours(professionalId: string): Promise<BusinessHours | null> {
    try {
      console.log('Fetching working hours for professional:', professionalId);
      
      // Get working hours from working_hours table
      const { data: workingHoursData, error } = await supabase
        .from('working_hours')
        .select('*')
        .eq('professional_id', professionalId);

      console.log('Raw working hours data:', workingHoursData);

      if (error) {
        console.error('Error fetching working hours:', error);
        return this.getDefaultWorkingHours();
      }

      if (!workingHoursData || workingHoursData.length === 0) {
        console.log('No working hours found, using defaults');
        return this.getDefaultWorkingHours();
      }

      // Transform working hours data into BusinessHours format
      const validatedHours: BusinessHours = DAYS_OF_WEEK.reduce((acc, day, index) => {
        const dayHours = workingHoursData.find(wh => wh.day_of_week === index + 1);
        console.log(`Processing ${day} (day_of_week=${index + 1}):`, dayHours);
        
        acc[day] = {
          isOpen: dayHours?.is_open ?? true,
          openTime: dayHours?.start_time ?? '09:00',
          closeTime: dayHours?.end_time ?? '17:00'
        };
        return acc;
      }, {} as BusinessHours);

      console.log('Transformed working hours:', validatedHours);
      return validatedHours;
    } catch (error) {
      console.error('Error in getWorkingHours:', error);
      return this.getDefaultWorkingHours();
    }
  }

  private getDefaultWorkingHours(): BusinessHours {
    return DAYS_OF_WEEK.reduce((acc, day) => {
      acc[day] = {
        isOpen: true,
        openTime: '09:00',
        closeTime: '17:00'
      };
      return acc;
    }, {} as BusinessHours);
  }

  // Get available time slots for a specific date
  public async getAvailableTimeSlots(
    professionalId: string,
    date: Date,
    duration: number,
    originalBookingId?: string
  ): Promise<{ available: string[]; booked: string[] }> {
    try {
      // Get working hours for the day
      const workingHours = await this.getWorkingHours(professionalId);
      
      console.log('Debug - Professional ID:', professionalId);
      console.log('Debug - Date:', date);
      console.log('Debug - Working Hours:', workingHours);

      if (!workingHours) {
        console.log('No working hours found');
        return { available: [], booked: [] };
      }

      // Convert JavaScript's 0-6 (Sun-Sat) to our 1-7 (Mon-Sun) format
      const jsDay = date.getDay();
      const dayIndex = jsDay === 0 ? 6 : jsDay - 1;

      const daySchedule = workingHours[DAYS_OF_WEEK[dayIndex]];

      if (!daySchedule || !daySchedule.isOpen) {
        console.log('Day is not a working day:', DAYS_OF_WEEK[dayIndex]);
        return { available: [], booked: [] };
      }

      // Get existing bookings for the date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // First get the professional profile ID
      const { data: professional, error: profError } = await supabase
        .from('professionals')
        .select('id, user_id')
        .eq('id', professionalId)
        .single();

      if (profError) throw profError;

      const { data: profProfile, error: profileError } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', professional.user_id)
        .single();

      if (profileError) throw profileError;

      // Get existing bookings with the correct professional_id
      let bookingsQuery = supabase
        .from('bookings')
        .select(`
          start_time,
          end_time,
          status
        `)
        .eq('professional_id', profProfile.id)
        .in('status', ['CONFIRMED', 'PENDING']);

      // If rescheduling, exclude the original booking from conflicts
      if (originalBookingId) {
        bookingsQuery = bookingsQuery.neq('id', originalBookingId);
      }

      const { data: bookings, error } = await bookingsQuery;

      console.log('Debug - Existing Bookings:', bookings);

      if (error) throw error;

      const availableSlots: string[] = [];
      const bookedSlots: string[] = [];
      const [openHour, openMinute] = daySchedule.openTime.split(':').map(Number);
      const [closeHour, closeMinute] = daySchedule.closeTime.split(':').map(Number);

      // Generate time slots
      for (let hour = openHour; hour <= closeHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          if (hour === openHour && minute < openMinute) continue;
          if (hour === closeHour && minute > 0) continue;

          const slotTime = new Date(date);
          slotTime.setHours(hour, minute, 0, 0);
          
          const slotEndTime = new Date(slotTime);
          slotEndTime.setMinutes(slotEndTime.getMinutes() + duration);

          // Check if slot is in the past
          const now = new Date();
          if (slotTime < now) {
            console.log('Debug - Past Slot:', format(slotTime, 'HH:mm'));
            bookedSlots.push(format(slotTime, 'HH:mm'));
            continue;
          }

          // Calculate end time in total minutes for comparison
          const slotEndTotalMinutes = (slotEndTime.getHours() * 60) + slotEndTime.getMinutes();
          const closingTotalMinutes = (closeHour * 60) + closeMinute;

          // Check if the service would end after closing time
          if (slotEndTotalMinutes > closingTotalMinutes) {
            console.log('Debug - Service would end after closing time:', {
              slot: format(slotTime, 'HH:mm'),
              slotEnd: format(slotEndTime, 'HH:mm'),
              closeTime: `${closeHour}:${closeMinute}`,
              slotEndMinutes: slotEndTotalMinutes,
              closingMinutes: closingTotalMinutes
            });
            bookedSlots.push(format(slotTime, 'HH:mm'));
            continue;
          }

          // Check if slot overlaps with any existing booking
          const hasOverlap = bookings?.some(booking => {
            const bookingStart = new Date(booking.start_time);
            const bookingEnd = new Date(booking.end_time);

            // A slot overlaps if:
            // The proposed slot's time range [slotTime, slotEndTime] overlaps with
            // the existing booking's time range [bookingStart, bookingEnd]
            const overlaps = !(slotEndTime <= bookingStart || slotTime >= bookingEnd);

            if (overlaps) {
              console.log('Overlap detected:', {
                slot: {
                  start: format(slotTime, 'HH:mm'),
                  end: format(slotEndTime, 'HH:mm'),
                  duration: `${duration} minutes`
                },
                booking: {
                  start: format(bookingStart, 'HH:mm'),
                  end: format(bookingEnd, 'HH:mm')
                },
                reason: 'Slot overlaps with existing booking'
              });
            }

            return overlaps;
          });

          const timeStr = format(slotTime, 'HH:mm');
          if (hasOverlap || slotEndTotalMinutes > closingTotalMinutes) {
            console.log('Debug - Slot unavailable:', {
              slot: timeStr,
              reason: slotEndTotalMinutes > closingTotalMinutes ? 'Would end after closing' : 'Overlaps with booking',
              slotStart: format(slotTime, 'HH:mm'),
              slotEnd: format(slotEndTime, 'HH:mm'),
              closingTime: `${closeHour}:${closeMinute}`
            });
            bookedSlots.push(timeStr);
          } else {
            console.log('Debug - Available Slot:', timeStr, {
              slotStart: format(slotTime, 'HH:mm'),
              slotEnd: format(slotEndTime, 'HH:mm')
            });
            availableSlots.push(timeStr);
          }
        }
      }

      console.log('Debug - Final Slots:', {
        available: availableSlots,
        booked: bookedSlots
      });

      return { available: availableSlots, booked: bookedSlots };
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
        console.error('Customer profile error:', customerError);
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

      // Check for booking conflicts
      const { data: existingBookings, error: conflictError } = await supabase
        .from('bookings')
        .select('id, start_time, end_time')
        .eq('professional_id', params.professionalId)
        .in('status', ['CONFIRMED', 'PENDING'])
        .or(
          `and(start_time.gte.${bookingDate.toISOString()},start_time.lt.${endTime.toISOString()}),` +
          `and(end_time.gt.${bookingDate.toISOString()},end_time.lte.${endTime.toISOString()}),` +
          `and(start_time.lte.${bookingDate.toISOString()},end_time.gte.${endTime.toISOString()})`
        );

      if (conflictError) {
        console.error('Error checking booking conflicts:', conflictError);
        throw {
          code: 'CONFLICT_CHECK_ERROR',
          message: 'Failed to check booking availability',
          details: conflictError
        };
      }

      // Simplified overlap check
      const hasConflict = existingBookings?.some(booking => {
        const bookingStart = new Date(booking.start_time);
        const bookingEnd = new Date(booking.end_time);
        
        // Check both directions of overlap
        return (
          (bookingDate < bookingEnd && endTime > bookingStart) ||
          (bookingStart < endTime && bookingEnd > bookingDate)
        );
      });

      // Add more detailed logging
      console.log('Time details:', {
        startDateTime: bookingDate.toISOString(),
        endDateTime: endTime.toISOString(),
        localStartTime: bookingDate.toLocaleString(),
        localEndTime: endTime.toLocaleString(),
        selectedTime: params.time,
        selectedTimeHours: hours,
        selectedTimeMinutes: minutes,
        serviceDuration: params.serviceDuration,
        hasConflict,
        existingBookings: existingBookings?.map(b => ({
          start: new Date(b.start_time).toLocaleString(),
          end: new Date(b.end_time).toLocaleString()
        }))
      });

      if (hasConflict) {
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

      if (bookingError) {
        console.error('Booking creation error:', bookingError);
        throw {
          code: 'BOOKING_CREATE_ERROR',
          message: 'Failed to create booking',
          details: bookingError
        };
      }

      if (!booking) {
        throw {
          code: 'BOOKING_CREATE_ERROR',
          message: 'No booking data returned after creation'
        };
      }

      console.log('Booking created successfully:', booking);

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

  // Add this new method to handle rescheduling
  public async rescheduleBooking(params: RescheduleBookingParams): Promise<BookingResult> {
    try {
      const { bookingId, newStartTime, newEndTime, status } = params;

      // First get the booking details to get customer_id, professional_id, and service_id
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          id,
          customer_id,
          professional_id,
          service_id
        `)
        .eq('id', bookingId)
        .single();

      if (bookingError) {
        console.error('Error fetching booking details:', bookingError);
        throw bookingError;
      }

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Call the RPC function with the correct parameters
      const { data: rescheduledBooking, error: rescheduleError } = await supabase
        .rpc('reschedule_booking', {
          p_old_booking_id: bookingId,
          p_customer_id: booking.customer_id,
          p_professional_id: booking.professional_id,
          p_service_id: booking.service_id,
          p_start_time: newStartTime,
          p_end_time: newEndTime,
          p_status: status
        });

      if (rescheduleError) {
        console.error('Booking reschedule error details:', {
          code: rescheduleError.code,
          message: rescheduleError.message,
          details: rescheduleError.details
        });
        throw rescheduleError;
      }

      return {
        success: true,
        bookingId: rescheduledBooking?.id || bookingId,
        formattedDateTime: format(new Date(newStartTime), 'PPpp')
      };

    } catch (error) {
      console.error('Error in rescheduleBooking:', error);
      return {
        success: false,
        error: {
          code: error.code || 'RESCHEDULE_ERROR',
          message: error.message || 'Failed to reschedule booking',
          details: error.details || error
        }
      };
    }
  }
} 