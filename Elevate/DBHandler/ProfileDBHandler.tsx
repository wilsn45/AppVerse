import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileDBHandler = {
  // Function to save user name and onboarding status
  saveProfile: async (userName, isOnboarded) => {
    try {
      await AsyncStorage.setItem('@userName', userName); // Save the user name
      await AsyncStorage.setItem('@isOnboarded', JSON.stringify(isOnboarded)); // Save the onboarding status
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  },

  // Function to get user name
  getUserName: async () => {
    try {
      const userName = await AsyncStorage.getItem('@userName');
      return userName || ''; // Return empty string if user name is not found
    } catch (error) {
      console.error('Error fetching user name:', error);
      return '';
    }
  },

  // Function to get onboarding status
  getIsOnboarded: async () => {
    try {
      const isOnboarded = await AsyncStorage.getItem('@isOnboarded');
      return isOnboarded ? JSON.parse(isOnboarded) : false; // Default to false if not found
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      return false;
    }
  },

  // Function to clear profile data (for example, on logout)
  clearProfile: async () => {
    try {
      await AsyncStorage.removeItem('@userName');
      await AsyncStorage.removeItem('@isOnboarded');
    } catch (error) {
      console.error('Error clearing profile:', error);
    }
  }
};

export default ProfileDBHandler;
