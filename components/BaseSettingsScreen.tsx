import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Typography } from './Typography';

interface BaseSettingsScreenProps {
  title: string;
  children: React.ReactNode;
  showSaveButton?: boolean;
  onSave?: () => void;
}

export const BaseSettingsScreen: React.FC<BaseSettingsScreenProps> = ({
  title,
  children,
  showSaveButton = false,
  onSave,
}) => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333333" />
        </TouchableOpacity>
        <Typography variant="h1" style={styles.title}>
          {title}
        </Typography>
        {showSaveButton && (
          <TouchableOpacity style={styles.saveButton} onPress={onSave}>
            <Typography variant="body1" style={styles.saveButtonText}>
              Save
            </Typography>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#FF5722',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});