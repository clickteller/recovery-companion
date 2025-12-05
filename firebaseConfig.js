import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// PASTE YOUR FIREBASE CONFIG HERE (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyB87QpbqcMvUTutiqyOK0K5PToc8f02vfE",
  authDomain: "recovery-companion-47f82.firebaseapp.com",
  projectId: "recovery-companion-47f82",
  storageBucket: "recovery-companion-47f82.firebasestorage.app",
  messagingSenderId: "675792727932",
  appId: "1:675792727932:web:7e873181df5a0aa115bef9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { auth, db, storage };
export default app;