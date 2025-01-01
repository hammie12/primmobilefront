import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native';
import { CalendarProvider, ExpandableCalendar, WeekCalendar } from 'react-native-calendars';
import { format } from 'date-fns';
import Typography from 'components/Typography';

// First, let's enhance the booking type
type Booking = {
  id: string;
  time: string;
  service: string;
  professional: string;
  price: string;
  duration: string;
  color?: string;
};

// Update the example booking data structure
const [bookings, setBookings] = useState<Record<string, Booking[]>>({
  '2024-01-15': [{
    id: '1',
    time: '10:00 AM',
    service: 'Haircut',
    professional: 'Jane Doe',
    price: '$50',
    duration: '1h',
    color: '#FFE5E0'
  }]
});

// Add this new component for the day view
const DayView = ({ bookings, date }) => {
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
  
  return (
    <ScrollView style={styles.dayViewContainer}>
      {timeSlots.map((hour) => {
        const timeString = `${hour.toString().padStart(2, '0')}:00`;
        const booking = bookings?.find(b => b.time.includes(timeString));
        
        return (
          <View key={hour} style={styles.timeSlot}>
            <Typography style={styles.timeLabel}>{timeString}</Typography>
            {booking ? (
              <View style={[styles.bookingBlock, { backgroundColor: booking.color || '#FFE5E0' }]}>
                <Typography style={styles.bookingTitle}>
                  {booking.service} - {booking.professional}
                </Typography>
                <Typography style={styles.bookingSubtitle}>
                  {booking.duration} • {booking.price}
                </Typography>
              </View>
            ) : (
              <View style={styles.emptySlot} />
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

// Update the WeekCalendar render method
const renderWeekCalendar = () => (
  <WeekCalendar
    firstDay={1}
    markedDates={{
      [selectedDate]: {
        selected: true,
        marked: true,
        dotColor: '#FF5722'
      }
    }}
    theme={{
      selectedDayBackgroundColor: '#FF5722',
      todayTextColor: '#FF5722',
      dotColor: '#FF5722',
      'stylesheet.calendar.main': {
        week: {
          marginTop: 7,
          marginBottom: 7,
          flexDirection: 'row',
          justifyContent: 'space-around',
          height: 100 // Increase height for better visibility
        }
      }
    }}
  />
);

// Update the main return statement
return (
  <SafeAreaView style={styles.container}>
    {renderCalendarHeader()}
    <CalendarProvider
      date={selectedDate}
      onDateChanged={setSelectedDate}
      showTodayButton
    >
      {viewType === 'month' ? (
        <>
          <ExpandableCalendar
            firstDay={1}
            markedDates={{
              [selectedDate]: {
                selected: true,
                marked: true,
                dotColor: '#FF5722'
              }
            }}
            theme={{
              selectedDayBackgroundColor: '#FF5722',
              todayTextColor: '#FF5722',
              dotColor: '#FF5722',
            }}
          />
          <View style={styles.monthViewContainer}>
            <Typography style={styles.selectedDateText}>
              {format(new Date(selectedDate), 'MMMM d, yyyy')}
            </Typography>
            {bookings[selectedDate]?.map((booking) => (
              <TouchableOpacity 
                key={booking.id}
                style={styles.monthViewBooking}
                onPress={() => handleBookingPress(booking)}
              >
                <View style={styles.bookingPreview}>
                  <Typography style={styles.bookingTime}>{booking.time}</Typography>
                  <Typography style={styles.bookingService}>{booking.service}</Typography>
                  <Typography style={styles.bookingPrice}>{booking.price}</Typography>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : viewType === 'week' ? (
        <>
          {renderWeekCalendar()}
          <WeekView bookings={bookings} selectedDate={selectedDate} />
        </>
      ) : (
        <DayView bookings={bookings[selectedDate] || []} date={selectedDate} />
      )}
    </CalendarProvider>
  </SafeAreaView>
);

// Add these new styles
const styles = StyleSheet.create({
  // ... existing styles ...
  dayViewContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  timeSlot: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  timeLabel: {
    width: 60,
    color: '#666',
    fontSize: 12,
  },
  bookingBlock: {
    flex: 1,
    backgroundColor: '#FFE5E0',
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF5722',
  },
  bookingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  bookingSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  emptySlot: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E0E0E0',
  },
  monthViewContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF',
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  monthViewBooking: {
    backgroundColor: '#FFF8F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFE5E0',
  },
  bookingPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingTime: {
    color: '#FF5722',
    fontWeight: '600',
  },
  bookingService: {
    flex: 1,
    marginHorizontal: 12,
    color: '#1A1A1A',
  },
  bookingPrice: {
    color: '#666',
    fontWeight: '500',
  },
});