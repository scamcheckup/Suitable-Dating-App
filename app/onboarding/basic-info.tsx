import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Calendar, MapPin, User, Briefcase, ChevronDown } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Location from 'expo-location';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/lib/auth';

const GENDERS = ['Male', 'Female'];

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
];

const OCCUPATIONS = [
  'Student', 'Engineer', 'Doctor', 'Lawyer', 'Teacher', 'Nurse', 'Accountant', 'Businessman',
  'Artist', 'Writer', 'Designer', 'Developer', 'Consultant', 'Manager', 'Sales', 'Marketing',
  'Finance', 'Healthcare', 'Education', 'Government', 'Non-profit', 'Entrepreneur', 'Other'
];

const LGAS = {
  'Lagos': ['Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'],
  'FCT': ['Abaji', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali', 'Municipal Area Council'],
  'Kano': ['Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta', 'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garun Mallam', 'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya', 'Kiru', 'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda', 'Minjibir', 'Nasarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada', 'Ungogo', 'Warawa', 'Wudil'],
  'Rivers': ['Abua/Odual', 'Ahoada East', 'Ahoada West', 'Akuku-Toru', 'Andoni', 'Asari-Toru', 'Bonny', 'Degema', 'Eleme', 'Emuoha', 'Etche', 'Gokana', 'Ikwerre', 'Khana', 'Obio/Akpor', 'Ogba/Egbema/Ndoni', 'Ogu/Bolo', 'Okrika', 'Omuma', 'Opobo/Nkoro', 'Oyigbo', 'Port Harcourt', 'Tai'],
  'Ogun': ['Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Egbado North', 'Egbado South', 'Ewekoro', 'Ifo', 'Ijebu East', 'Ijebu North', 'Ijebu North East', 'Ijebu Ode', 'Ikenne', 'Imeko Afon', 'Ipokia', 'Obafemi Owode', 'Odeda', 'Odogbolu', 'Ogun Waterside', 'Remo North', 'Shagamu'],
  'Kaduna': ['Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jema\'a', 'Kachia', 'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kubau', 'Kudan', 'Lere', 'Makarfi', 'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria'],
  // Add more states as needed
};

export default function BasicInfoScreen() {
  const { user, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    occupation: '',
    schoolState: '',
    locationOption: 'gps', // 'gps' or 'manual'
    state: '',
    lga: '',
    currentLocation: '',
  });
  const [errors, setErrors] = useState({});
  const [showDropdowns, setShowDropdowns] = useState({
    occupation: false,
    schoolState: false,
    state: false,
    lga: false,
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get GPS location
  const getGPSLocation = async () => {
    if (Platform.OS === 'web') {
      // For web, use browser geolocation API
      if (navigator.geolocation) {
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              // Reverse geocoding to get location name
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
              );
              const data = await response.json();
              const locationName = `${data.city || data.locality || 'Unknown'}, ${data.principalSubdivision || 'Nigeria'}`;
              setFormData(prev => ({
                ...prev,
                currentLocation: locationName
              }));
            } catch (error) {
              setFormData(prev => ({
                ...prev,
                currentLocation: 'Location detected'
              }));
            }
            setLocationLoading(false);
          },
          (error) => {
            setLocationLoading(false);
            Alert.alert('Location Error', 'Unable to get your location. Please select manually.');
            setFormData(prev => ({
              ...prev,
              locationOption: 'manual'
            }));
          }
        );
      } else {
        Alert.alert('Location Error', 'Geolocation is not supported by this browser.');
        setFormData(prev => ({
          ...prev,
          locationOption: 'manual'
        }));
      }
    } else {
      // For mobile, use expo-location
      try {
        setLocationLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Permission to access location was denied. Please select manually.');
          setFormData(prev => ({
            ...prev,
            locationOption: 'manual'
          }));
          setLocationLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        let reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (reverseGeocode.length > 0) {
          const address = reverseGeocode[0];
          const locationName = `${address.city || address.district || 'Unknown'}, ${address.region || 'Nigeria'}`;
          setFormData(prev => ({
            ...prev,
            currentLocation: locationName
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            currentLocation: 'Location detected'
          }));
        }
        setLocationLoading(false);
      } catch (error) {
        setLocationLoading(false);
        Alert.alert('Location Error', 'Unable to get your location. Please select manually.');
        setFormData(prev => ({
          ...prev,
          locationOption: 'manual'
        }));
      }
    }
  };

  // Auto-get GPS location when GPS option is selected
  useEffect(() => {
    if (formData.locationOption === 'gps' && !formData.currentLocation) {
      getGPSLocation();
    }
  }, [formData.locationOption]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.age || formData.age < 18 || formData.age > 80) {
      newErrors.age = 'Please enter a valid age (18-80)';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }
    
    if (!formData.occupation) {
      newErrors.occupation = 'Please select your occupation';
    }
    
    if (formData.occupation === 'Student' && !formData.schoolState) {
      newErrors.schoolState = 'Please select your school state';
    }
    
    if (formData.locationOption === 'manual') {
      if (!formData.state) {
        newErrors.state = 'Please select your state';
      }
      if (!formData.lga) {
        newErrors.lga = 'Please select your LGA';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);

    try {
      // Update user profile in database
      const profileData = {
        age: parseInt(formData.age),
        gender: formData.gender,
        occupation: formData.occupation,
        school_state: formData.schoolState || null,
        location_type: formData.locationOption,
        state: formData.state || null,
        lga: formData.lga || null,
        current_location: formData.currentLocation || null,
      };

      const { error } = await updateUserProfile(user.id, profileData);

      if (error) {
        Alert.alert('Error', 'Failed to save profile data. Please try again.');
        return;
      }

      // Refresh profile context
      await refreshProfile();

      router.push('/onboarding/lifestyle');
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (dropdown) => {
    setShowDropdowns(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  const selectOption = (dropdown, value) => {
    setFormData(prev => ({
      ...prev,
      [dropdown]: value,
      // Reset LGA when state changes
      ...(dropdown === 'state' && { lga: '' })
    }));
    setShowDropdowns(prev => ({
      ...prev,
      [dropdown]: false
    }));
  };

  const renderDropdown = (title, options, selectedValue, onSelect, errorKey, dropdownKey) => (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>{title}</Text>
      <TouchableOpacity 
        style={[styles.dropdownButton, errors[errorKey] && styles.dropdownButtonError]}
        onPress={() => toggleDropdown(dropdownKey)}
      >
        <Text style={[styles.dropdownButtonText, !selectedValue && styles.dropdownPlaceholder]}>
          {selectedValue || `Select ${title}`}
        </Text>
        <ChevronDown size={20} color="#9CA3AF" />
      </TouchableOpacity>
      
      {showDropdowns[dropdownKey] && (
        <View style={styles.dropdownList}>
          <ScrollView style={styles.dropdownScroll} nestedScrollEnabled showsVerticalScrollIndicator={true}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.dropdownOption}
                onPress={() => selectOption(dropdownKey, option)}
              >
                <Text style={styles.dropdownOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {errors[errorKey] && <Text style={styles.errorText}>{errors[errorKey]}</Text>}
    </View>
  );

  const renderSelector = (title, options, selectedValue, onSelect, errorKey) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>{title}</Text>
      <View style={styles.optionsGrid}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              selectedValue === option && styles.optionButtonSelected
            ]}
            onPress={() => onSelect(option)}
          >
            <Text style={[
              styles.optionText,
              selectedValue === option && styles.optionTextSelected
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors[errorKey] && <Text style={styles.errorText}>{errors[errorKey]}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <View style={styles.progress}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
          </View>
          <Text style={styles.title}>Basic Information</Text>
          <Text style={styles.subtitle}>Tell us a bit about yourself</Text>
        </View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.form}>
          {/* Age */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Age</Text>
            <View style={styles.inputWrapper}>
              <Calendar size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your age"
                value={formData.age}
                onChangeText={(text) => setFormData({...formData, age: text})}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
                editable={!loading}
              />
            </View>
            {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
          </View>

          {/* Gender */}
          {renderSelector(
            'Gender',
            GENDERS,
            formData.gender,
            (value) => setFormData({...formData, gender: value}),
            'gender'
          )}

          {/* Occupation */}
          {renderDropdown(
            'Occupation',
            OCCUPATIONS,
            formData.occupation,
            (value) => setFormData({...formData, occupation: value}),
            'occupation',
            'occupation'
          )}

          {/* School State (if Student) */}
          {formData.occupation === 'Student' && renderDropdown(
            'State of School',
            NIGERIAN_STATES,
            formData.schoolState,
            (value) => setFormData({...formData, schoolState: value}),
            'schoolState',
            'schoolState'
          )}

          {/* Location Options */}
          <View style={styles.selectorContainer}>
            <Text style={styles.selectorTitle}>Location</Text>
            <TouchableOpacity 
              style={[
                styles.locationOption,
                formData.locationOption === 'gps' && styles.locationOptionSelected
              ]}
              onPress={() => setFormData({...formData, locationOption: 'gps', currentLocation: ''})}
            >
              <MapPin size={20} color={formData.locationOption === 'gps' ? '#FF6B6B' : '#6B7280'} />
              <View style={styles.locationOptionContent}>
                <Text style={[
                  styles.locationOptionText,
                  formData.locationOption === 'gps' && styles.locationOptionTextSelected
                ]}>
                  Use GPS Location
                </Text>
                {formData.locationOption === 'gps' && formData.currentLocation && (
                  <Text style={styles.currentLocationText}>{formData.currentLocation}</Text>
                )}
                {formData.locationOption === 'gps' && locationLoading && (
                  <Text style={styles.loadingText}>Getting location...</Text>
                )}
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.locationOption,
                formData.locationOption === 'manual' && styles.locationOptionSelected
              ]}
              onPress={() => setFormData({...formData, locationOption: 'manual'})}
            >
              <User size={20} color={formData.locationOption === 'manual' ? '#FF6B6B' : '#6B7280'} />
              <Text style={[
                styles.locationOptionText,
                formData.locationOption === 'manual' && styles.locationOptionTextSelected
              ]}>
                Select Manually
              </Text>
            </TouchableOpacity>
          </View>

          {/* Manual Location Selection */}
          {formData.locationOption === 'manual' && (
            <>
              {renderDropdown(
                'State',
                NIGERIAN_STATES,
                formData.state,
                (value) => setFormData({...formData, state: value}),
                'state',
                'state'
              )}
              
              {formData.state && LGAS[formData.state] && renderDropdown(
                'Local Government Area',
                LGAS[formData.state] || [],
                formData.lga,
                (value) => setFormData({...formData, lga: value}),
                'lga',
                'lga'
              )}
            </>
          )}

          {/* Continue Button */}
          <TouchableOpacity 
            style={[styles.continueButton, loading && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={loading}
          >
            <Text style={styles.continueButtonText}>
              {loading ? 'Saving...' : 'Continue'}
            </Text>
            <ArrowRight size={20} color="white" style={styles.buttonIcon} />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#FF6B6B',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    paddingHorizontal: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  dropdownContainer: {
    marginBottom: 24,
    position: 'relative',
    zIndex: 1,
  },
  dropdownLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  dropdownButtonError: {
    borderColor: '#EF4444',
  },
  dropdownButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
  selectorContainer: {
    marginBottom: 24,
  },
  selectorTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  optionButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    marginRight: 12,
    marginBottom: 12,
    minWidth: '45%',
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: 'white',
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  locationOptionSelected: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FEF2F2',
  },
  locationOptionContent: {
    flex: 1,
    marginLeft: 12,
  },
  locationOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  locationOptionTextSelected: {
    color: '#FF6B6B',
  },
  currentLocationText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#10B981',
    marginTop: 2,
  },
  loadingText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#F59E0B',
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    marginTop: 4,
  },
  continueButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});