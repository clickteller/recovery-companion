import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bodyAreas, exercises } from '../services/exerciseData';

const { width, height } = Dimensions.get('window');

export default function ExerciseListScreen() {
  const router = useRouter();
  const { area } = useLocalSearchParams();
  const [completedExercises, setCompletedExercises] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const bodyArea = bodyAreas.find((a) => a.id === area);
  const exerciseList = exercises[area] || [];

  useEffect(() => {
    loadCompletedExercises();
  }, []);

  const loadCompletedExercises = async () => {
    try {
      const completed = await AsyncStorage.getItem('completedExercises');
      if (completed) {
        setCompletedExercises(JSON.parse(completed));
      }
    } catch (error) {
      console.error('Error loading completed exercises:', error);
    }
  };

  const toggleComplete = async (exerciseId) => {
    let updated;
    if (completedExercises.includes(exerciseId)) {
      updated = completedExercises.filter((id) => id !== exerciseId);
    } else {
      updated = [...completedExercises, exerciseId];
    }
    setCompletedExercises(updated);
    await AsyncStorage.setItem('completedExercises', JSON.stringify(updated));
  };

  const openVideo = (exercise) => {
    setSelectedVideo(exercise);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: bodyArea?.color || '#9C27B0' }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{bodyArea?.emoji} {bodyArea?.name}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Your Progress</Text>
          <Text style={styles.progressText}>
            {completedExercises.filter((id) => exerciseList.some((ex) => ex.id === id)).length} / {exerciseList.length} exercises completed
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Exercises ({exerciseList.length})</Text>

        {exerciseList.map((exercise, index) => {
          const isCompleted = completedExercises.includes(exercise.id);
          return (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                  <View style={styles.exerciseMeta}>
                    <Text style={styles.metaItem}>⏱️ {exercise.duration}</Text>
                    <Text style={styles.metaItem}>
                      📊 {exercise.difficulty}
                    </Text>
                  </View>
                  <Text style={styles.sets}>{exercise.sets}</Text>
                </View>
              </View>

              <View style={styles.exerciseActions}>
                <TouchableOpacity
                  style={styles.videoButton}
                  onPress={() => openVideo(exercise)}
                >
                  <Text style={styles.videoButtonText}>▶️ Watch Video</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.completeButton,
                    isCompleted && styles.completeButtonActive,
                  ]}
                  onPress={() => toggleComplete(exercise.id)}
                >
                  <Text
                    style={[
                      styles.completeButtonText,
                      isCompleted && styles.completeButtonTextActive,
                    ]}
                  >
                    {isCompleted ? '✓ Completed' : 'Mark Complete'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Video Modal */}
      <Modal
        visible={!!selectedVideo}
        animationType="slide"
        onRequestClose={closeVideo}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedVideo?.name}</Text>
            <TouchableOpacity onPress={closeVideo} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕ Close</Text>
            </TouchableOpacity>
          </View>
          
          {selectedVideo && (
            <WebView
              style={styles.video}
              source={{
                uri: `https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`,
              }}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
            />
          )}

          <View style={styles.videoInfo}>
            <Text style={styles.videoDescription}>{selectedVideo?.description}</Text>
            <Text style={styles.videoSets}>📋 {selectedVideo?.sets}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  progressCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  exerciseNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  exerciseNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  exerciseMeta: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  metaItem: {
    fontSize: 13,
    color: '#999',
    marginRight: 15,
  },
  sets: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: 10,
  },
  videoButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  videoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  completeButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  completeButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  completeButtonTextActive: {
    color: '#fff',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1a1a1a',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  closeButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  video: {
    width: width,
    height: width * 0.5625, // 16:9 aspect ratio
    backgroundColor: '#000',
  },
  videoInfo: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    flex: 1,
  },
  videoDescription: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
    lineHeight: 24,
  },
  videoSets: {
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: '600',
  },
});