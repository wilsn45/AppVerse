import firestore from '@react-native-firebase/firestore';
import { CategoryHandler } from './CategoryHandler';
import { CourseData, CategoryData } from '../Data/DataModel';

export class ContentHandler {
  // Define the key for storing live categories in AsyncStorage
  static LIVE_HOME_STORAGE_KEY = 'Home';

  // Helper function to get the current saved categories from AsyncStorage


  static async fetchCourseByCategory(categoryId) {
      try {
          // Fetch category list from Home collection
        const snapshot = await firestore().collection('Courses').doc('List').collection(categoryId).get();
        
        // Map the fetched documents to include doc.id and category name
        const coursesList = snapshot.docs.map(doc => 
            new CourseData(
                doc.id,
                doc.data().index,
                doc.data().title,
                doc.data().description,
                doc.data().categoryId,
                doc.data().categoryTitle,
                doc.data().thumbnailMax,
                doc.data().isLive,
                doc.data().rating,
                doc.data().duration,
            )
        );;

        return coursesList

      } catch (error) {
          console.error('Error fetching data:', error);
          return null
      } 
  }

  static async fetchContent(contentId, categoryId) {
    try {
        // Fetch category list from Home collection
        const contetnDocSnapshot = await firestore()
        .collection('Content')
        .doc('List') 
        .collection(categoryId)
        .doc(contentId)
        .get();

        //console.log("Fetched Content data", contetnDocSnapshot.data())

        if (contetnDocSnapshot.exists) { 
            return contetnDocSnapshot.data()
        }
        else {
            return null
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        return null
    } 
}

static async fetchContentDoc(contentId, categoryId) {
    try {
        // Fetch category list from Home collection
        const contetnDocSnapshot = await firestore()
        .collection('Content')
        .doc('Doc') 
        .collection(categoryId)
        .doc(contentId)
        .get();

        console.log("Fetched Content doc", contetnDocSnapshot.data())

        if (contetnDocSnapshot.exists) { 
            console.log("Fetched data", contetnDocSnapshot.data())
            return contetnDocSnapshot.data()
        } else {
            return null
        }
       

    } catch (error) {
        console.error('Error fetching data:', error);
        return null
    } 
}

}