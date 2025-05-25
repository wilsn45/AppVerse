import firestore from '@react-native-firebase/firestore';
import { NotificationDBHandler } from '../DBHandler/NotificationDBHandler';
import { NotificationData } from '../Data/DataModel';

export class NotificationAPIClient {
  // Define the key for storing live categories in AsyncStorage
  
  // Helper function to get the current saved categories from AsyncStorage


  static async fetchNewNotifications() {
    try {

      const snapshot = await firestore()
        .collection('Notification')
        .get();

        const notificationList = snapshot.docs.map(doc => 
                new NotificationData(
                  doc.id,
                  doc.data().courseId,
                  doc.data().timestamp,
                )
        );
  
      await NotificationDBHandler.saveNewNotificationCourses(notificationList)
  
    } catch (error) {
      console.error('Error fetching topics:', error);
      return null;
    }
  }
  

}