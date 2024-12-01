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
          contentId: likedCard.contentId,
          contentTitle: likedCard.contentTitle,
        });
      });
    });

    return cards;
  }

  // Add save
  static async addLike(categoryId, contentId, contentTitle) {
    const likedItems = await this.getLikes();
    if (!likedItems[categoryId]) likedItems[categoryId] = [];
    likedItems[categoryId].push({ contentId, contentTitle }); // Save both contentId and contentTitle
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(likedItems));
  }

  // Remove save
  static async removeLike(categoryId, contentId) {
    const likedItems = await this.getLikes();
    if (likedItems[categoryId]) {
      likedItems[categoryId] = likedItems[categoryId].filter((card) => card.contentId !== contentId);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(likedItems));
    }
  }

  static async isCardLiked(categoryId, contentId) {
    const savedItems = await this.getLikes();
    return savedItems[categoryId]?.some((card) => card.contentId === contentId) || false;
  }
}
