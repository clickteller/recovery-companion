import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  FlatList
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { auth } from '../firebaseConfig';
import { saveOnboardingData } from '../services/userService';

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSurgeryPicker, setShowSurgeryPicker] = useState(false);

  // Form data
  const [surgeryType, setSurgeryType] = useState('Knee Surgery');
  const [surgeryDate, setSurgeryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expectedRecoveryWeeks, setExpectedRecoveryWeeks] = useState('12');
  const [doctorName, setDoctorName] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [doctorClinic, setDoctorClinic] = useState('');
  const [doctorEmail, setDoctorEmail] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');

  const surgeryTypes = [
    'Knee Surgery',
    'Hip Surgery',
    'Back Surgery',
    'Shoulder Surgery',
    'Ankle Surgery',
    'Wrist Surgery',
    'ACL Reconstruction',
    'Rotator Cuff Repair',
    'Spinal Fusion',
    'Other'
  ];

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setSurgeryDate(selectedDate);
    }
  };

  const selectSurgeryType = (type) => {
    setSurgeryType(type);
    setShowSurgeryPicker(false);
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!surgeryType) {
          Alert.alert('Required', 'Please select surgery type');
          return false;
        }
        return true;

      case 2:
        const weeksNum = parseInt(expectedRecoveryWeeks);
        if (!surgeryDate) {
          Alert.alert('Required', 'Please select surgery date');
          return false;
        }
        if (!expectedRecoveryWeeks || weeksNum < 4 || weeksNum > 52) {
          Alert.alert('Invalid', 'Recovery timeline must be between 4-52 weeks');
          return false;
        }
        return true;

      case 3:
        return true;

      case 4:
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      const onboardingData = {
        surgeryType,
        surgeryDate: surgeryDate.toISOString(),
        expectedRecoveryWeeks: parseInt(expectedRecoveryWeeks),
        doctorInfo: {
          name: doctorName.trim(),
          phone: doctorPhone.trim(),
          clinic: doctorClinic.trim(),
          email: doctorEmail.trim() || ''
        },
        insuranceProvider: insuranceProvider.trim()
      };

      console.log('💾 Saving onboarding data...');
      await saveOnboardingData(auth.currentUser.uid, onboardingData);
      console.log('✅ Onboarding saved to Firestore');
      
      // Wait longer for Firestore to fully sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('🏠 Navigating to home...');
      
      // Navigate immediately without alert
      router.replace('/');
      
      // Show alert after navigation
      setTimeout(() => {
        Alert.alert('Success!', 'Your profile is ready');
      }, 500);
      
    } catch (error) {
      console.error('Onboarding error:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What type of surgery or injury?</Text>
            <Text style={styles.stepSubtitle}>Select the option that best describes your situation</Text>
            
            <TouchableOpacity 
              style={styles.selectionButton}
              onPress={() => setShowSurgeryPicker(true)}
            >
              <Text style={styles.selectionButtonText}>{surgeryType}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            <Modal
              visible={showSurgeryPicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowSurgeryPicker(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Surgery Type</Text>
                    <TouchableOpacity onPress={() => setShowSurgeryPicker(false)}>
                      <Text style={styles.modalClose}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={surgeryTypes}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.modalItem,
                          item === surgeryType && styles.modalItemSelected
                        ]}
                        onPress={() => selectSurgeryType(item)}
                      >
                        <Text style={[
                          styles.modalItemText,
                          item === surgeryType && styles.modalItemTextSelected
                        ]}>
                          {item}
                        </Text>
                        {item === surgeryType && (
                          <Text style={styles.checkMark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </Modal>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Surgery Details</Text>
            <Text style={styles.stepSubtitle}>When did you have the surgery?</Text>
            
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                📅 Surgery Date
              </Text>
              <Text style={styles.selectedDateText}>
                {surgeryDate.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
  <Modal
    visible={showDatePicker}
    transparent={true}
    animationType="slide"
    onRequestClose={() => setShowDatePicker(false)}
  >
    <View style={styles.datePickerModalOverlay}>
      <View style={styles.datePickerModalContent}>
        <View style={styles.datePickerHeader}>
          <TouchableOpacity onPress={() => setShowDatePicker(false)}>
            <Text style={styles.datePickerCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.datePickerTitle}>Select Surgery Date</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(false)}>
            <Text style={styles.datePickerDone}>Done</Text>
          </TouchableOpacity>
        </View>
        
        <DateTimePicker
          value={surgeryDate}
          mode="date"
          display="spinner"
          onChange={handleDateChange}
          maximumDate={new Date()}
          textColor="#000000"
          style={styles.datePickerStyle}
        />
      </View>
    </View>
  </Modal>
)}

            <Text style={[styles.stepSubtitle, { marginTop: 30 }]}>
              Expected recovery timeline (weeks)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 12"
              placeholderTextColor="#999"
              value={expectedRecoveryWeeks}
              onChangeText={setExpectedRecoveryWeeks}
              keyboardType="number-pad"
              maxLength={2}
            />
            <Text style={styles.helperText}>Typical range: 4-52 weeks</Text>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Doctor Information</Text>
            <Text style={styles.stepSubtitle}>Your healthcare provider details (optional - you can skip this)</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Doctor's Name (optional)"
              placeholderTextColor="#999"
              value={doctorName}
              onChangeText={setDoctorName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone Number (optional)"
              placeholderTextColor="#999"
              value={doctorPhone}
              onChangeText={setDoctorPhone}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Clinic/Hospital Name (optional)"
              placeholderTextColor="#999"
              value={doctorClinic}
              onChangeText={setDoctorClinic}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email (optional)"
              placeholderTextColor="#999"
              value={doctorEmail}
              onChangeText={setDoctorEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <View style={styles.skipInfo}>
              <Text style={styles.skipInfoText}>💡 You can add this information later in settings</Text>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Insurance & Review</Text>
            <Text style={styles.stepSubtitle}>Insurance provider (optional)</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Insurance Provider (optional)"
              placeholderTextColor="#999"
              value={insuranceProvider}
              onChangeText={setInsuranceProvider}
            />

            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Review Your Information</Text>
              <Text style={styles.summaryText}>Surgery: {surgeryType}</Text>
              <Text style={styles.summaryText}>Date: {surgeryDate.toLocaleDateString()}</Text>
              <Text style={styles.summaryText}>Recovery: {expectedRecoveryWeeks} weeks</Text>
              <Text style={styles.summaryText}>Doctor: {doctorName || 'Not provided'}</Text>
              <Text style={styles.summaryText}>Clinic: {doctorClinic || 'Not provided'}</Text>
              {insuranceProvider ? (
                <Text style={styles.summaryText}>Insurance: {insuranceProvider}</Text>
              ) : null}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile Setup</Text>
        <Text style={styles.headerSubtitle}>Step {currentStep} of 4</Text>
      </View>

      <View style={styles.progressBar}>
        {[1, 2, 3, 4].map((step) => (
          <View
            key={step}
            style={[
              styles.progressDot,
              currentStep >= step && styles.progressDotActive
            ]}
          />
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 1 ? (
          <>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              disabled={loading}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            {currentStep < 4 ? (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                disabled={loading}
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.nextButton, styles.completeButton]}
                onPress={handleComplete}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.nextButtonText}>Complete Setup</Text>
                )}
              </TouchableOpacity>
            )}
          </>
        ) : (
          <TouchableOpacity
            style={styles.nextButtonFull}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ddd',
    marginHorizontal: 8,
  },
  progressDotActive: {
    backgroundColor: '#2196F3',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  selectionButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 8,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  selectionButtonText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  dropdownArrow: {
    fontSize: 16,
    color: '#2196F3',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalItemTextSelected: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  checkMark: {
    fontSize: 20,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
  },
  dateButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#2196F3',
    padding: 18,
    borderRadius: 8,
    marginTop: 10,
  },
  dateButtonText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  selectedDateText: {
    fontSize: 20,
    color: '#1976D2',
    fontWeight: 'bold',
    marginTop: 10,
  },
  helperText: {
    fontSize: 14,
    color: '#999',
    marginTop: -10,
    marginBottom: 10,
  },
  summaryBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  backButton: {
    flex: 1,
    padding: 18,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2196F3',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonFull: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipInfo: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  skipInfoText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
  },
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  datePickerModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  datePickerCancel: {
    fontSize: 16,
    color: '#666',
  },
  datePickerDone: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  datePickerStyle: {
    height: 200,
    backgroundColor: 'white',
  },
});