import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Typography } from '../../components/Typography';

type Address = {
  id: string;
  name: string;
  street: string;
  city: string;
  postcode: string;
  isDefault: boolean;
};

export const CustomerAddressesScreen = () => {
  const [addresses] = React.useState<Address[]>([
    {
      id: '1',
      name: 'Home',
      street: '123 Main Street',
      city: 'London',
      postcode: 'SW1A 1AA',
      isDefault: true,
    },
    {
      id: '2',
      name: 'Work',
      street: '456 Business Avenue',
      city: 'London',
      postcode: 'EC2A 2BB',
      isDefault: false,
    },
  ]);

  const renderAddress = (address: Address) => (
    <TouchableOpacity key={address.id} style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressNameContainer}>
          <MaterialCommunityIcons
            name={address.name.toLowerCase() === 'home' ? 'home' : 'office-building'}
            size={24}
            color="#FF5722"
          />
          <Typography variant="body1" style={styles.addressName}>
            {address.name}
          </Typography>
        </View>
        <MaterialCommunityIcons name="pencil" size={20} color="#666666" />
      </View>

      <View style={styles.addressDetails}>
        <Typography variant="body1" style={styles.addressText}>
          {address.street}
        </Typography>
        <Typography variant="body1" style={styles.addressText}>
          {address.city}
        </Typography>
        <Typography variant="body1" style={styles.addressText}>
          {address.postcode}
        </Typography>
      </View>

      {address.isDefault && (
        <View style={styles.defaultBadge}>
          <Typography variant="body2" style={styles.defaultBadgeText}>
            Default Address
          </Typography>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.addresses}>
          {addresses.map(renderAddress)}
        </View>

        <TouchableOpacity style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={24} color="#FF5722" />
          <Typography variant="body1" style={styles.addButtonText}>
            Add New Address
          </Typography>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <View style={styles.infoIcon}>
            <MaterialCommunityIcons name="information" size={24} color="#FF5722" />
          </View>
          <Typography variant="body2" style={styles.infoText}>
            Your default address will be automatically selected when booking services.
            You can change your default address at any time.
          </Typography>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  addresses: {
    gap: 16,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressName: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  addressDetails: {
    marginLeft: 32,
  },
  addressText: {
    color: '#333333',
    marginBottom: 4,
  },
  defaultBadge: {
    backgroundColor: '#FFF5F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 12,
    alignSelf: 'flex-start',
    marginLeft: 32,
  },
  defaultBadgeText: {
    color: '#FF5722',
    fontSize: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 24,
    borderRadius: 8,
    backgroundColor: '#FFF5F2',
  },
  addButtonText: {
    color: '#FF5722',
    marginLeft: 8,
    fontWeight: '600',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: 24,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    color: '#666666',
    lineHeight: 20,
  },
});
