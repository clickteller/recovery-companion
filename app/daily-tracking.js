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
  Image
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { auth } from '../firebaseConfig';
import { saveDailyEntry } from '../services/dailyTrackingService';
import { takePhoto, pickPhoto, uploadPhoto } from '../services/photoService';

export default function DailyTrackingScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form state
  const [painLevel, setPainLevel] = useState(5);
  const [medications, setMedications] = useState('');
  const [exercises, setExercises] = useState({
    exercise1: false,
    exercise2: false,
    exercise3: false,
    exercise4: false
  });
  const [sleepQuality, setSleepQuality] = useState(3);
  const [mood, setMood] = useState('neutral');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]);

  const moods = [
    { emoji: '😊', value: 'happy', label: 'Happy' },
    { emoji: '😐', value: 'neutral', label: 'Neutral' },
    { emoji: '😞', value: 'sad', label: 'Sad' },
    { emoji: '😢', value: 'pain', label: 'In Pain' },
    { emoji: '😡', value: 'frustrated', label: 'Frustrated' }
  ];

  const getPainColor = (level) => {
    if (level <= 3) return '#4CAF50';
    if (level <= 6) return '#FF9800';
    return '#f44336';
  };

  // Photo handling functions
  const handleTakePhoto = async () => {
    try {
      const photoUri = await takePhoto();
      if (photoUri) {
        setPhotos([...photos, { uri: photoUri, uploaded: false }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please check camera permissions.');
    }
  };

  const handlePickPhoto = async () => {
    try {
      const photoUri = await pickPhoto();
      if (photoUri) {
        setPhotos([...photos, { uri: photoUri, uploaded: false }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick photo. Please check photo library permissions.');
    }
  };

  const handleRemovePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  // Updated handleSave with photo upload
  const handleSave = async () => {
    setLoading(true);
    try {
      // Upload photos first
      const uploadedPhotos = [];
      for (const photo of photos) {
        if (!photo.uploaded) {
          const uploaded = await uploadPhoto(
            auth.currentUser.uid,
            photo.uri,
            new Date().toISOString().split('T')[0]
          );
          uploadedPhotos.push(uploaded);
        }
      }

      const entryData = {
        painLevel,
        medications: medications.trim(),
        exercisesCompleted: Object.keys(exercises).filter(key => exercises[key]),
        sleepQuality,
        mood,
        notes: notes.trim(),
        photos: uploadedPhotos
      };

      await saveDailyEntry(auth.currentUser.uid, entryData);
      
      Alert.alert(
        'Success!', 
        'Daily entry saved successfully',
        [
          { 
            text: 'OK', 
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Check-In</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Pain Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pain Level</Text>
          <View style={styles.painLevelContainer}>
            <Text style={[styles.painLevelNumber, { color: getPainColor(painLevel) }]}>
              {painLevel}
            </Text>
            <Text style={styles.painLevelLabel}>
              {painLevel <= 3 ? 'Mild' : painLevel <= 6 ? 'Moderate' : 'Severe'}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={painLevel}
            onValueChange={setPainLevel}
            minimumTrackTintColor={getPainColor(painLevel)}
            maximumTrackTintColor="#ddd"
            thumbTintColor={getPainColor(painLevel)}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>0 (No Pain)</Text>
            <Text style={styles.sliderLabel}>10 (Worst)</Text>
          </View>
        </View>

        {/* Medications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💊 Medications Taken</Text>
          <TextInput
            style={styles.textArea}
            placeholder="e.g., Ibuprofen 400mg at 9am, Paracetamol 500mg at 2pm"
            placeholderTextColor="#999"
            value={medications}
            onChangeText={setMedications}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Exercises */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏋️ Exercises Completed</Text>
          {Object.keys(exercises).map((key, index) => (
            <TouchableOpacity
              key={key}
              style={styles.checkboxRow}
              onPress={() => setExercises({ ...exercises, [key]: !exercises[key] })}
            >
              <View style={[styles.checkbox, exercises[key] && styles.checkboxChecked]}>
                {exercises[key] && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Exercise {index + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sleep Quality */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>😴 Sleep Quality</Text>
          <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setSleepQuality(star)}
              >
                <Text style={styles.star}>
                  {star <= sleepQuality ? '⭐' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingLabel}>
            {sleepQuality <= 2 ? 'Poor' : sleepQuality <= 3 ? 'Fair' : sleepQuality <= 4 ? 'Good' : 'Excellent'}
          </Text>
        </View>

        {/* Mood */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>😊 How are you feeling?</Text>
          <View style={styles.moodContainer}>
            {moods.map((m) => (
              <TouchableOpacity
                key={m.value}
                style={[
                  styles.moodButton,
                  mood === m.value && styles.moodButtonSelected
                ]}
                onPress={() => setMood(m.value)}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={styles.moodLabel}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Additional Notes</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Any observations, concerns, or progress you'd like to note..."
            placeholderTextColor="#999"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Photos Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📷 Progress Photos</Text>
          <Text style={styles.photoSubtitle}>Track your visual recovery progress</Text>
          
          <View style={styles.photoButtonRow}>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={handleTakePhoto}
            >
              <Text style={styles.photoButtonText}>📸 Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.photoButton}
              onPress={handlePickPhoto}
            >
              <Text style={styles.photoButtonText}>🖼️ Choose Photo</Text>
            </TouchableOpacity>
          </View>

          {photos.length > 0 && (
            <View style={styles.photoPreviewContainer}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoPreviewItem}>
                  <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                  <TouchableOpacity
                    style={styles.photoRemoveButton}
                    onPress={() => handleRemovePhoto(index)}
                  >
                    <Text style={styles.photoRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save Daily Entry</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    color: 'white',
    fontSize: 16,
    width: 60,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  painLevelContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  painLevelNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  painLevelLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#999',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2196F3',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  star: {
    fontSize: 40,
    marginHorizontal: 5,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  moodButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    width: '18%',
  },
  moodButtonSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 5,
  },
  moodLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Photo styles
  photoSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  photoButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  photoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  photoPreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  photoPreviewItem: {
    position: 'relative',
    margin: 5,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  photoRemoveButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#f44336',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoRemoveText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});