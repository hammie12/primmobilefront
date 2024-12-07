import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const CustomerHomeScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#FFEFEA', '#FFFBF9']} style={styles.container}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Rest of the HomeScreen content remains the same */}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

// Styles remain the same as in the previous HomeScreen

export { CustomerHomeScreen };