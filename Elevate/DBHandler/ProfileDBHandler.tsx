// ProfileDBHandler.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

export default class ProfileDBHandler {
  // ✅ Static method to check if user is logged in
  static isUserLoggedIn(): boolean {
    const user = auth().currentUser;
    return user !== null;
  }

  static getCurrentUserId(): string | null {
    const user = auth().currentUser;
    return user ? user.uid : null;
  }

  static async saveProfile(userName: string, isOnboarded: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem('@userName', userName);
      await AsyncStorage.setItem('@isOnboarded', JSON.stringify(isOnboarded));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }

  static async getUserName(): Promise<string> {
    try {
      const userName = await AsyncStorage.getItem('@userName');
      return userName || '';
    } catch (error) {
      console.error('Error fetching user name:', error);
      return '';
    }
  }

  static async getIsOnboarded(): Promise<boolean> {
    try {
      const isOnboarded = await AsyncStorage.getItem('@isOnboarded');
      return isOnboarded ? JSON.parse(isOnboarded) : false;
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      return false;
    }
  }

  static async clearProfile(): Promise<void> {
    try {
      await AsyncStorage.removeItem('@userName');
      await AsyncStorage.removeItem('@isOnboarded');
    } catch (error) {
      console.error('Error clearing profile:', error);
    }
  }
}
