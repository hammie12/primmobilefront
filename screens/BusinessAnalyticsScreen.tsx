import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BusinessTopBar } from '../components/BusinessTopBar';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../supabase/client';
import { useAuth } from '../contexts/AuthContext';

type MetricsData = {
  totalRevenue: number;
  totalBookings: number;
  newClients: number;
  averageRating: number;
  revenueChange: number;
  bookingsChange: number;
  clientsChange: number;
  ratingChange: number;
};

type MonthlyRevenue = {
  month: string;
  revenue: number;
};

type PeriodType = 'day' | 'week' | 'month' | 'year';

type ServiceRevenue = {
  service_name: string;
  total_revenue: number;
  percentage: number;
};

type CustomerType = {
  new: number;
  repeat: number;
  newPercentage: number;
  repeatPercentage: number;
};

type HourlyBooking = {
  hour: number;
  count: number;
  percentage: number;
};

export const BusinessAnalyticsScreen = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const [metrics, setMetrics] = useState<MetricsData>({
    totalRevenue: 0,
    totalBookings: 0,
    newClients: 0,
    averageRating: 0,
    revenueChange: 0,
    bookingsChange: 0,
    clientsChange: 0,
    ratingChange: 0
  });
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [serviceRevenue, setServiceRevenue] = useState<ServiceRevenue[]>([]);
  const [customerTypes, setCustomerTypes] = useState<CustomerType>({
    new: 0,
    repeat: 0,
    newPercentage: 0,
    repeatPercentage: 0
  });
  const [peakHours, setPeakHours] = useState<HourlyBooking[]>([]);

  // Fetch professional ID
  useEffect(() => {
    const fetchProfessionalId = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from('professional_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        
        if (profile) {
          setProfessionalId(profile.id);
        }
      } catch (error) {
        console.error('Error fetching professional profile:', error);
        Alert.alert('Error', 'Failed to load professional information');
      }
    };

    fetchProfessionalId();
  }, [user]);

  // Get date ranges based on selected period
  const getDateRanges = (period: PeriodType) => {
    const now = new Date();
    const current = new Date(now);
    const previous = new Date(now);
    
    switch (period) {
      case 'day':
        current.setHours(0, 0, 0, 0);
        previous.setDate(previous.getDate() - 1);
        previous.setHours(0, 0, 0, 0);
        break;
      case 'week':
        current.setDate(current.getDate() - current.getDay()); // Start of week
        previous.setDate(previous.getDate() - previous.getDay() - 7); // Start of last week
        break;
      case 'month':
        current.setDate(1);
        previous.setMonth(previous.getMonth() - 1);
        previous.setDate(1);
        break;
      case 'year':
        current.setMonth(0, 1);
        previous.setFullYear(previous.getFullYear() - 1);
        previous.setMonth(0, 1);
        break;
    }

    const next = new Date(current);
    switch (period) {
      case 'day':
        next.setDate(next.getDate() + 1);
        break;
      case 'week':
        next.setDate(next.getDate() + 7);
        break;
      case 'month':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'year':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }

    return {
      currentStart: current.toISOString(),
      currentEnd: next.toISOString(),
      previousStart: previous.toISOString(),
      previousEnd: current.toISOString(),
    };
  };

  // Fetch metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!professionalId) return;

      try {
        const dateRanges = getDateRanges(selectedPeriod);
        console.log('Fetching metrics with dates:', dateRanges);

        // Fetch current period bookings
        const { data: currentBookings, error: currentBookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            service_id,
            customer_id,
            services (
              price
            )
          `)
          .eq('professional_id', professionalId)
          .gte('start_time', dateRanges.currentStart)
          .lt('start_time', dateRanges.currentEnd);

        if (currentBookingsError) throw currentBookingsError;

        // Fetch current period reviews
        const { data: currentReviews, error: currentReviewsError } = await supabase
          .from('reviews')
          .select('rating')
          .eq('professional_id', professionalId)
          .gte('created_at', dateRanges.currentStart)
          .lt('created_at', dateRanges.currentEnd);

        if (currentReviewsError) throw currentReviewsError;

        // Fetch previous period bookings
        const { data: previousBookings, error: previousBookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            service_id,
            customer_id,
            services (
              price
            )
          `)
          .eq('professional_id', professionalId)
          .gte('start_time', dateRanges.previousStart)
          .lt('start_time', dateRanges.previousEnd);

        if (previousBookingsError) throw previousBookingsError;

        // Fetch previous period reviews
        const { data: previousReviews, error: previousReviewsError } = await supabase
          .from('reviews')
          .select('rating')
          .eq('professional_id', professionalId)
          .gte('created_at', dateRanges.previousStart)
          .lt('created_at', dateRanges.previousEnd);

        if (previousReviewsError) throw previousReviewsError;

        // Calculate current period metrics
        const currentRevenue = currentBookings?.reduce((sum, booking) => 
          sum + ((booking.services as any)?.price || 0), 0) || 0;
        const currentBookingsCount = currentBookings?.length || 0;
        const currentUniqueClients = new Set(currentBookings?.map(b => b.customer_id)).size;
        const currentAvgRating = currentReviews?.length
          ? currentReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / currentReviews.length
          : 0;

        // Calculate previous period metrics
        const previousRevenue = previousBookings?.reduce((sum, booking) => 
          sum + ((booking.services as any)?.price || 0), 0) || 0;
        const previousBookingsCount = previousBookings?.length || 0;
        const previousUniqueClients = new Set(previousBookings?.map(b => b.customer_id)).size;
        const previousAvgRating = previousReviews?.length
          ? previousReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / previousReviews.length
          : 0;

        // Calculate changes
        const calculateChange = (current: number, previous: number) => {
          if (previous === 0) return 0;
          return ((current - previous) / previous) * 100;
        };

        setMetrics({
          totalRevenue: currentRevenue,
          totalBookings: currentBookingsCount,
          newClients: currentUniqueClients,
          averageRating: currentAvgRating,
          revenueChange: calculateChange(currentRevenue, previousRevenue),
          bookingsChange: calculateChange(currentBookingsCount, previousBookingsCount),
          clientsChange: calculateChange(currentUniqueClients, previousUniqueClients),
          ratingChange: calculateChange(currentAvgRating, previousAvgRating)
        });

      } catch (error: any) {
        console.error('Error fetching analytics:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        Alert.alert(
          'Error',
          'Failed to load analytics data. Please check your internet connection and try again.'
        );
      }
    };

    if (professionalId) {
      fetchMetrics();
      fetchServiceRevenue();
      fetchCustomerTypes();
      fetchPeakHours();
      const interval = setInterval(() => {
        fetchMetrics();
        fetchServiceRevenue();
        fetchCustomerTypes();
        fetchPeakHours();
      }, 300000);
      return () => clearInterval(interval);
    }
  }, [professionalId, selectedPeriod]);

  // Fetch monthly revenue data for the chart
  useEffect(() => {
    const fetchMonthlyRevenue = async () => {
      if (!professionalId) return;

      try {
        // Get date range for last 12 months
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 11);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        const { data: bookings, error } = await supabase
          .from('bookings')
          .select(`
            start_time,
            services (
              price
            )
          `)
          .eq('professional_id', professionalId)
          .gte('start_time', startDate.toISOString())
          .lt('start_time', endDate.toISOString())
          .order('start_time', { ascending: true });

        if (error) throw error;

        // Group bookings by month and calculate revenue
        const monthlyData = bookings?.reduce((acc: { [key: string]: number }, booking) => {
          const month = new Date(booking.start_time).toISOString().slice(0, 7); // YYYY-MM format
          const revenue = (booking.services as any)?.price || 0;
          acc[month] = (acc[month] || 0) + revenue;
          return acc;
        }, {});

        // Fill in missing months with zero revenue
        const revenueData: MonthlyRevenue[] = [];
        for (let i = 0; i < 12; i++) {
          const date = new Date(startDate);
          date.setMonth(date.getMonth() + i);
          const month = date.toISOString().slice(0, 7);
          revenueData.push({
            month,
            revenue: monthlyData?.[month] || 0
          });
        }

        setMonthlyRevenue(revenueData);

      } catch (error) {
        console.error('Error fetching monthly revenue:', error);
      }
    };

    fetchMonthlyRevenue();
  }, [professionalId]);

  const fetchServiceRevenue = async () => {
    if (!professionalId) return;

    try {
      const dateRanges = getDateRanges(selectedPeriod);

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          services (
            id,
            name,
            price
          )
        `)
        .eq('professional_id', professionalId)
        .gte('start_time', dateRanges.currentStart)
        .lt('start_time', dateRanges.currentEnd);

      if (error) throw error;

      // Calculate revenue by service
      const serviceMap = new Map<string, number>();
      let totalRevenue = 0;

      data?.forEach(booking => {
        const service = booking.services as { name: string; price: number };
        if (service) {
          const currentAmount = serviceMap.get(service.name) || 0;
          serviceMap.set(service.name, currentAmount + service.price);
          totalRevenue += service.price;
        }
      });

      // Convert to array and calculate percentages
      const serviceRevenueData = Array.from(serviceMap.entries()).map(([name, revenue]) => ({
        service_name: name,
        total_revenue: revenue,
        percentage: (revenue / totalRevenue) * 100
      }));

      // Sort by revenue (highest first)
      serviceRevenueData.sort((a, b) => b.total_revenue - a.total_revenue);
      
      setServiceRevenue(serviceRevenueData);

    } catch (error) {
      console.error('Error fetching service revenue:', error);
      Alert.alert('Error', 'Failed to load service revenue data');
    }
  };

  const fetchCustomerTypes = async () => {
    if (!professionalId) return;

    try {
      const dateRanges = getDateRanges(selectedPeriod);

      // First, get all bookings for the current period
      const { data: currentBookings, error: currentError } = await supabase
        .from('bookings')
        .select('customer_id, start_time')
        .eq('professional_id', professionalId)
        .gte('start_time', dateRanges.currentStart)
        .lt('start_time', dateRanges.currentEnd);

      if (currentError) throw currentError;

      // Then, get all previous bookings for these customers
      const customerIds = currentBookings?.map(booking => booking.customer_id) || [];
      
      const { data: previousBookings, error: previousError } = await supabase
        .from('bookings')
        .select('customer_id, start_time')
        .eq('professional_id', professionalId)
        .lt('start_time', dateRanges.currentStart)
        .in('customer_id', customerIds);

      if (previousError) throw previousError;

      // Analyze the data
      const previousCustomers = new Set(previousBookings?.map(booking => booking.customer_id));
      const currentCustomers = new Set(customerIds);
      
      let newCount = 0;
      let repeatCount = 0;

      currentCustomers.forEach(customerId => {
        if (previousCustomers.has(customerId)) {
          repeatCount++;
        } else {
          newCount++;
        }
      });

      const total = newCount + repeatCount;
      
      setCustomerTypes({
        new: newCount,
        repeat: repeatCount,
        newPercentage: total > 0 ? (newCount / total) * 100 : 0,
        repeatPercentage: total > 0 ? (repeatCount / total) * 100 : 0
      });

    } catch (error) {
      console.error('Error fetching customer types:', error);
      Alert.alert('Error', 'Failed to load customer data');
    }
  };

  const fetchPeakHours = async () => {
    if (!professionalId) return;

    try {
      const dateRanges = getDateRanges(selectedPeriod);

      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('start_time')
        .eq('professional_id', professionalId)
        .gte('start_time', dateRanges.currentStart)
        .lt('start_time', dateRanges.currentEnd);

      if (error) throw error;

      // Initialize hours count
      const hoursCount = new Map<number, number>();
      for (let i = 0; i < 24; i++) {
        hoursCount.set(i, 0);
      }

      // Count bookings per hour
      bookings?.forEach(booking => {
        const hour = new Date(booking.start_time).getHours();
        hoursCount.set(hour, (hoursCount.get(hour) || 0) + 1);
      });

      // Calculate total bookings
      const totalBookings = Array.from(hoursCount.values()).reduce((sum, count) => sum + count, 0);

      // Convert to array and calculate percentages
      const hourlyData = Array.from(hoursCount.entries())
        .map(([hour, count]) => ({
          hour,
          count,
          percentage: totalBookings > 0 ? (count / totalBookings) * 100 : 0
        }))
        .filter(data => data.count > 0) // Only show hours with bookings
        .sort((a, b) => b.count - a.count); // Sort by count descending

      setPeakHours(hourlyData);

    } catch (error) {
      console.error('Error fetching peak hours:', error);
      Alert.alert('Error', 'Failed to load peak hours data');
    }
  };

  const renderPeriodToggle = () => (
    <View style={styles.periodToggle}>
      {(['day', 'week', 'month', 'year'] as PeriodType[]).map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period && styles.periodButtonTextActive
          ]}>
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMetricCard = (title: string, value: string | number, change: number, isPositive: boolean) => (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>  
      <Text style={styles.metricValue}>
        {title.includes('Revenue') ? `£${typeof value === 'number' ? value.toFixed(2) : value}` : value}
      </Text>
      <View style={styles.changeContainer}>
        <MaterialCommunityIcons 
          name={change >= 0 ? 'arrow-up' : 'arrow-down'} 
          size={16} 
          color={change >= 0 ? '#4CAF50' : '#F44336'} 
        />
        <Text style={[styles.changeText, { color: change >= 0 ? '#4CAF50' : '#F44336' }]}>
          {Math.abs(change).toFixed(1)}% vs last month
        </Text>
      </View>
    </View>
  );

  const renderChartCard = (title: string, subtitle: string) => (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>{title}</Text>
        <Text style={styles.chartSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.chartPlaceholder}>
        <MaterialCommunityIcons name="chart-bar" size={32} color="#FF5722" />
        <Text style={styles.placeholderText}>Chart visualization coming soon</Text>
      </View>
    </View>
  );

  const renderRevenueChart = () => {
    const maxValue = Math.max(...monthlyRevenue.map(item => item.revenue));
    const chartHeight = 250;

    return (
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Monthly Revenue</Text>
          <Text style={styles.chartSubtitle}>Last 12 months performance</Text>
        </View>
        <View style={[styles.chartContainer, { height: chartHeight + 60 }]}>
          {/* Y-axis labels */}
          <View style={styles.yAxisLabels}>
            {[4, 3, 2, 1, 0].map((i) => (
              <Text key={i} style={styles.axisLabel}>
                £{((maxValue * i) / 4 >= 1000 
                  ? `${((maxValue * i) / 4000).toFixed(0)}k` 
                  : ((maxValue * i) / 4).toFixed(0))}
              </Text>
            ))}
          </View>

          {/* Chart bars */}
          <View style={styles.barsContainer}>
            {monthlyRevenue.map((item, index) => {
              const barHeight = (item.revenue / maxValue) * chartHeight;
              const [year, month] = item.month.split('-');
              const monthName = new Date(parseInt(year), parseInt(month) - 1)
                .toLocaleString('default', { month: 'short' });

              return (
                <View key={index} style={styles.barWrapper}>
                  <View style={[styles.bar, { height: barHeight }]} />
                  <Text style={styles.xAxisLabel}>{monthName}</Text>
                </View>
              );
            })}
          </View>
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF5722' }]} />
            <Text style={styles.legendText}>Monthly Revenue</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderServiceRevenueChart = () => {
    const barColors = ['#FF5722', '#FF7043', '#FF8A65', '#FFAB91', '#FFCCBC'];

    return (
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Revenue by Service</Text>
          <Text style={styles.chartSubtitle}>Distribution of revenue across services</Text>
        </View>
        <View style={[styles.chartContainer, { height: 'auto', paddingVertical: 16 }]}>
          <View style={styles.serviceRevenueContainer}>
            {serviceRevenue.map((service, index) => (
              <View key={service.service_name} style={styles.serviceRevenueRow}>
                <View style={styles.serviceNameContainer}>
                  <View 
                    style={[
                      styles.serviceDot, 
                      { backgroundColor: barColors[index % barColors.length] }
                    ]} 
                  />
                  <Text style={styles.serviceName} numberOfLines={1}>
                    {service.service_name}
                  </Text>
                  <Text style={styles.serviceRevenue}>
                    £{service.total_revenue.toFixed(0)} ({service.percentage.toFixed(1)}%)
                  </Text>
                </View>
                <View style={styles.serviceBarContainer}>
                  <View 
                    style={[
                      styles.serviceBar,
                      { 
                        width: `${service.percentage}%`,
                        backgroundColor: barColors[index % barColors.length]
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderCustomerTypeChart = () => {
    const barColors = ['#4CAF50', '#FF5722']; // Green for repeat, Orange for new

    return (
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Customer Retention</Text>
          <Text style={styles.chartSubtitle}>Repeat vs new customers</Text>
        </View>
        <View style={[styles.chartContainer, { height: 160, paddingVertical: 16 }]}>
          <View style={styles.customerTypeContainer}>
            {/* Repeat Customers */}
            <View style={styles.customerTypeRow}>
              <View style={styles.customerNameContainer}>
                <View style={[styles.customerDot, { backgroundColor: barColors[0] }]} />
                <Text style={styles.customerTypeName}>Repeat Customers</Text>
                <Text style={styles.customerCount}>
                  {customerTypes.repeat} ({customerTypes.repeatPercentage.toFixed(1)}%)
                </Text>
              </View>
              <View style={styles.customerBarContainer}>
                <View 
                  style={[
                    styles.customerBar,
                    { 
                      width: `${customerTypes.repeatPercentage}%`,
                      backgroundColor: barColors[0]
                    }
                  ]} 
                />
              </View>
            </View>

            {/* New Customers */}
            <View style={styles.customerTypeRow}>
              <View style={styles.customerNameContainer}>
                <View style={[styles.customerDot, { backgroundColor: barColors[1] }]} />
                <Text style={styles.customerTypeName}>New Customers</Text>
                <Text style={styles.customerCount}>
                  {customerTypes.new} ({customerTypes.newPercentage.toFixed(1)}%)
                </Text>
              </View>
              <View style={styles.customerBarContainer}>
                <View 
                  style={[
                    styles.customerBar,
                    { 
                      width: `${customerTypes.newPercentage}%`,
                      backgroundColor: barColors[1]
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderPeakHoursChart = () => {
    const barColors = ['#FF5722', '#FF7043', '#FF8A65', '#FFAB91', '#FFCCBC'];

    const formatTimeSlot = (hour: number) => {
      const formatHour = (h: number) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 || 12;
        return `${displayHour}:00 ${ampm}`;
      };
      return `${formatHour(hour)}`;
    };

    // Group hours into morning, afternoon, evening
    const timeSlots = {
      morning: peakHours.filter(h => h.hour >= 6 && h.hour < 12),
      afternoon: peakHours.filter(h => h.hour >= 12 && h.hour < 17),
      evening: peakHours.filter(h => h.hour >= 17 && h.hour < 22),
      other: peakHours.filter(h => h.hour >= 22 || h.hour < 6)
    };

    const renderTimeSlot = (title: string, data: typeof peakHours, startIndex: number) => (
      <View style={styles.timeSlotSection}>
        <Text style={styles.timeSlotTitle}>{title}</Text>
        {data.map((hourData, index) => (
          <View key={hourData.hour} style={styles.peakHourRow}>
            <View style={styles.peakHourNameContainer}>
              <View 
                style={[
                  styles.peakHourDot, 
                  { backgroundColor: barColors[(startIndex + index) % barColors.length] }
                ]} 
              />
              <Text style={styles.peakHourTime}>
                {formatTimeSlot(hourData.hour)}
              </Text>
              <Text style={styles.peakHourCount}>
                {hourData.count} ({hourData.percentage.toFixed(1)}%)
              </Text>
            </View>
            <View style={styles.peakHourBarContainer}>
              <View 
                style={[
                  styles.peakHourBar,
                  { 
                    width: `${hourData.percentage}%`,
                    backgroundColor: barColors[(startIndex + index) % barColors.length]
                  }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>
    );

    return (
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Peak Hours</Text>
          <Text style={styles.chartSubtitle}>Most popular booking times</Text>
        </View>
        <View style={[styles.chartContainer, { height: 'auto', paddingVertical: 16 }]}>
          <View style={styles.peakHoursContainer}>
            {timeSlots.morning.length > 0 && renderTimeSlot('Morning (6AM - 12PM)', timeSlots.morning, 0)}
            {timeSlots.afternoon.length > 0 && renderTimeSlot('Afternoon (12PM - 5PM)', timeSlots.afternoon, timeSlots.morning.length)}
            {timeSlots.evening.length > 0 && renderTimeSlot('Evening (5PM - 10PM)', timeSlots.evening, timeSlots.morning.length + timeSlots.afternoon.length)}
            {timeSlots.other.length > 0 && renderTimeSlot('Other Hours', timeSlots.other, timeSlots.morning.length + timeSlots.afternoon.length + timeSlots.evening.length)}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <BusinessTopBar />
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.screenTitle}>Analytics</Text>
          
          {renderPeriodToggle()}
          
          <View style={styles.metricsGrid}>
            {renderMetricCard('Total Revenue', metrics.totalRevenue, metrics.revenueChange, metrics.revenueChange >= 0)}
            {renderMetricCard('Bookings', metrics.totalBookings, metrics.bookingsChange, metrics.bookingsChange >= 0)}
            {renderMetricCard('New Clients', metrics.newClients, metrics.clientsChange, metrics.clientsChange >= 0)}
            {renderMetricCard('Avg. Rating', metrics.averageRating.toFixed(1), metrics.ratingChange, metrics.ratingChange >= 0)}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Revenue Insights</Text>
            {renderRevenueChart()}
            {renderServiceRevenueChart()}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Insights</Text>
            {renderCustomerTypeChart()}
            {renderPeakHoursChart()}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 14,
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
  },
  periodToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 14,
  },
  periodButtonTextActive: {
    color: '#FF5722',
    fontWeight: '600',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8
  },
  legendText: {
    fontSize: 12,
    color: '#666666'
  },
  chartContainer: {
    flexDirection: 'row',
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 20,
  },
  yAxisLabels: {
    width: 50,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  axisLabel: {
    color: '#666666',
    fontSize: 12,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 20,
    backgroundColor: '#FF5722',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginHorizontal: 2,
  },
  xAxisLabel: {
    color: '#666666',
    fontSize: 10,
    marginTop: 5,
    transform: [{ rotate: '-45deg' }],
  },
  serviceRevenueContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  serviceRevenueRow: {
    marginBottom: 16,
  },
  serviceNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingRight: 16,
  },
  serviceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  serviceName: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  serviceRevenue: {
    fontSize: 14,
    color: '#666666',
    minWidth: 120,
    textAlign: 'right',
  },
  serviceBarContainer: {
    height: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  serviceBar: {
    height: '100%',
    borderRadius: 4,
  },
  customerTypeContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  customerTypeRow: {
    marginBottom: 20,
  },
  customerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingRight: 16,
  },
  customerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  customerTypeName: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  customerCount: {
    fontSize: 14,
    color: '#666666',
    minWidth: 100,
    textAlign: 'right',
  },
  customerBarContainer: {
    height: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  customerBar: {
    height: '100%',
    borderRadius: 4,
  },
  peakHoursContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  timeSlotSection: {
    marginBottom: 24,
  },
  timeSlotTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    marginLeft: 8,
  },
  peakHourRow: {
    marginBottom: 12,
  },
  peakHourNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingRight: 16,
  },
  peakHourDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  peakHourTime: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  peakHourCount: {
    fontSize: 14,
    color: '#666666',
    minWidth: 80,
    textAlign: 'right',
  },
  peakHourBarContainer: {
    height: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  peakHourBar: {
    height: '100%',
    borderRadius: 4,
  },
});