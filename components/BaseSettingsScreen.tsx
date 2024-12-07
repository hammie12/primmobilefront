import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, StatusBar, Platform, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

interface BaseSettingsScreenProps {
  children: React.ReactNode;
  title: string;
  onSave?: () => void;
  scrollable?: boolean;
  paddingHorizontal?: number;
}

export const BaseSettingsScreen: React.FC<BaseSettingsScreenProps> = ({
  children,
  title,
  onSave,
  scrollable = true,
  paddingHorizontal = 16,
}) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const Container = scrollable ? ScrollView : View;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={Platform.OS === 'android'}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FF5722" />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        {onSave && (
          <TouchableOpacity onPress={onSave} style={styles.saveButton}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        )}
      </View>
      <Container
        style={[
          styles.container,
          { paddingHorizontal },
          !scrollable && { flex: 1 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    color: '#FF5722',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});