export type SettingsStackParamList = {
  SettingsMain: undefined;
  PushNotifications: undefined;
  EmailNotifications: undefined;
  SMSNotifications: undefined;
  AccountSettings: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  HelpCentre: undefined;
  ContactSupport: undefined;
  PaymentMethodsScreen: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Welcome: undefined;
  MainTabs: undefined;
  
  // Main Tabs
  BusinessDashboard: undefined;
  BusinessBookings: undefined;
  BusinessAnalytics: undefined;
  BusinessSettings: undefined;
  
  // Settings Screens
  EditProfessionalScreen: undefined;
  BusinessHours: undefined;
  ServicesPricing: undefined;
  AppointmentTypes: undefined;
  BookingRules: undefined;
  CancellationPolicyScreen: undefined;
  PaymentMethodsScreen: undefined;
  BusinessPaymentMethods: undefined;
  PayoutSettings: undefined;
  DepositSettings: undefined;
  VATSettings: undefined;
  PushNotifications: undefined;
  EmailNotifications: undefined;
  SMSNotifications: undefined;
  AccountSettings: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  HelpCentre: undefined;
  ContactSupport: undefined;
  
  // Customer Screens
  Booking: {
    professionalId: string;
    serviceName: string;
    servicePrice: number;
    serviceDuration: string;
    professionalName: string;
    serviceId: string;
  };
  
  // Other screens
  Notifications: undefined;
};

export type TabParamList = {
  Home: undefined;
  Calendar: undefined;
  BusinessSettings: undefined;
  BusinessDashboard: undefined;
  BusinessBookings: undefined;
  BusinessAnalytics: undefined;
};
