import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';

interface BaseScreenProps {
  children: React.ReactNode;
  title: string;
  rightButton?: {
    icon: string;
    onPress: () => void;
  };
}

export const BaseScreen: React.FC<BaseScreenProps> = ({
  children,
  title,
  rightButton,
}) => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Typography variant="h1" style={styles.title}>
          {title}
        </Typography>
        {rightButton && (
          <TouchableOpacity
            onPress={rightButton.onPress}
            style={styles.rightButton}
          >
            <Ionicons name={rightButton.icon} size={24} color="#000" />
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    height: 56,
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
  },
  rightButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
});

export default BaseScreen;
