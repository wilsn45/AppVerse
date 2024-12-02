import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const cards = [];

    // Loop through all categories to gather the saved cards
    Object.keys(savedItems).forEach(categoryId => {
      savedItems[categoryId].forEach((savedCard) => {
        // Push contentId, categoryId, and contentTitle
        cards.push({
          categoryId,
          contentId: savedCard.contentId,
          contentTitle: savedCard.contentTitle,
        });
      });
    });

    return cards;
  }

  // Add save
  static async addSave(categoryId, contentId, contentTitle) {
    const savedItems = await this.getSaves();
    if (!savedItems[categoryId]) savedItems[categoryId] = [];
    savedItems[categoryId].push({ contentId, contentTitle }); // Save both contentId and contentTitle
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(savedItems));
  }

  // Remove save
  static async removeSave(categoryId, contentId) {
    const savedItems = await this.getSaves();
    if (savedItems[categoryId]) {
      savedItems[categoryId] = savedItems[categoryId].filter((card) => card.contentId !== contentId);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(savedItems));
    }
  }

  static async isCardSaved(categoryId, contentId) {
    const savedItems = await this.getSaves();
    return savedItems[categoryId]?.some((card) => card.contentId === contentId) || false;
  }
}
