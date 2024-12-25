import firestore from '@react-native-firebase/firestore';
import { CategoryHandler } from './CategoryHandler';
import { ContentData, CategoryData } from '../Data/DataModel';

export class ContentHandler {
  // Define the key for storing live categories in AsyncStorage
  static LIVE_HOME_STORAGE_KEY = 'Home';

  // Helper function to get the current saved categories from AsyncStorage


  static async fetchContentByCategory(categoryId) {
      try {
          // Fetch category list from Home collection
        const snapshot = await firestore().collection('Content').doc('List').collection(categoryId).get();
        
        // Map the fetched documents to include doc.id and category name
        const contentList = snapshot.docs.map(doc => 
            new ContentData(
                doc.id,
                doc.data().index,
                doc.data().title,
                doc.data().description,
                doc.data().categoryId,
                doc.data().categoryTitle,
                doc.data().likeCount,
                doc.data().readMin,
                doc.data().imageUrl,
                doc.data().thumbnail
            )
        );;

        return contentList

      } catch (error) {
          console.error('Error fetching data:', error);
          return null
      } 
  }

}