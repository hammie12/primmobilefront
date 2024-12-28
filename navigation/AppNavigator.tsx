import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '../types/navigation';
import { Welcome } from '../screens/Welcome';
import { BusinessDashboard } from '../screens/BusinessDashboard';
import { BusinessBookings } from '../screens/BusinessBookings';
import { BusinessAnalytics } from '../screens/BusinessAnalytics';
import { BusinessSettingsScreen } from '../screens/BusinessSettingsScreen';
import { BusinessProfile } from '../screens/BusinessProfile';
import { BusinessHours } from '../screens/BusinessHours';
import { ServicesPricing } from '../screens/ServicesPricing';
import { AppointmentTypes } from '../screens/AppointmentTypes';
import { BookingRules } from '../screens/BookingRules';
import { CancellationPolicyScreen } from '../screens/settings/CancellationPolicyScreen';
import { PaymentMethods } from '../screens/PaymentMethods';
import { DepositSettings } from '../screens/DepositSettings';
import { VATSettings } from '../screens/VATSettings';
import { PushNotifications } from '../screens/PushNotifications';
import { EmailNotifications } from '../screens/EmailNotifications';
import { SMSNotifications } from '../screens/SMSNotifications';
import { AccountSettings } from '../screens/AccountSettings';
import { PrivacyPolicy } from '../screens/PrivacyPolicy';
import { TermsOfService } from '../screens/TermsOfService';
import { HelpCentre } from '../screens/HelpCentre';
import { ContactSupport } from '../screens/ContactSupport';
import { BookingScreen } from '../screens/customer/BookingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Tab.Screen 
        name="BusinessDashboard" 
        component={BusinessDashboard}
        options={{
          title: 'Dashboard'
        }}
      />
      <Tab.Screen 
        name="BusinessBookings" 
        component={BusinessBookings}
        options={{
          title: 'Bookings'
        }}
      />
      <Tab.Screen 
        name="BusinessAnalytics" 
        component={BusinessAnalytics}
        options={{
          title: 'Analytics'
        }}
      />
      <Tab.Screen 
        name="BusinessSettings" 
        component={BusinessSettingsScreen}
        options={{
          title: 'Settings'
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Group>
        <Stack.Screen 
          name="Welcome" 
          component={Welcome} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MainTabs" 
          component={TabNavigator} 
          options={{ headerShown: false }}
        />
      </Stack.Group>

      <Stack.Group 
        screenOptions={{
          headerShown: true,
          animation: 'slide_from_right'
        }}
      >
        <Stack.Screen 
          name="Booking" 
          component={BookingScreen}
          options={{ 
            title: 'Book Appointment',
            headerBackTitle: 'Back'
          }}
        />
      </Stack.Group>

      <Stack.Group 
        screenOptions={{
          headerShown: true,
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }}
      >
        <Stack.Screen 
          name="BusinessProfile" 
          component={BusinessProfile}
          options={{ title: 'Business Profile' }}
        />
        <Stack.Screen 
          name="BusinessHours" 
          component={BusinessHours}
          options={{ title: 'Business Hours' }}
        />
        <Stack.Screen 
          name="ServicesPricing" 
          component={ServicesPricing}
          options={{ title: 'Services Pricing' }}
        />
        <Stack.Screen 
          name="AppointmentTypes" 
          component={AppointmentTypes}
          options={{ title: 'Appointment Types' }}
        />
        <Stack.Screen 
          name="BookingRules" 
          component={BookingRules}
          options={{ title: 'Booking Rules' }}
        />
        <Stack.Screen 
          name="CancellationPolicyScreen" 
          component={CancellationPolicyScreen}
          options={{ title: 'Cancellation Policy' }}
        />
        <Stack.Screen 
          name="PaymentMethods" 
          component={PaymentMethods}
          options={{ title: 'Payment Methods' }}
        />
        <Stack.Screen 
          name="DepositSettings" 
          component={DepositSettings}
          options={{ title: 'Deposit Settings' }}
        />
        <Stack.Screen 
          name="VATSettings" 
          component={VATSettings}
          options={{ title: 'VAT Settings' }}
        />
        <Stack.Screen 
          name="PushNotifications" 
          component={PushNotifications}
          options={{ title: 'Push Notifications' }}
        />
        <Stack.Screen 
          name="EmailNotifications" 
          component={EmailNotifications}
          options={{ title: 'Email Notifications' }}
        />
        <Stack.Screen 
          name="SMSNotifications" 
          component={SMSNotifications}
          options={{ title: 'SMS Notifications' }}
        />
        <Stack.Screen 
          name="AccountSettings" 
          component={AccountSettings}
          options={{ title: 'Account Settings' }}
        />
        <Stack.Screen 
          name="PrivacyPolicy" 
          component={PrivacyPolicy}
          options={{ title: 'Privacy Policy' }}
        />
        <Stack.Screen 
          name="TermsOfService" 
          component={TermsOfService}
          options={{ title: 'Terms of Service' }}
        />
        <Stack.Screen 
          name="HelpCentre" 
          component={HelpCentre}
          options={{ title: 'Help Centre' }}
        />
        <Stack.Screen 
          name="ContactSupport" 
          component={ContactSupport}
          options={{ title: 'Contact Support' }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}

export default AppNavigator; 