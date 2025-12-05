import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  requestNotificationPermissions,
  scheduleDailyReminder,
  cancelDailyReminder,
  getAllScheduledNotifications
} from '../services/notificationService';

export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    const scheduled = await getAllScheduledNotifications();
    setScheduledCount(scheduled.length);
    setDailyReminderEnabled(scheduled.length > 0);
  };

  const handleEnableNotifications = async (value) => {
    if (value) {
      const granted = await requestNotificationPermissions();
      if (granted) {
        setNotificationsEnabled(true);
        Alert.alert('Success', 'Notifications enabled!');
      } else {
        Alert.alert('Permission Denied', 'Please enable notifications in your device settings.');
      }
    } else {
      setNotificationsEnabled(false);
      setDailyReminderEnabled(false);
      await cancelDailyReminder();
    }
  };

  const handleDailyReminderToggle = async (value) => {
    if (value) {
      if (!notificationsEnabled) {
        const granted = await requestNotificationPermissions();
        if (!granted) {
          Alert.alert('Permission Required', 'Please enable notifications first.');
          return;
        }
        setNotificationsEnabled(true);
      }

      // Schedule at 8 PM by default
      await scheduleDailyReminder(20, 0);
      setDailyReminderEnabled(true);
      Alert.alert('Success', 'Daily reminder set for 8:00 PM');
      checkNotificationStatus();
    } else {
      await cancelDailyReminder();
      setDailyReminderEnabled(false);
      checkNotificationStatus();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Profile</Text>
          
          <TouchableOpacity
            style={styles.editRow}
            onPress={() => router.push('/edit-surgery')}
          >
            <Text style={styles.editLabel}>Edit Surgery Information</Text>
            <Text style={styles.editArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.editRow}
            onPress={() => router.push('/edit-doctor')}
          >
            <Text style={styles.editLabel}>Edit Doctor Information</Text>
            <Text style={styles.editArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notifications</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive reminders for daily check-ins
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleEnableNotifications}
              trackColor={{ false: '#ddd', true: '#2196F3' }}
              thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          {notificationsEnabled && (
            <>
              <View style={styles.divider} />
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Daily Reminder</Text>
                  <Text style={styles.settingDescription}>
                    Get reminded at 8:00 PM every day
                  </Text>
                </View>
                <Switch
                  value={dailyReminderEnabled}
                  onValueChange={handleDailyReminderToggle}
                  trackColor={{ false: '#ddd', true: '#2196F3' }}
                  thumbColor={dailyReminderEnabled ? '#fff' : '#f4f3f4'}
                />
              </View>
            </>
          )}

          {scheduledCount > 0 && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ✅ {scheduledCount} reminder{scheduledCount > 1 ? 's' : ''} active
              </Text>
            </View>
          )}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ About</Text>
          
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Platform</Text>
            <Text style={styles.aboutValue}>{Platform.OS}</Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>💡 Tips</Text>
          <Text style={styles.helpText}>
            • Daily reminders help build consistent tracking habits{'\n'}
            • You can disable notifications anytime{'\n'}
            • Notifications work even when the app is closed
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
  editRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  editLabel: {
    fontSize: 16,
    color: '#333',
  },
  editArrow: {
    fontSize: 20,
    color: '#2196F3',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 15,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  aboutLabel: {
    fontSize: 16,
    color: '#666',
  },
  aboutValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  helpSection: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 10,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});