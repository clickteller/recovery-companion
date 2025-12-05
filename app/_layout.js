import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import { getUserProfile } from '../services/userService';

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  // Function to refresh profile
  const refreshProfile = async (userId) => {
    try {
      console.log('🔄 Refreshing profile...');
      const profile = await getUserProfile(userId);
      console.log('📋 Profile refreshed:', profile ? `profileComplete=${profile.profileComplete}` : 'null');
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error('❌ Error refreshing profile:', error);
      return null;
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 Auth state changed:', user?.email || 'logged out');
      setUser(user);
      
      if (user) {
        await refreshProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Refresh profile when navigating to home from onboarding
  useEffect(() => {
    if (user && pathname === '/' && userProfile && !userProfile.profileComplete) {
      console.log('🔄 On home page - checking if profile needs refresh...');
      refreshProfile(user.uid);
    }
  }, [pathname]);

  // Handle navigation
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login';
    const inOnboarding = segments[0] === 'onboarding';
    const inDailyTracking = segments[0] === 'daily-tracking';

    console.log('🧭 Navigation check:', { 
      hasUser: !!user, 
      profileComplete: userProfile?.profileComplete,
      currentRoute: segments[0] || 'index'
    });

    // Priority 1: Not logged in → login
    if (!user && !inAuthGroup) {
      console.log('➡️  Redirecting to login (no user)');
      router.replace('/login');
      return;
    }

    // Priority 2: Logged in but no profile data yet → wait
    if (user && userProfile === null && !inAuthGroup) {
      console.log('⏳ Waiting for profile data...');
      return;
    }

    // Priority 3: Profile incomplete → onboarding
    if (user && userProfile && userProfile.profileComplete === false && !inOnboarding) {
      console.log('➡️  Redirecting to onboarding (profile incomplete)');
      router.replace('/onboarding');
      return;
    }

    // Priority 4: Profile complete but on auth/onboarding screens → home
    if (user && userProfile && userProfile.profileComplete === true && (inAuthGroup || inOnboarding)) {
      console.log('➡️  Redirecting to home (profile complete)');
      router.replace('/');
      return;
    }

    // Allow navigation to daily tracking if profile is complete
    if (user && userProfile && userProfile.profileComplete === true && inDailyTracking) {
      console.log('✅ Staying on daily tracking');
      return;
    }

    console.log('✅ Navigation OK - staying on current route');
  }, [user, userProfile, segments, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="daily-tracking" />
      <Stack.Screen name="progress" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="edit-surgery" />
      <Stack.Screen name="edit-doctor" />
    </Stack>
  );
}