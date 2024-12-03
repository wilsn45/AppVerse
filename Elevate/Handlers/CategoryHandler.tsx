import AsyncStorage from '@react-native-async-storage/async-storage';

export class CategoryHandler {
  // Define the key for storing live categories in AsyncStorage
  static LIVE_CATEGORY_STORAGE_KEY = 'LIVE_CATEGORY';

  // Helper function to get the current saved categories from AsyncStorage
  static async getCategories() {
    try {
      const categories = await AsyncStorage.getItem(this.LIVE_CATEGORY_STORAGE_KEY);
      return categories ? JSON.parse(categories) : [];
    } catch (error) {
      console.error('Error retrieving categories', error);
      return [];
    }
  }

  // Get the live categories from AsyncStorage
  static async getLiveCategory() {
    return await this.getCategories();
  }

  // Add or update categories in AsyncStorage
  static async setLiveCategory(categories) {
    try {
      // Ensure the categories are an array
      if (Array.isArray(categories)) {
        await AsyncStorage.setItem(this.LIVE_CATEGORY_STORAGE_KEY, JSON.stringify(categories));
        console.log('Categories have been saved successfully.');
      } else {
        throw new Error('Input must be an array of categories.');
      }
    } catch (error) {
      console.error('Error saving categories:', error.message);
    }
  }

}
