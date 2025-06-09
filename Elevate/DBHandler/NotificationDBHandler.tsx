import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationData } from '../Data/DataModel';

export class NotificationDBHandler {
  static STORAGE_KEY = 'NEW_NOTIFICATION';

  // Get all saved courses
  static async getNotificationCourse(): Promise<NotificationData[]> {
    try {
      const notifications = await AsyncStorage.getItem(this.STORAGE_KEY);
      return notifications
        ? (JSON.parse(notifications) as NotificationData[])
        : [];
    } catch (error) {
      console.error('Error retrieving saved notification course data:', error);
      return [];
    }
  }

  static async getFilteredNotificationCourse(): Promise<NotificationData[]> {
  try {
    const notifications = await AsyncStorage.getItem(this.STORAGE_KEY);
    const allNotifications = notifications
      ? (JSON.parse(notifications) as NotificationData[])
      : [];

   const filteredList = allNotifications.filter(n => (n.viewCounter ?? 0) <= 2);

    return filteredList;
  } catch (error) {
    console.error('Error retrieving filtered notification course data:', error);
    return [];
  }
}


  // Save array of NotificationData
  static async saveNewNotificationCourses(newItems: NotificationData[]): Promise<void> {
  try {
    const existing = await this.getNotificationCourse();
    const existingNotificationIds = new Set(existing.map(n => n.id)); // Check by notification id

    // Filter out new notifications that already exist
    const newNotifications = newItems.filter(item => !existingNotificationIds.has(item.id));

    const updatedList = [...existing, ...newNotifications];
    console.log('Saving new notification courses:', updatedList);

    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedList));
  } catch (error) {
    console.error('Error saving new notification course data:', error);
  }
}

  static async incrementViewCounters(): Promise<void> {
    try {
      const existing = await this.getNotificationCourse();

      const updated = existing.map(n => ({
        ...n,
        viewCounter: (n.viewCounter || 0) + 1,
      }));

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error incrementing view counters:', error);
    }
  }



}
