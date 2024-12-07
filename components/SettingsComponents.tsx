import React, { ReactNode } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Switch,
  TextInput,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';

interface SettingsSectionProps {
  title?: string;
  children: ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
}) => {
  return (
    <View style={styles.section}>
      {title && (
        <Typography variant="h2" style={styles.sectionTitle}>
          {title}
        </Typography>
      )}
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
};

interface SettingsRowProps {
  label: string;
  value?: ReactNode;
  icon?: ReactNode;
  onPress?: () => void;
  description?: string;
  disabled?: boolean;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  label,
  value,
  icon,
  onPress,
  description,
  disabled = false,
}) => {
  const Container = onPress ? TouchableOpacity : View;
  const containerProps = onPress ? { onPress, disabled } : {};

  return (
    <Container
      {...containerProps}
      style={[
        styles.row,
        disabled && styles.rowDisabled,
        !value && styles.rowWithArrow,
      ]}
    >
      <View style={styles.rowContent}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <View style={styles.labelContainer}>
          <Typography
            variant="body1"
            style={[styles.label, disabled && styles.labelDisabled]}
          >
            {label}
          </Typography>
          {description && (
            <Typography variant="caption" style={styles.description}>
              {description}
            </Typography>
          )}
        </View>
        {value && <View style={styles.value}>{value}</View>}
        {!value && onPress && (
          <Ionicons name="chevron-forward" size={20} color="#999" />
        )}
      </View>
    </Container>
  );
};

interface SettingsInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: TextInput['props']['keyboardType'];
  style?: TextStyle;
}

export const SettingsInput: React.FC<SettingsInputProps> = ({
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  style,
}) => {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      style={[styles.input, style]}
    />
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#666',
  },
  sectionContent: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  rowDisabled: {
    opacity: 0.5,
  },
  rowWithArrow: {
    paddingVertical: 16,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    color: '#000',
  },
  labelDisabled: {
    color: '#999',
  },
  description: {
    color: '#666',
    marginTop: 2,
  },
  value: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    textAlign: 'right',
    padding: 0,
  },
});

export default {
  SettingsSection,
  SettingsRow,
  SettingsInput,
};
