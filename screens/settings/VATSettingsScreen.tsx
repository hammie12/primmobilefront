import React, { useState } from 'react';
import { View, Switch, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BaseSettingsScreen } from '../../components/BaseSettingsScreen';
import { SettingsSection, SettingsRow } from '../../components/SettingsComponents';

export const VATSettingsScreen = () => {
  const navigation = useNavigation();
  const [vatEnabled, setVatEnabled] = useState(false);
  const [vatNumber, setVatNumber] = useState('');
  const [vatRate, setVatRate] = useState('20');

  const handleSave = () => {
    // TODO: Implement save functionality
    navigation.goBack();
  };

  return (
    <BaseSettingsScreen
      title="VAT Settings"
      onSave={handleSave}
    >
      <SettingsSection title="VAT Configuration">
        <SettingsRow
          label="Enable VAT"
          value={
            <Switch
              value={vatEnabled}
              onValueChange={setVatEnabled}
            />
          }
        />
        {vatEnabled && (
          <>
            <SettingsRow
              label="VAT Number"
              value={
                <TextInput
                  value={vatNumber}
                  onChangeText={setVatNumber}
                  placeholder="Enter VAT number"
                  style={{ flex: 1, textAlign: 'right' }}
                />
              }
            />
            <SettingsRow
              label="VAT Rate (%)"
              value={
                <TextInput
                  value={vatRate}
                  onChangeText={setVatRate}
                  keyboardType="numeric"
                  placeholder="20"
                  style={{ flex: 1, textAlign: 'right' }}
                />
              }
            />
          </>
        )}
      </SettingsSection>
    </BaseSettingsScreen>
  );
};
