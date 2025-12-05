import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { storage } from '../firebaseConfig';
import * as ImagePicker from 'expo-image-picker';

// Request camera permissions
export const requestCameraPermission = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
};

// Request photo library permissions
export const requestMediaLibraryPermission = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
};

// Take photo with camera
export const takePhoto = async () => {
  try {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      throw new Error('Camera permission denied');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Error taking photo:', error);
    throw error;
  }
};

// Pick photo from gallery
export const pickPhoto = async () => {
  try {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      throw new Error('Photo library permission denied');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Error picking photo:', error);
    throw error;
  }
};

// Upload photo to Firebase Storage
export const uploadPhoto = async (userId, photoUri, entryDate) => {
  try {
    const response = await fetch(photoUri);
    const blob = await response.blob();
    
    const timestamp = Date.now();
    const filename = `${entryDate}_${timestamp}.jpg`;
    const storageRef = ref(storage, `users/${userId}/photos/${filename}`);
    
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log('✅ Photo uploaded successfully');
    return {
      url: downloadURL,
      filename,
      uploadedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error uploading photo:', error);
    throw error;
  }
};

// Get all photos for a user
export const getUserPhotos = async (userId) => {
  try {
    const photosRef = ref(storage, `users/${userId}/photos`);
    const result = await listAll(photosRef);
    
    const photos = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          url,
          filename: itemRef.name,
          path: itemRef.fullPath
        };
      })
    );
    
    // Sort by filename (which includes date)
    return photos.sort((a, b) => b.filename.localeCompare(a.filename));
  } catch (error) {
    console.error('Error fetching photos:', error);
    throw error;
  }
};

// Delete a photo
export const deletePhoto = async (photoPath) => {
  try {
    const photoRef = ref(storage, photoPath);
    await deleteObject(photoRef);
    console.log('✅ Photo deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting photo:', error);
    throw error;
  }
};