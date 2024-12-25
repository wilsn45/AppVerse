import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContentData } from '../Data/DataModel';

export class SaveHandler {
  // Helper function to get the current saved items from AsyncStorage

  static STORAGE_KEY = 'SAVED_CARD'; 

  static async getSaves() {
    try {
      const savedItems = await AsyncStorage.getItem(this.STORAGE_KEY);
      return savedItems ? JSON.parse(savedItems) : {};
    } catch (error) {
      console.error('Error retrieving savedItems', error);
      return {};
    }
  }

  // Get saved cards (contentId, categoryId, and contentTitle)
  static async getSavedCards() {
    const savedItems = await this.getSaves();
    console.log("All savedItems", savedItems)
    let cards = [];

    // Loop through all categories to gather the saved cards
    Object.keys(savedItems).forEach(categoryId => {
      cards = savedItems[categoryId]
    });

    return cards;
  }

  // Add save
  static async addSave(item) {
    const savedItems = await this.getSaves();
    console.log("Before Save ", savedItems)
    if (!savedItems[item.categoryId]) savedItems[item.categoryId] = [];
    //console.log("Saving  Item ", item)
    savedItems[item.categoryId].push(item); 
    // console.log("Saved Iten", item)
    // console.log("Saved Iten categoryId", item.categoryId)

    console.log("After Save ", savedItems)
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(savedItems));
  }

  // Remove save
  static async removeSave(categoryId, id) {
    const savedItems = await this.getSaves();
    if (savedItems[categoryId]) {
      savedItems[categoryId] = savedItems[categoryId].filter((card) => card.id !== id);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(savedItems));
    }
  }

  static async isCardSaved(categoryId, id) {
    const savedItems = await this.getSaves();
    return savedItems[categoryId]?.some((card) => card.id === id) || false;
  }
}
