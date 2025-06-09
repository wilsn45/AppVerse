// src/network/AuthHelper.ts
import auth from '@react-native-firebase/auth';

export async function getFirebaseAuthToken(): Promise<string | null> {
  const currentUser = auth().currentUser;

  if (!currentUser) {
    console.error('User is not signed in');
    return null;
  }

  try {
    return await currentUser.getIdToken(true); // force refresh
  } catch (error) {
    console.error('Error getting Firebase ID token:', error);
    return null;
  }
}
