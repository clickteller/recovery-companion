import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';
import { auth } from '../firebaseConfig';
import { getRecentEntries } from '../services/dailyTrackingService';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const recentEntries = await getRecentEntries(auth.currentUser.uid, 7);
      setEntries(recentEntries.reverse()); // Oldest first for chart
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPainData = () => {
    if (entries.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }]
      };
    }

    const labels = entries.map(entry => {
      const date = new Date(entry.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const data = entries.map(entry => entry.painLevel || 0);

    return {
      labels,
      datasets: [{ data }]
    };
  };

  const getAveragePain = () => {
    if (entries.length === 0) return 0;
    const total = entries.reduce((sum, entry) => sum + (entry.painLevel || 0), 0);
    return (total / entries.length).toFixed(1);
  };

  const getExerciseCompletion = () => {
    if (entries.length === 0) return 0;
    const totalExercises = entries.length * 4; // 4 exercises per day
    const completedExercises = entries.reduce(
      (sum, entry) => sum + (entry.exercisesCompleted?.length || 0),
      0
    );
    return Math.round((completedExercises / totalExercises) * 100);
  };

  const getTotalMedications = () => {
    return entries.filter(entry => entry.medications && entry.medications.trim()).length;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Progress</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>No Data Yet</Text>
            <Text style={styles.emptyText}>
              Start tracking your recovery with daily check-ins to see your progress charts
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => router.push('/daily-tracking')}
            >
              <Text style={styles.startButtonText}>Start First Check-In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Avg Pain</Text>
                <Text style={styles.summaryValue}>{getAveragePain()}</Text>
                <Text style={styles.summaryUnit}>/10</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Exercise</Text>
                <Text style={styles.summaryValue}>{getExerciseCompletion()}%</Text>
                <Text style={styles.summaryUnit}>complete</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Days Tracked</Text>
                <Text style={styles.summaryValue}>{entries.length}</Text>
                <Text style={styles.summaryUnit}>days</Text>
              </View>
            </View>

            {/* Pain Level Chart */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>📉 Pain Level Trend</Text>
              <Text style={styles.chartSubtitle}>Last {entries.length} days</Text>
              
              <LineChart
                data={getPainData()}
                width={screenWidth - 60}
                height={220}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: '#2196F3'
                  }
                }}
                bezier
                style={styles.chart}
              />
              
              <View style={styles.painLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                  <Text style={styles.legendText}>0-3 Mild</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
                  <Text style={styles.legendText}>4-6 Moderate</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#f44336' }]} />
                  <Text style={styles.legendText}>7-10 Severe</Text>
                </View>
              </View>
            </View>

            {/* Recent Entries */}
            <View style={styles.recentCard}>
              <Text style={styles.recentTitle}>📝 Recent Check-Ins</Text>
              
              {entries.slice().reverse().map((entry, index) => (
                <View key={index} style={styles.entryItem}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryDate}>
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Text>
                    <Text style={[
                      styles.entryPain,
                      {
                        color: entry.painLevel <= 3 ? '#4CAF50' :
                               entry.painLevel <= 6 ? '#FF9800' : '#f44336'
                      }
                    ]}>
                      Pain: {entry.painLevel}/10
                    </Text>
                  </View>
                  
                  <View style={styles.entryDetails}>
                    <Text style={styles.entryDetail}>
                      😴 Sleep: {'⭐'.repeat(entry.sleepQuality)}
                    </Text>
                    <Text style={styles.entryDetail}>
                      🏋️ Exercises: {entry.exercisesCompleted?.length || 0}/4
                    </Text>
                  </View>
                  
                  {entry.notes && (
                    <Text style={styles.entryNotes} numberOfLines={2}>
                      💭 {entry.notes}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    padding: 20,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  summaryUnit: {
    fontSize: 12,
    color: '#999',
  },
  chartCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  painLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  recentCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  entryItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 15,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  entryPain: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  entryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  entryDetail: {
    fontSize: 14,
    color: '#666',
  },
  entryNotes: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 5,
  },
});