import AsyncStorage from '@react-native-async-storage/async-storage';

export class HomeHandler {
  // Define the key for storing live categories in AsyncStorage
  static LIVE_HOME_STORAGE_KEY = 'Home';

  // Helper function to get the current saved categories from AsyncStorage
  static async getHomeData() {
    try {
      const homeData = await AsyncStorage.getItem(this.LIVE_HOME_STORAGE_KEY);
      return homeData ? JSON.parse(homeData) : [];
    } catch (error) {
      console.error('Error retrieving categories', error);
      return [];
    }
  }

  // Get the live categories from AsyncStorage
  static async getHome() {
    return await this.getHomeData();
  }

  // Add or update categories in AsyncStorage
  static async setHomeData(home) {
    try {
      await AsyncStorage.setItem(this.LIVE_HOME_STORAGE_KEY, JSON.stringify(home));
      
    } catch (error) {
      console.error('Error saving home data:', error.message);
    }
  }

}
