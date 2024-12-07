import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BusinessNavigationBar } from '../components/BusinessNavigationBar';
import { BusinessTopBar } from '../components/BusinessTopBar';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const HEADER_HEIGHT = 150;
const AVATAR_SIZE = 100;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const serviceColors = ['#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#F44336'];

export const ProfessionalProfileScreen = ({ route }) => {
  const navigation = useNavigation();
  const { professionalId, name: routeName, rating, category, description } = route.params || {};
  
  const [name, setName] = useState(routeName || 'Sarah Johnson');
  const [title, setTitle] = useState(`Professional ${category || 'Hair'} Stylist`);
  const [about, setAbout] = useState(description || 
    'Professional stylist with over 3 years of experience. Specialized in modern techniques and styling. Passionate about helping clients look and feel their best.'
  );
  const [services, setServices] = useState([
    {
      id: '1',
      name: 'Haircut & Styling',
      price: '$50',
      duration: '45 min',
      color: serviceColors[0],
      image: null,
    },
    {
      id: '2',
      name: 'Color Treatment',
      price: '$120',
      duration: '2 hours',
      color: serviceColors[1],
      image: null,
    },
    {
      id: '3',
      name: 'Beard Trim',
      price: '$25',
      duration: '30 min',
      color: serviceColors[2],
      image: null,
    },
  ]);
  const [reviews, setReviews] = useState([
    {
      id: '1',
      user: 'John D.',
      rating: 5,
      comment: 'Amazing service! Best haircut I\'ve ever had.',
      date: '2023-08-15',
    },
    {
      id: '2',
      user: 'Mary S.',
      rating: 4,
      comment: 'Very professional and friendly.',
      date: '2023-08-10',
    },
  ]);
  const [editingService, setEditingService] = useState(null);
  const [isServiceModalVisible, setServiceModalVisible] = useState(false);
  const [isAboutModalVisible, setAboutModalVisible] = useState(false);
  const [isHeaderModalVisible, setHeaderModalVisible] = useState(false);
  const [avatarImage, setAvatarImage] = useState(null);
  const [bannerColors, setBannerColors] = useState(['#FF5722', '#FF8A65']);
  const [bannerImage, setBannerImage] = useState(null);
  const [isBannerModalVisible, setBannerModalVisible] = useState(false);
  const [businessHours, setBusinessHours] = useState([
    { day: 'Monday', isOpen: true, start: '09:00', end: '17:00' },
    { day: 'Tuesday', isOpen: true, start: '09:00', end: '17:00' },
    { day: 'Wednesday', isOpen: true, start: '09:00', end: '17:00' },
    { day: 'Thursday', isOpen: true, start: '09:00', end: '17:00' },
    { day: 'Friday', isOpen: true, start: '09:00', end: '17:00' },
    { day: 'Saturday', isOpen: false, start: '10:00', end: '15:00' },
    { day: 'Sunday', isOpen: false, start: '10:00', end: '15:00' },
  ]);
  const [isHoursModalVisible, setHoursModalVisible] = useState(false);
  const [editingHours, setEditingHours] = useState(null);

  const handleEditAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setAvatarImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleAddService = () => {
    setEditingService(null);
    setServiceModalVisible(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setServiceModalVisible(true);
  };

  const handleDeleteService = (serviceId) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setServices(services.filter((s) => s.id !== serviceId));
          },
        },
      ]
    );
  };

  const handleSaveService = (serviceData) => {
    if (editingService) {
      setServices(
        services.map((s) =>
          s.id === editingService.id ? { ...s, ...serviceData } : s
        )
      );
    } else {
      setServices([
        ...services,
        {
          id: Date.now().toString(),
          color: serviceColors[services.length % serviceColors.length],
          ...serviceData,
        },
      ]);
    }
    setServiceModalVisible(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const renderServiceCard = (service: any, index: number) => (
    <View key={service.id} style={styles.serviceCard}>
      {service.image ? (
        <Image source={{ uri: service.image }} style={styles.serviceImage} />
      ) : (
        <View style={[styles.serviceImagePlaceholder, { backgroundColor: service.color }]}>
          <Text style={styles.serviceInitials}>{getInitials(service.name)}</Text>
        </View>
      )}
      <View style={styles.serviceContent}>
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <View style={styles.serviceActions}>
            <TouchableOpacity onPress={() => handleEditService(service)}>
              <MaterialCommunityIcons name="pencil" size={24} color="#666666" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteService(service.id)}>
              <MaterialCommunityIcons name="delete" size={24} color="#666666" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.serviceDetails}>
          <View style={styles.serviceDetail}>
            <MaterialCommunityIcons name="cash" size={16} color="#666666" />
            <Text style={styles.serviceDetailText}>{service.price}</Text>
          </View>
          <View style={styles.serviceDetail}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#666666" />
            <Text style={styles.serviceDetailText}>{service.duration}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderReviews = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Reviews</Text>
      </View>
      {reviews.map((review) => (
        <View key={review.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewUser}>{review.user}</Text>
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, i) => (
                <MaterialCommunityIcons
                  key={i}
                  name={i < review.rating ? 'star' : 'star-outline'}
                  size={16}
                  color="#FFD700"
                />
              ))}
            </View>
          </View>
          <Text style={styles.reviewComment}>{review.comment}</Text>
          <Text style={styles.reviewDate}>{review.date}</Text>
        </View>
      ))}
    </View>
  );

  const handleEditBanner = async () => {
    setBannerModalVisible(true);
  };

  const handlePickBannerImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled) {
        setBannerImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const renderBusinessHours = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Business Hours</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setHoursModalVisible(true)}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="#FF5722" />
        </TouchableOpacity>
      </View>
      {businessHours.map((hours, index) => (
        <View key={hours.day} style={styles.hoursRow}>
          <View style={styles.dayContainer}>
            <Text style={styles.dayText}>{hours.day}</Text>
            <View style={[
              styles.statusIndicator, 
              { backgroundColor: hours.isOpen ? '#4CAF50' : '#FF5722' }
            ]} />
          </View>
          <Text style={styles.hoursText}>
            {hours.isOpen ? `${hours.start} - ${hours.end}` : 'Closed'}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} stickyHeaderIndices={[1]}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.headerBackground}
            onPress={handleEditBanner}
            activeOpacity={0.9}
          >
            {bannerImage ? (
              <Image 
                source={{ uri: bannerImage }} 
                style={styles.bannerImage}
              />
            ) : (
              <LinearGradient
                colors={bannerColors}
                style={styles.headerBackground}
              >
                <View style={styles.editBannerButton}>
                  <MaterialCommunityIcons name="image-edit" size={24} color="#FFFFFF" />
                </View>
              </LinearGradient>
            )}
          </TouchableOpacity>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={handleEditAvatar} style={styles.avatar}>
              {avatarImage ? (
                <Image source={{ uri: avatarImage }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarInitials}>{getInitials(name)}</Text>
              )}
              <View style={styles.editAvatarButton}>
                <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>142</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>3y+</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>About</Text>
            <TouchableOpacity onPress={() => setAboutModalVisible(true)}>
              <MaterialCommunityIcons name="pencil" size={20} color="#FF5722" />
            </TouchableOpacity>
          </View>
          <Text style={styles.aboutText}>{about}</Text>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Services</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddService}>
              <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Service</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.servicesContainer}>
            {services.map((service, index) => renderServiceCard(service, index))}
          </View>
        </View>

        {renderBusinessHours()}
        {renderReviews()}
      </ScrollView>

      <Modal
        visible={isServiceModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setServiceModalVisible(false)}
      >
        <ServiceEditModal
          service={editingService}
          onSave={handleSaveService}
          onClose={() => setServiceModalVisible(false)}
        />
      </Modal>

      <Modal
        visible={isAboutModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <AboutEditModal
          about={about}
          onSave={(newAbout) => {
            setAbout(newAbout);
            setAboutModalVisible(false);
          }}
          onClose={() => setAboutModalVisible(false)}
        />
      </Modal>

      <Modal
        visible={isHeaderModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setHeaderModalVisible(false)}
      >
        <HeaderEditModal
          name={name}
          title={title}
          onSave={(newName, newTitle) => {
            setName(newName);
            setTitle(newTitle);
            setHeaderModalVisible(false);
          }}
          onClose={() => setHeaderModalVisible(false)}
        />
      </Modal>

      <Modal
        visible={isBannerModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBannerModalVisible(false)}
      >
        <BannerEditModal
          colors={bannerColors}
          image={bannerImage}
          onSave={(newColors, newImage) => {
            setBannerColors(newColors);
            setBannerImage(newImage);
            setBannerModalVisible(false);
          }}
          onClose={() => setBannerModalVisible(false)}
        />
      </Modal>

      <Modal
        visible={isHoursModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setHoursModalVisible(false)}
      >
        <BusinessHoursModal
          hours={businessHours}
          onSave={(newHours) => {
            setBusinessHours(newHours);
            setHoursModalVisible(false);
          }}
          onClose={() => setHoursModalVisible(false)}
        />
      </Modal>

      <BusinessNavigationBar />
    </SafeAreaView>
  );
};

const ServiceEditModal = ({ service, onSave, onClose }) => {
  const [name, setName] = useState(service ? service.name : '');
  const [price, setPrice] = useState(service ? service.price : '');
  const [duration, setDuration] = useState(service ? service.duration : '');
  const [image, setImage] = useState(service ? service.image : null);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>
          {service ? 'Edit Service' : 'Add Service'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Service Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Price"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Duration"
          value={duration}
          onChangeText={setDuration}
        />
        <TouchableOpacity style={styles.imagePickerButton} onPress={handlePickImage}>
          <Text style={styles.imagePickerText}>
            {image ? 'Change Image' : 'Add Image'}
          </Text>
        </TouchableOpacity>
        {image && (
          <Image source={{ uri: image }} style={styles.servicePreviewImage} />
        )}
        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.modalButtonPrimary]}
            onPress={() => onSave({ name, price, duration, image })}
          >
            <Text style={styles.modalButtonTextPrimary}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const AboutEditModal = ({ about, onSave, onClose }) => {
  const [text, setText] = useState(about);

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Edit About</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="About you"
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={4}
        />
        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.modalButtonPrimary]}
            onPress={() => onSave(text)}
          >
            <Text style={styles.modalButtonTextPrimary}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const HeaderEditModal = ({ name, title, onSave, onClose }) => {
  const [newName, setNewName] = useState(name);
  const [newTitle, setNewTitle] = useState(title);

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Edit Profile Header</Text>
        <TextInput
          style={styles.input}
          placeholder="Your Name"
          value={newName}
          onChangeText={setNewName}
        />
        <TextInput
          style={styles.input}
          placeholder="Your Professional Title"
          value={newTitle}
          onChangeText={setNewTitle}
        />
        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.modalButtonPrimary]}
            onPress={() => onSave(newName, newTitle)}
          >
            <Text style={styles.modalButtonTextPrimary}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const BannerEditModal = ({ colors, image, onSave, onClose }) => {
  const [selectedColors, setSelectedColors] = useState(colors);
  const [selectedImage, setSelectedImage] = useState(image);

  const predefinedGradients = [
    ['#FF5722', '#FF8A65'],
    ['#2196F3', '#64B5F6'],
    ['#4CAF50', '#81C784'],
    ['#9C27B0', '#BA68C8'],
    ['#FF9800', '#FFB74D'],
  ];

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Edit Banner</Text>
        
        <Text style={styles.modalSubtitle}>Choose Gradient</Text>
        <ScrollView horizontal style={styles.gradientList}>
          {predefinedGradients.map((gradient, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setSelectedColors(gradient);
                setSelectedImage(null);
              }}
            >
              <LinearGradient
                colors={gradient}
                style={[
                  styles.gradientPreview,
                  selectedColors === gradient && styles.gradientPreviewSelected,
                ]}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.modalSubtitle}>Or Choose Image</Text>
        <TouchableOpacity 
          style={styles.imagePickerButton} 
          onPress={handlePickImage}
        >
          <MaterialCommunityIcons name="image-plus" size={24} color="#666666" />
          <Text style={styles.imagePickerText}>
            {selectedImage ? 'Change Image' : 'Select Image'}
          </Text>
        </TouchableOpacity>

        {selectedImage && (
          <Image 
            source={{ uri: selectedImage }} 
            style={styles.bannerPreview}
          />
        )}

        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.modalButtonPrimary]}
            onPress={() => onSave(selectedColors, selectedImage)}
          >
            <Text style={styles.modalButtonTextPrimary}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const BusinessHoursModal = ({ hours, onSave, onClose }) => {
  const [editedHours, setEditedHours] = useState(hours);

  const toggleDay = (index) => {
    const newHours = [...editedHours];
    newHours[index] = {
      ...newHours[index],
      isOpen: !newHours[index].isOpen,
    };
    setEditedHours(newHours);
  };

  const updateHours = (index, field, value) => {
    const newHours = [...editedHours];
    newHours[index] = {
      ...newHours[index],
      [field]: value,
    };
    setEditedHours(newHours);
  };

  const TimeInput = ({ value, onChange, placeholder }) => (
    <TextInput
      style={styles.timeInput}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      keyboardType="default"
      maxLength={5}
    />
  );

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Business Hours</Text>
        <ScrollView style={styles.hoursModalList}>
          {editedHours.map((hours, index) => (
            <View key={hours.day} style={styles.hoursModalRow}>
              <View style={styles.hoursModalDayContainer}>
                <Text style={styles.hoursModalDayText}>{hours.day}</Text>
                <Switch
                  value={hours.isOpen}
                  onValueChange={() => toggleDay(index)}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={hours.isOpen ? '#FF5722' : '#f4f3f4'}
                />
              </View>
              {hours.isOpen && (
                <View style={styles.timeInputContainer}>
                  <TimeInput
                    value={hours.start}
                    onChange={(value) => updateHours(index, 'start', value)}
                    placeholder="09:00"
                  />
                  <Text style={styles.timeInputSeparator}>-</Text>
                  <TimeInput
                    value={hours.end}
                    onChange={(value) => updateHours(index, 'end', value)}
                    placeholder="17:00"
                  />
                </View>
              )}
            </View>
          ))}
        </ScrollView>
        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.modalButtonPrimary]}
            onPress={() => onSave(editedHours)}
          >
            <Text style={styles.modalButtonTextPrimary}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    height: HEADER_HEIGHT + AVATAR_SIZE / 2,
    marginBottom: AVATAR_SIZE / 2,
  },
  headerBackground: {
    height: HEADER_HEIGHT,
    width: SCREEN_WIDTH,
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -AVATAR_SIZE / 2,
    left: 20,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  editAvatarButton: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    backgroundColor: '#FF5722',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  profileInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: AVATAR_SIZE / 2 + 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  title: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#EEEEEE',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  aboutText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5722',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  servicesContainer: {
    marginTop: 16,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  serviceImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
  },
  serviceImagePlaceholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInitials: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  serviceContent: {
    padding: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 10,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceDetailText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    marginLeft: 10,
    padding: 10,
  },
  modalButtonPrimary: {
    backgroundColor: '#FF5722',
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#666666',
  },
  modalButtonTextPrimary: {
    color: '#FFFFFF',
  },
  imagePickerButton: {
    backgroundColor: '#EEEEEE',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePickerText: {
    color: '#666666',
  },
  servicePreviewImage: {
    width: '100%',
    height: 150,
    borderRadius: 5,
    marginBottom: 15,
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  reviewUser: {
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  reviewComment: {
    marginBottom: 5,
    color: '#666666',
  },
  reviewDate: {
    color: '#999999',
    fontSize: 12,
  },
  editHeaderButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  bannerImage: {
    width: '100%',
    height: HEADER_HEIGHT,
    resizeMode: 'cover',
  },
  editBannerButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  gradientList: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  gradientPreview: {
    width: 60,
    height: 40,
    borderRadius: 8,
    marginRight: 10,
  },
  gradientPreviewSelected: {
    borderWidth: 2,
    borderColor: '#FF5722',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333333',
  },
  bannerPreview: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    color: '#333333',
    marginRight: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  hoursText: {
    fontSize: 16,
    color: '#666666',
  },
  hoursModalList: {
    maxHeight: 400,
  },
  hoursModalRow: {
    marginBottom: 15,
  },
  hoursModalDayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hoursModalDayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 5,
    padding: 8,
    width: '45%',
    fontSize: 16,
  },
  timeInputSeparator: {
    fontSize: 20,
    color: '#666666',
  },
});