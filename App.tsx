import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppRegistry, Platform, View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { StripeProvider } from './lib/stripe-provider';

// Auth Screens
import { WelcomeScreen } from './screens/WelcomeScreen';
import { SignInScreen } from './screens/SignInScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';

// Customer Screens
import { CustomerHomeScreen } from './screens/customer/CustomerHomeScreen';
import { CustomerSearchScreen } from './screens/customer/CustomerSearchScreen';
import { CustomerBookingsScreen } from './screens/customer/CustomerBookingsScreen';
import { CustomerRewardsScreen } from './screens/customer/CustomerRewardsScreen';
import { CustomerSettingsScreen } from './screens/customer/CustomerSettingsScreen';
import { CustomerProfileScreen } from './screens/customer/CustomerProfileScreen';
import { CustomerViewProfessionalScreen } from './screens/customer/CustomerViewProfessionalScreen';
import { ServiceDetailsScreen } from './screens/customer/ServiceDetailsScreen';
import { BookingScreen } from './screens/customer/BookingScreen';
import { BookingPayment } from './screens/customer/BookingPayment';
import { CustomerPaymentScreen } from './screens/customer/CustomerPaymentScreen';

// Professional/Business Screens
import { BusinessDashboardScreen } from './screens/BusinessDashboardScreen';
import { BusinessBookingsScreen } from './screens/BusinessBookingsScreen';
import { BusinessAnalyticsScreen } from './screens/BusinessAnalyticsScreen';
import { BusinessSettingsScreen } from './screens/BusinessSettingsScreen';
import { ProfessionalProfileScreen } from './screens/ProfessionalProfileScreen';
import { HomeScreen } from './screens/HomeScreen';
import { DepositSettingsScreen } from './screens/settings/DepositSettingsScreen';
import { BusinessHoursScreen } from './screens/settings/BusinessHoursScreen';
import { EditProfessionalScreen } from './screens/settings/EditProfessionalScreen';
import { CancellationPolicyScreen } from './screens/settings/CancellationPolicyScreen';
import { PaymentMethodsScreen } from './screens/settings/PaymentMethodsScreen';
import { PushNotificationsScreen } from './screens/settings/PushNotificationsScreen';
import { EmailNotificationsScreen } from './screens/settings/EmailNotificationsScreen';
import { SMSNotificationsScreen } from './screens/settings/SMSNotificationsScreen';
import { AccountSettingsScreen } from './screens/settings/AccountSettingsScreen';
import { PrivacyPolicyScreen } from './screens/settings/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from './screens/settings/TermsOfServiceScreen';
import { HelpCentreScreen } from './screens/settings/HelpCentreScreen';
import { ContactSupportScreen } from './screens/settings/ContactSupportScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Customer Tab Navigator
const CustomerTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case 'CustomerHome':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'CustomerSearch':
            iconName = focused ? 'search' : 'search-outline';
            break;
          case 'CustomerBookings':
            iconName = focused ? 'calendar' : 'calendar-outline';
            break;
          case 'CustomerRewards':
            iconName = focused ? 'gift' : 'gift-outline';
            break;
          case 'CustomerSettings':
            iconName = focused ? 'settings' : 'settings-outline';
            break;
          default:
            iconName = 'help-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#FF5722',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        paddingBottom: Platform.OS === 'ios' ? 20 : 12,
        paddingTop: 8,
        height: Platform.OS === 'ios' ? 85 : 65,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -3,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          },
          android: {
            elevation: 8,
          },
        }),
      },
      headerShown: false,
    })}
  >
    <Tab.Screen 
      name="CustomerHome" 
      component={CustomerHomeScreen}
      options={{ title: 'Home' }}
    />
    <Tab.Screen 
      name="CustomerSearch" 
      component={CustomerSearchScreen}
      options={{ title: 'Search' }}
    />
    <Tab.Screen 
      name="CustomerBookings" 
      component={CustomerBookingsScreen}
      options={{ title: 'Bookings' }}
    />
    <Tab.Screen 
      name="CustomerRewards" 
      component={CustomerRewardsScreen}
      options={{ title: 'Rewards' }}
    />
    <Tab.Screen 
      name="CustomerSettings" 
      component={CustomerSettingsScreen}
      options={{ title: 'Settings' }}
    />
    <Tab.Screen 
      name="CustomerViewProfessional" 
      component={CustomerViewProfessionalScreen}
      options={{ 
        title: 'Professional',
        tabBarButton: () => null // Hide this tab from the bottom bar
      }}
    />
  </Tab.Navigator>
);

// Professional Tab Navigator
const ProfessionalTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case 'BusinessHome':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'BusinessBookings':
            iconName = focused ? 'calendar' : 'calendar-outline';
            break;
          case 'BusinessAnalytics':
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            break;
          case 'ProfessionalProfile':
            iconName = focused ? 'person' : 'person-outline';
            break;
          case 'BusinessSettings':
            iconName = focused ? 'settings' : 'settings-outline';
            break;
          default:
            iconName = 'help-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#FF5722',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        paddingBottom: Platform.OS === 'ios' ? 20 : 12,
        paddingTop: 8,
        height: Platform.OS === 'ios' ? 85 : 65,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -3,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          },
          android: {
            elevation: 8,
          },
        }),
      },
      headerShown: false,
    })}
  >
    <Tab.Screen 
      name="BusinessHome" 
      component={HomeScreen}
      options={{ title: 'Home' }}
    />
    <Tab.Screen 
      name="BusinessBookings" 
      component={BusinessBookingsScreen}
      options={{ title: 'Bookings' }}
    />
    <Tab.Screen 
      name="BusinessAnalytics" 
      component={BusinessAnalyticsScreen}
      options={{ title: 'Analytics' }}
    />
    <Tab.Screen 
      name="ProfessionalProfile" 
      component={ProfessionalProfileScreen}
      options={{ title: 'Profile' }}
    />
    <Tab.Screen 
      name="BusinessSettings" 
      component={BusinessSettingsScreen}
      options={{ title: 'Settings' }}
    />
  </Tab.Navigator>
);

// Navigation based on auth state
const Navigation = () => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    console.log('[Navigation] Current auth state:', { user, isLoading });
  }, [user, isLoading]);

  if (isLoading) {
    console.log('[Navigation] Still loading...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const userRole = user?.user_metadata?.role;
  console.log('[Navigation] User role from metadata:', userRole);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          // Main App Stack based on user role
          <>
            {userRole === 'PROFESSIONAL' ? (
              <>
                <Stack.Screen name="ProfessionalTabs" component={ProfessionalTabs} />
                <Stack.Screen name="EditProfessional" component={EditProfessionalScreen} />
                <Stack.Screen name="BusinessHours" component={BusinessHoursScreen} />
                <Stack.Screen name="DepositSettings" component={DepositSettingsScreen} />
                <Stack.Screen name="CancellationPolicy" component={CancellationPolicyScreen} />
                <Stack.Screen name="PaymentMethodsScreen" component={PaymentMethodsScreen} />
                <Stack.Screen name="PushNotifications" component={PushNotificationsScreen} />
                <Stack.Screen name="EmailNotifications" component={EmailNotificationsScreen} />
                <Stack.Screen name="SMSNotifications" component={SMSNotificationsScreen} />
                <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
                <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
                <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
                <Stack.Screen name="HelpCentre" component={HelpCentreScreen} />
                <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
                <Stack.Screen name="CustomerViewProfessional" component={CustomerViewProfessionalScreen} />
                <Stack.Screen name="CustomerProfileScreen" component={CustomerProfileScreen} />
                <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
                <Stack.Screen name="Booking" component={BookingScreen} />
                <Stack.Screen name="BookingPayment" component={BookingPayment} />
                <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
                <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
                <Stack.Screen name="HelpCentre" component={HelpCentreScreen} />
                <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
                <Stack.Screen 
                  name="CustomerPaymentScreen" 
                  component={CustomerPaymentScreen} 
                  options={{ 
                    title: 'Payment Methods',
                    headerShown: true 
                  }} 
                />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const ErrorBoundary = ({ children }) => {
  useEffect(() => {
    console.log('App mounted');
  }, []);

  return children;
};

export default function App() {
  console.log('Initializing App');
  
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <StripeProvider>
            <Navigation />
          </StripeProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

AppRegistry.registerComponent('PrimMobileFront', () => App);
