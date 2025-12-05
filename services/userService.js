import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const createUserDocument = async (user) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      const newUserData = {
        email: user.email,
        displayName: user.displayName || '',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        profileComplete: false,
        photoURL: user.photoURL || ''
      };
      
      await setDoc(userRef, newUserData);
      console.log('✅ User document created');
      
      // Return the data we just created (don't rely on Firestore read)
      return { isNewUser: true, userData: { ...newUserData, profileComplete: false } };
    } else {
      await setDoc(userRef, {
        lastLogin: serverTimestamp()
      }, { merge: true });
      console.log('✅ User login timestamp updated');
      return { isNewUser: false, userData: userSnap.data() };
    }
  } catch (error) {
    console.error('❌ Error creating/updating user document:', error);
    throw error;
  }
};

export const getUserProfile = async (userId, retries = 3) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      console.log('✅ Profile fetched:', { profileComplete: data.profileComplete });
      return data;
    } else {
      if (retries > 0) {
        console.log(`⏳ User profile not found, retrying... (${retries} left)`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return getUserProfile(userId, retries - 1);
      }
      console.log('❌ No user profile found after retries');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateProfileComplete = async (userId, isComplete) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      profileComplete: isComplete
    }, { merge: true });
    console.log('✅ Profile completion status updated');
  } catch (error) {
    console.error('Error updating profile status:', error);
    throw error;
  }
};

export const saveOnboardingData = async (userId, onboardingData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...onboardingData,
      profileComplete: true,
      onboardingCompletedAt: serverTimestamp()
    }, { merge: true });
    console.log('✅ Onboarding data saved, profileComplete set to true');
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    throw error;
  }
};

// Update surgery information
export const updateSurgeryInfo = async (userId, surgeryData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      surgeryType: surgeryData.surgeryType,
      surgeryDate: surgeryData.surgeryDate,
      expectedRecoveryWeeks: surgeryData.expectedRecoveryWeeks,
      updatedAt: serverTimestamp()
    });
    console.log('✅ Surgery info updated');
  } catch (error) {
    console.error('❌ Error updating surgery info:', error);
    throw error;
  }
};

// Update doctor information
export const updateDoctorInfo = async (userId, doctorData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      doctorInfo: {
        name: doctorData.name,
        clinic: doctorData.clinic,
        phone: doctorData.phone
      },
      updatedAt: serverTimestamp()
    });
    console.log('✅ Doctor info updated');
  } catch (error) {
    console.error('❌ Error updating doctor info:', error);
    throw error;
  }
};