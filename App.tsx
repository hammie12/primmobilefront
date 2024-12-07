import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppRegistry } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

// Auth Screens
import { WelcomeScreen } from './screens/WelcomeScreen';
import { SignInScreen } from './screens/SignInScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { HomeScreen } from './screens/HomeScreen';

// Customer Screens
import { CustomerHomeScreen } from './screens/customer/CustomerHomeScreen';
import { CustomerSearchScreen } from './screens/customer/CustomerSearchScreen';
import { CustomerBookingsScreen } from './screens/customer/CustomerBookingsScreen';
import { CustomerRewardsScreen } from './screens/customer/CustomerRewardsScreen';
import { CustomerSettingsScreen } from './screens/customer/CustomerSettingsScreen';
import { CustomerProfileScreen } from './screens/customer/CustomerProfileScreen';
import { CustomerPaymentScreen } from './screens/customer/CustomerPaymentScreen';
import { CustomerAddressesScreen } from './screens/customer/CustomerAddressesScreen';
import { CustomerHelpScreen } from './screens/customer/CustomerHelpScreen';
import { CustomerPrivacyScreen } from './screens/customer/CustomerPrivacyScreen';
import { CustomerTermsScreen } from './screens/customer/CustomerTermsScreen';
import { CustomerViewProfessionalScreen } from './screens/customer/CustomerViewProfessionalScreen';
import { ServiceDetailsScreen } from './screens/customer/ServiceDetailsScreen';
import { BookingScreen } from './screens/customer/BookingScreen';
import { BookingConfirmationScreen } from './screens/customer/BookingConfirmationScreen';

// Main Screens
import { BusinessDashboardScreen } from './screens/BusinessDashboardScreen';
import { BusinessBookingsScreen } from './screens/BusinessBookingsScreen';
import { BusinessAnalyticsScreen } from './screens/BusinessAnalyticsScreen';
import { BusinessSettingsScreen } from './screens/BusinessSettingsScreen';
import { ProfessionalProfileScreen } from './screens/ProfessionalProfileScreen';
import { ServiceGalleryScreen } from './screens/ServiceGalleryScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';

// Settings Screens
import { BusinessProfileScreen } from './screens/settings/BusinessProfileScreen';
import { ServicesPricingScreen } from './screens/settings/ServicesPricingScreen';
import { BusinessHoursScreen } from './screens/settings/BusinessHoursScreen';
import { AppointmentTypesScreen } from './screens/settings/AppointmentTypesScreen';
import { CancellationPolicyScreen } from './screens/settings/CancellationPolicyScreen';
import { BookingRulesScreen } from './screens/settings/BookingRulesScreen';
import { PaymentMethodsScreen } from './screens/settings/PaymentMethodsScreen';
import { DepositSettingsScreen } from './screens/settings/DepositSettingsScreen';
import { VATSettingsScreen } from './screens/settings/VATSettingsScreen';
import { PushNotificationsScreen } from './screens/settings/PushNotificationsScreen';
import { EmailNotificationsScreen } from './screens/settings/EmailNotificationsScreen';
import { SMSNotificationsScreen } from './screens/settings/SMSNotificationsScreen';
import { HelpCentreScreen } from './screens/settings/HelpCentreScreen';
import { ContactSupportScreen } from './screens/settings/ContactSupportScreen';
import { TermsOfServiceScreen } from './screens/settings/TermsOfServiceScreen';
import { PrivacyPolicyScreen } from './screens/settings/PrivacyPolicyScreen';
import { AccountSettingsScreen } from './screens/settings/AccountSettingsScreen';
import { ChangePasswordScreen } from './screens/settings/ChangePasswordScreen';

const Stack = createStackNavigator();

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#FFFFFF' },
            animation: 'fade',
            presentation: 'card'
          }}
        >
          {/* Auth Screens */}
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />

          {/* Customer Screens */}
          <Stack.Screen name="CustomerHome" component={CustomerHomeScreen} />
          <Stack.Screen name="CustomerSearch" component={CustomerSearchScreen} />
          <Stack.Screen name="CustomerBookings" component={CustomerBookingsScreen} />
          <Stack.Screen name="CustomerRewards" component={CustomerRewardsScreen} />
          <Stack.Screen
            name="CustomerSettings"
            component={CustomerSettingsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CustomerProfileScreen"
            component={CustomerProfileScreen}
            options={{ 
              headerShown: true,
              title: 'My Profile',
              headerStyle: { backgroundColor: '#FFFFFF' },
              headerTintColor: '#FF5722',
            }}
          />
          <Stack.Screen
            name="CustomerPaymentScreen"
            component={CustomerPaymentScreen}
            options={{ 
              headerShown: true,
              title: 'Payment Methods',
              headerStyle: { backgroundColor: '#FFFFFF' },
              headerTintColor: '#FF5722',
            }}
          />
          <Stack.Screen
            name="CustomerAddressesScreen"
            component={CustomerAddressesScreen}
            options={{ 
              headerShown: true,
              title: 'Saved Addresses',
              headerStyle: { backgroundColor: '#FFFFFF' },
              headerTintColor: '#FF5722',
            }}
          />
          <Stack.Screen
            name="CustomerHelpScreen"
            component={CustomerHelpScreen}
            options={{ 
              headerShown: true,
              title: 'Help Center',
              headerStyle: { backgroundColor: '#FFFFFF' },
              headerTintColor: '#FF5722',
            }}
          />
          <Stack.Screen
            name="CustomerPrivacyScreen"
            component={CustomerPrivacyScreen}
            options={{ 
              headerShown: true,
              title: 'Privacy Policy',
              headerStyle: { backgroundColor: '#FFFFFF' },
              headerTintColor: '#FF5722',
            }}
          />
          <Stack.Screen
            name="CustomerTermsScreen"
            component={CustomerTermsScreen}
            options={{ 
              headerShown: true,
              title: 'Terms of Service',
              headerStyle: { backgroundColor: '#FFFFFF' },
              headerTintColor: '#FF5722',
            }}
          />
          <Stack.Screen
            name="CustomerViewProfessional"
            component={CustomerViewProfessionalScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ServiceDetails"
            component={ServiceDetailsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Booking"
            component={BookingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BookingConfirmation"
            component={BookingConfirmationScreen}
            options={{ headerShown: false }}
          />

          {/* Main Screens */}
          <Stack.Screen name="BusinessDashboard" component={BusinessDashboardScreen} />
          <Stack.Screen name="BusinessBookings" component={BusinessBookingsScreen} />
          <Stack.Screen name="BusinessAnalytics" component={BusinessAnalyticsScreen} />
          <Stack.Screen name="BusinessSettings" component={BusinessSettingsScreen} />
          <Stack.Screen name="ProfessionalProfile" component={ProfessionalProfileScreen} />
          <Stack.Screen name="ServiceGallery" component={ServiceGalleryScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />

          {/* Business Profile Settings */}
          <Stack.Screen name="BusinessProfile" component={BusinessProfileScreen} />
          <Stack.Screen name="ServicesPricing" component={ServicesPricingScreen} />
          <Stack.Screen name="BusinessHours" component={BusinessHoursScreen} />

          {/* Booking Settings */}
          <Stack.Screen name="AppointmentTypes" component={AppointmentTypesScreen} />
          <Stack.Screen name="CancellationPolicy" component={CancellationPolicyScreen} />
          <Stack.Screen name="BookingRules" component={BookingRulesScreen} />

          {/* Payment Settings */}
          <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
          <Stack.Screen name="DepositSettings" component={DepositSettingsScreen} />
          <Stack.Screen name="VATSettings" component={VATSettingsScreen} />

          {/* Notification Settings */}
          <Stack.Screen name="PushNotifications" component={PushNotificationsScreen} />
          <Stack.Screen name="EmailNotifications" component={EmailNotificationsScreen} />
          <Stack.Screen name="SMSNotifications" component={SMSNotificationsScreen} />

          {/* Account Settings */}
          <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />

          {/* Support & Legal */}
          <Stack.Screen name="HelpCentre" component={HelpCentreScreen} />
          <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
          <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

// Register the app
AppRegistry.registerComponent('PrimMobile', () => App);
