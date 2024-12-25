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
    //console.log("All savedItems", savedItems)
    let cards = [];

    // Loop through all categories to gather the saved cards
    Object.keys(savedItems).forEach(categoryId => {
      cards = cards.concat(savedItems[categoryId]);
    });

    //console.log("Fetched saved cards", cards)

    return cards;
  }


  static async getSavedCardByCategory(categoryId) {
    const savedItems = await this.getSaves();
    return savedItems[categoryId]
  }

  // Add save
  static async addSave(item) {
    const savedItems = await this.getSaves();
  
    //console.log("Before Save:", savedItems);
  
    // Remove any existing item with the same ID in the category
    if (savedItems[item.categoryId]) {
      savedItems[item.categoryId] = savedItems[item.categoryId].filter(
        (savedItem) => savedItem.id !== item.id
      );
    }
  
    //console.log("After removing duplicate Save:", savedItems);
  
    // Add the new item to the category
    if (!savedItems[item.categoryId]) {
      savedItems[item.categoryId] = [];
    }
    savedItems[item.categoryId].push(item);
  
    //console.log("After Final Save:", savedItems);
  
    // Save back to AsyncStorage
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
