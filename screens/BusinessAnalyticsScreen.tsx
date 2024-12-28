import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BusinessTopBar } from '../components/BusinessTopBar';
import { StatusBar } from 'expo-status-bar';

export const BusinessAnalyticsScreen = () => {
  const renderMetricCard = (title: string, value: string, change: string, isPositive: boolean) => (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>  
      <Text style={styles.metricValue}>{value}</Text>
      <View style={styles.changeContainer}>
        <MaterialCommunityIcons 
          name={isPositive ? 'arrow-up' : 'arrow-down'} 
          size={16} 
          color={isPositive ? '#4CAF50' : '#F44336'} 
        />
        <Text style={[styles.changeText, { color: isPositive ? '#4CAF50' : '#F44336' }]}>
          {change}
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <BusinessTopBar />
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.screenTitle}>Analytics</Text>
          
          <View style={styles.metricsGrid}>
            {renderMetricCard('Total Revenue', '£0', '+0% vs last month', true)}
            {renderMetricCard('Bookings', '0', '+0% vs last month', true)}
            {renderMetricCard('New Clients', '0', '+0% vs last month', true)}
            {renderMetricCard('Avg. Rating', '0', '+0% vs last month', true)}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Revenue Insights</Text>
            {renderChartCard(
              'Monthly Revenue',
              'Last 6 months performance'
            )}
            {renderChartCard(
              'Service Distribution',
              'Revenue by service type'
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Insights</Text>
            {renderChartCard(
              'Customer Retention',
              'Repeat vs new customers'
            )}
            {renderChartCard(
              'Peak Hours',
              'Most popular booking times'
            )}
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
});