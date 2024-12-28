import { createStackNavigator } from '@react-navigation/stack';
import { BusinessSettingsScreen } from '../screens/BusinessSettingsScreen';
import { BaseSettingsScreen } from '../components/BaseSettingsScreen';

const Stack = createStackNavigator();

export const SettingsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={BusinessSettingsScreen} />
      <Stack.Screen 
        name="PushNotifications" 
        component={(props) => (
          <BaseSettingsScreen title="Push Notifications">
            {/* Add notification settings content here */}
          </BaseSettingsScreen>
        )} 
      />
      <Stack.Screen 
        name="EmailNotifications" 
        component={(props) => (
          <BaseSettingsScreen title="Email Notifications">
            {/* Add email settings content here */}
          </BaseSettingsScreen>
        )} 
      />
      {/* Add other settings screens similarly */}
    </Stack.Navigator>
  );
}; 