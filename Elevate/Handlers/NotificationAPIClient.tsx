import firestore from '@react-native-firebase/firestore';
import { NotificationHandler } from './NotificationHandler';

export class NotificationAPIClient {
  // Define the key for storing live categories in AsyncStorage
  
  // Helper function to get the current saved categories from AsyncStorage


  static async fetchNewNotifications() {
    try {

      const snapshot = await firestore()
        .collection('Notification')
        .get();
  
      const notificationList = snapshot.docs.map(doc => 
        doc.id
      );
      await NotificationHandler.saveNewNotificationCourses(notificationList)
  
    } catch (error) {
      console.error('Error fetching topics:', error);
      return null;
    }
  }
  

}