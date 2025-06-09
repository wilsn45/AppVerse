// NotificationAPIClient.ts
import { APIClient } from './Network/APIClient';
import { NotificationDBHandler } from '../DBHandler/NotificationDBHandler';
import { NotificationData } from '../Data/DataModel';

export class NotificationAPIClient {
  static async fetchNewNotifications() {
    const result = await APIClient.get<{ success: boolean; notifications: any[] }>('/notifications');

    if (!result || !result.success) return;

    const notificationList = result.notifications.map((doc: any) =>
      new NotificationData(doc.id, doc.courseId, doc.timestamp)
    );

    console.log('Fetched notifications:', notificationList);
    await NotificationDBHandler.saveNewNotificationCourses(notificationList);
  }
}
