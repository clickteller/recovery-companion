import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Save daily tracking entry
export const saveDailyEntry = async (userId, entryData) => {
  try {
    const dailyEntriesRef = collection(db, 'dailyEntries');
    
    const entry = {
      userId,
      ...entryData,
      photos: entryData.photos || [], // Array of photo URLs
      createdAt: serverTimestamp(),
      date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    };

    const docRef = await addDoc(dailyEntriesRef, entry);
    console.log('✅ Daily entry saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving daily entry:', error);
    throw error;
  }
};

// Get today's entry for user
export const getTodayEntry = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const dailyEntriesRef = collection(db, 'dailyEntries');
    
    const q = query(
      dailyEntriesRef,
      where('userId', '==', userId),
      where('date', '==', today)
    );

    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching today entry:', error);
    throw error;
  }
};

// Get recent entries (last 7 days)
export const getRecentEntries = async (userId, limit = 7) => {
  try {
    const dailyEntriesRef = collection(db, 'dailyEntries');
    
    // Simple query without orderBy to avoid index requirement
    const q = query(
      dailyEntriesRef,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const entries = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({ 
        id: doc.id, 
        ...data,
        // Convert Firestore timestamp to sortable format
        sortDate: data.createdAt?.toDate?.() || new Date(data.date)
      });
    });

    // Sort in JavaScript instead of Firestore
    entries.sort((a, b) => b.sortDate - a.sortDate);

    return entries.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent entries:', error);
    throw error;
  }
};