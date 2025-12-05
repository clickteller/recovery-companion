import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { bodyAreas } from '../services/exerciseData';

export default function ExercisesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exercise Program</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>💪 Recovery Exercises</Text>
          <Text style={styles.introText}>
            Select the body area you need to work on. Each area includes guided exercises with video demonstrations.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Select Body Area</Text>

        <View style={styles.grid}>
          {bodyAreas.map((area) => (
            <TouchableOpacity
              key={area.id}
              style={[styles.areaCard, { backgroundColor: area.color }]}
              onPress={() => router.push(`/exercise-list?area=${area.id}`)}
            >
              <Text style={styles.areaEmoji}>{area.emoji}</Text>
              <Text style={styles.areaName}>{area.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Exercise Tips</Text>
          <Text style={styles.tipsText}>
            • Start slowly and increase intensity gradually{'\n'}
            • Stop if you feel sharp pain{'\n'}
            • Consistency is key to recovery{'\n'}
            • Follow your doctor's recommendations
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    backgroundColor: '#9C27B0',
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
  introSection: {
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
  introTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  introText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  areaCard: {
    width: '47%',
    margin: '1.5%',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  areaEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  areaName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipsSection: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  tipsText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
});