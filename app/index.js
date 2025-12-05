import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { signOut } from 'firebase/auth';
import { useRouter, useFocusEffect } from 'expo-router';
import { auth } from '../firebaseConfig';
import { getUserProfile } from '../services/userService';

export default function HomeScreen() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  // Reload profile when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        setLoading(true);
        loadProfile();
      }
    }, [user])
  );

  const loadProfile = async () => {
    try {
      const profile = await getUserProfile(user.uid);
      console.log('Profile loaded:', profile);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  // Calculate days since surgery
  const getDaysSinceSurgery = () => {
    if (!userProfile?.surgeryDate) return 0;
    
    // Parse the date correctly from MM/DD/YYYY format
    const dateParts = userProfile.surgeryDate.split('/');
    if (dateParts.length !== 3) return 0;
    
    const [month, day, year] = dateParts;
    const surgeryDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    const diffTime = Math.abs(today - surgeryDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate recovery progress percentage
  const getRecoveryProgress = () => {
    const daysSince = getDaysSinceSurgery();
    const totalDays = (userProfile?.expectedRecoveryWeeks || 12) * 7;
    const progress = Math.min((daysSince / totalDays) * 100, 100);
    return Math.round(progress);
  };

  const daysSinceSurgery = getDaysSinceSurgery();
  const recoveryProgress = getRecoveryProgress();
  
  // Format surgery date for display
  const getSurgeryDateDisplay = () => {
    if (!userProfile?.surgeryDate) return 'Not set';
    
    const dateParts = userProfile.surgeryDate.split('/');
    if (dateParts.length !== 3) return 'Not set';
    
    const [month, day, year] = dateParts;
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const surgeryDate = getSurgeryDateDisplay();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Hero Section */}
      <View style={styles.heroCard}>
        <View style={styles.progressCircle}>
          <View style={styles.progressCircleInner}>
            <Text style={styles.progressPercent}>{recoveryProgress}%</Text>
            <Text style={styles.progressLabel}>Complete</Text>
          </View>
        </View>
        
        <View style={styles.heroInfo}>
          <Text style={styles.heroDays}>{daysSinceSurgery}</Text>
          <Text style={styles.heroDaysLabel}>Days into Recovery</Text>
          <Text style={styles.heroSubtext}>
            {userProfile?.expectedRecoveryWeeks ? 
              `${userProfile.expectedRecoveryWeeks * 7 - daysSinceSurgery} days remaining` : 
              'Keep going strong! 💪'}
          </Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCardSingle}>
          <Text style={styles.statEmoji}>💪</Text>
          <Text style={styles.statValue}>Keep Going!</Text>
          <Text style={styles.statLabel}>You're doing great</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]} 
            onPress={() => router.push('/daily-tracking')}
          >
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionText}>Daily Check-In</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#2196F3' }]} 
            onPress={() => router.push('/progress')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>View Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#FF9800' }]} 
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#9C27B0' }]} 
            onPress={() => router.push('/exercises')}
          >
            <Text style={styles.actionIcon}>💪</Text>
            <Text style={styles.actionText}>Exercises</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Surgery Info */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Recovery Details</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>🏥</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Surgery Type</Text>
              <Text style={styles.infoValue}>{userProfile?.surgeryType || 'Not set'}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>📅</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Surgery Date</Text>
              <Text style={styles.infoValue}>{surgeryDate}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>⏱️</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Recovery Timeline</Text>
              <Text style={styles.infoValue}>{userProfile?.expectedRecoveryWeeks || 0} weeks</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Doctor Info */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Healthcare Provider</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>👨‍⚕️</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Doctor</Text>
              <Text style={styles.infoValue}>{userProfile?.doctorInfo?.name || 'Not set'}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>🏥</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Clinic</Text>
              <Text style={styles.infoValue}>{userProfile?.doctorInfo?.clinic || 'Not set'}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>📞</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{userProfile?.doctorInfo?.phone || 'Not set'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Motivational Message */}
      <View style={styles.motivationCard}>
        <Text style={styles.motivationEmoji}>💪</Text>
        <Text style={styles.motivationText}>
          "Every day is progress. Stay consistent with your recovery!"
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 14,
    color: '#666',
  },
  signOutButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#f44336',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  signOutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  heroCard: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  progressCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  progressCircleInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  progressLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  heroInfo: {
    flex: 1,
  },
  heroDays: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  heroDaysLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 5,
  },
  heroSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCardSingle: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
  },
  actionsSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  actionButton: {
    width: '47%',
    margin: '1.5%',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoIconText: {
    fontSize: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 15,
  },
  motivationCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  motivationEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  motivationText: {
    fontSize: 15,
    color: '#E65100',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
});