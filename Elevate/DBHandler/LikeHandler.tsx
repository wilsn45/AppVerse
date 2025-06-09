import AsyncStorage from '@react-native-async-storage/async-storage';

export class LikeHandler {
  // Helper function to get the current saved items from AsyncStorage

  static STORAGE_KEY = 'LIKED_CARD';

  static async getLikes() {
    try {
      const likedItems = await AsyncStorage.getItem(this.STORAGE_KEY);
      return likedItems ? JSON.parse(likedItems) : {};
    } catch (error) {
      console.error('Error retrieving likedItems', error);
      return {};
    }
  }

  // Get saved cards (contentId, categoryId, and contentTitle)
  static async getLikedCards() {
    const likedItems = await this.getLikes();
    const cards = [];

    // Loop through all categories to gather the saved cards
    Object.keys(likedItems).forEach(categoryId => {
        likedItems[categoryId].forEach((likedCard) => {
        // Push contentId, categoryId, and contentTitle
        cards.push({
          categoryId,
          id: likedCard.id,
          contentTitle: likedCard.contentTitle,
        });
      });
    });

    return cards;
  }

  static async getLikedCardByCategory(categoryId) {
    const likedItems = await this.getLikes();
    return likedItems[categoryId];
  }

  // Add save
  static async addLike(categoryId, id, contentTitle) {
    const likedItems = await this.getLikes();
    if (!likedItems[categoryId]) {likedItems[categoryId] = [];}
    likedItems[categoryId].push({ id, contentTitle }); // Save both contentId and contentTitle
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(likedItems));
  }

  // Remove save
  static async removeLike(categoryId, id) {
    const likedItems = await this.getLikes();
    if (likedItems[categoryId]) {
      likedItems[categoryId] = likedItems[categoryId].filter((card) => card.id !== id);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(likedItems));
    }
  }

  static async isCardLiked(categoryId, id) {
    const savedItems = await this.getLikes();
    return savedItems[categoryId]?.some((card) => card.id === id) || false;
  }
}
