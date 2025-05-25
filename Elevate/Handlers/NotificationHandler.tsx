import AsyncStorage from '@react-native-async-storage/async-storage';

export class NotificationHandler {
  static STORAGE_KEY = 'NEW_NOTIFICATION';

  // Get all saved courses
  static async getNewNotificationCourse(): Promise<string[]> {
  try {
    const notifications = await AsyncStorage.getItem(this.STORAGE_KEY);
    return notifications ? JSON.parse(notifications) as string[] : [];
  } catch (error) {
    console.error('Error retrieving saved notification course IDs:', error);
    return [];
  }
}

static async saveNewNotificationCourses(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(ids));
  } catch (error) {
    console.error('Error saving new notification course IDs:', error);
  }
}

  

}