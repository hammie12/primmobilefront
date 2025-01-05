import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, ServiceCategory } from '../types/user';
import { supabase } from '../lib/supabase';

const SignUpScreen = () => {
  const navigation = useNavigation();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER' as UserRole,
    businessName: '',
    category: '' as ServiceCategory,
  });
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (formData.role === 'PROFESSIONAL' && !formData.businessName) {
      Alert.alert('Error', 'Business name is required for professionals');
      return false;
    }

    if (formData.role === 'PROFESSIONAL' && !formData.category) {
      Alert.alert('Error', 'Please select a service category');
      return false;
    }

    // Email validation for development
    if (!formData.email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    console.log('[SignUpScreen] Starting signup with role:', formData.role);

    setIsLoading(true);
    try {
      // For development, automatically format test emails
      let email = formData.email;
      if (__DEV__ && !email.includes('@supabase.co')) {
        const localPart = email.split('@')[0];
        email = `test+${localPart}@supabase.co`;
      }

      // Sign up the user with Supabase
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          data: {
            role: formData.role,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            business_name: formData.role === 'PROFESSIONAL' ? formData.businessName : undefined,
            category: formData.role === 'PROFESSIONAL' ? formData.category : undefined,
          },
          emailRedirectTo: 'prim://auth/callback',
        },
      });

      if (signUpError) throw signUpError;

      console.log('[SignUpScreen] Signup successful');

      Alert.alert(
        'Success',
        'Account created successfully! Please check your email for verification.',
        [
          {
            text: 'OK',
            onPress: async () => {
              // Get the current session to check the role
              const { data: { session } } = await supabase.auth.getSession();
              const userRole = session?.user?.user_metadata?.role;
              
              console.log('[SignUpScreen] Current form role:', formData.role);
              console.log('[SignUpScreen] Session metadata:', session?.user?.user_metadata);
              console.log('[SignUpScreen] Navigating with role:', userRole);
              
              // Use formData.role as a fallback if metadata isn't available yet
              const finalRole = userRole || formData.role;
              console.log('[SignUpScreen] Final role used:', finalRole);
              
              if (finalRole === 'CUSTOMER') {
                console.log('[SignUpScreen] Navigating to CustomerTabs');
                navigation.replace('CustomerTabs');
              } else {
                console.log('[SignUpScreen] Navigating to Home');
                navigation.replace('Home');
              }
            },
          },
        ]
      );

      // Create professional profile if role is PROFESSIONAL
      if (formData.role === 'PROFESSIONAL') {
        const { error: profileError } = await supabase
          .from('professionals')
          .insert([
            {
              user_id: session?.user.id,
              phone: formData.phone,
              email: email,
              category: formData.category,
            }
          ]);

        if (profileError) {
          console.error('[SignUpScreen] Error creating professional profile:', profileError);
        }
      }
    } catch (error: any) {
      console.log('[SignUpScreen] Signup error:', error);
      if (error.message?.includes('email_address_invalid')) {
        Alert.alert(
          'Invalid Email',
          'For testing, please use an email in the format: test+yourname@supabase.co'
        );
      } else if (error.message?.includes('over_email_send_rate_limit')) {
        Alert.alert(
          'Too Many Attempts',
          'Please wait a few minutes before trying to sign up again.'
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to create account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#FFEFEA', '#FFFBF9']}
        style={styles.container}
      >
        <StatusBar style="dark" />
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>Prim</Text>
              <Text style={styles.tagline}>Create your account</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === 'CUSTOMER' && styles.roleButtonActive,
                  ]}
                  onPress={() => {
                    console.log('[SignUpScreen] Setting role to CUSTOMER');
                    setFormData({ ...formData, role: 'CUSTOMER' });
                  }}
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === 'CUSTOMER' && styles.roleButtonTextActive
                  ]}>Customer</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === 'PROFESSIONAL' && styles.roleButtonActive,
                  ]}
                  onPress={() => {
                    console.log('[SignUpScreen] Setting role to PROFESSIONAL');
                    setFormData({ ...formData, role: 'PROFESSIONAL' });
                  }}
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === 'PROFESSIONAL' && styles.roleButtonTextActive
                  ]}>Professional</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                placeholderTextColor="#666666"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                placeholderTextColor="#666666"
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholderTextColor="#666666"
              />

              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholderTextColor="#666666"
              />

              {formData.role === 'PROFESSIONAL' && (
                <TextInput
                  style={styles.input}
                  placeholder="Business Name"
                  value={formData.businessName}
                  onChangeText={(text) => setFormData({ ...formData, businessName: text })}
                  placeholderTextColor="#666666"
                />
              )}

              {formData.role === 'PROFESSIONAL' && (
                <View style={styles.categorySelector}>
                  <Text style={styles.categoryLabel}>Select your service category:</Text>
                  <View style={styles.categoryButtons}>
                    <TouchableOpacity
                      style={[
                        styles.categoryButton,
                        formData.category === 'HAIR' && styles.categoryButtonActive,
                      ]}
                      onPress={() => setFormData({ ...formData, category: 'HAIR' })}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        formData.category === 'HAIR' && styles.categoryButtonTextActive
                      ]}>Hair</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.categoryButton,
                        formData.category === 'NAILS' && styles.categoryButtonActive,
                      ]}
                      onPress={() => setFormData({ ...formData, category: 'NAILS' })}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        formData.category === 'NAILS' && styles.categoryButtonTextActive
                      ]}>Nails</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.categoryButton,
                        formData.category === 'LASHES' && styles.categoryButtonActive,
                      ]}
                      onPress={() => setFormData({ ...formData, category: 'LASHES' })}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        formData.category === 'LASHES' && styles.categoryButtonTextActive
                      ]}>Lashes</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                placeholderTextColor="#666666"
              />

              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                secureTextEntry
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                placeholderTextColor="#666666"
              />

              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleSignUp}
                disabled={isLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={[styles.button, styles.outlineButton]}
                onPress={() => navigation.navigate('SignIn')}
              >
                <Text style={styles.outlineButtonText}>Sign in to existing account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export { SignUpScreen };

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFEFEA',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  scrollContent: {
    flexGrow: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF5722',
    marginBottom: 16,
  },
  tagline: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    marginBottom: 40,
  },
  roleSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  roleButtonActive: {
    backgroundColor: '#FF5722',
  },
  roleButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#FF5722',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666666',
  },
  outlineButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    color: '#666666',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  categorySelector: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  categoryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#FF5722',
    borderColor: '#FF5722',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
});
