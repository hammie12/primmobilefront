import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#FFEFEA', '#FFFBF9']}
        style={styles.container}
      >
        <StatusBar style="dark" />
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>Prim</Text>
            <Text style={styles.tagline}>
              Book and create services, effortlessly.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Text style={styles.chooseText}>Choose your experience</Text>
            
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => navigation.navigate('CustomerHome')}
            >
              <Text style={styles.primaryButtonText}>Continue as Customer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.secondaryButtonText}>Continue as Business</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.outlineButton]}
              onPress={() => navigation.navigate('SignUp')}
            >
              <Text style={styles.outlineButtonText}>Create account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.plainButton]}
              onPress={() => navigation.navigate('SignIn')}
            >
              <Text style={styles.plainButtonText}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

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
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
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
    marginHorizontal: 40,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 40,
  },
  chooseText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
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
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF5722',
  },
  secondaryButtonText: {
    color: '#FF5722',
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
  plainButton: {
    backgroundColor: 'transparent',
  },
  plainButtonText: {
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
    marginHorizontal: 12,
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
    opacity: 0.7,
  },
  disabledButtonText: {
    color: '#666666',
  },
});

export { WelcomeScreen };
