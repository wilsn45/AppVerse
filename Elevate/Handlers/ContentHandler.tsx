import firestore from '@react-native-firebase/firestore';
import { CategoryHandler } from './CategoryHandler';
import { CourseData, ChapterData } from '../Data/DataModel';

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
                doc.data().thumbnail,
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

  static async fetchChapters(courseId, categoryId) {
    try {

        console.log("courseId", courseId)
        console.log("categoryId", categoryId)
      const docSnap = await firestore()
        .collection('Courses')
        .doc('Doc')
        .collection(categoryId)
        .doc(courseId)
        .get();

  
      if (!docSnap.exists) {
        console.warn('Course document does not exist.');
        return [];
      }
  
      const data = docSnap.data();
      const chapterArray = data.list || []; // Replace 'list' with your actual array field key
  
      const chapters = chapterArray.map(item => new ChapterData(
        item.id,
        item.title,
        item.description,
        item.thumbnail,
        item.index,
        item.isLive
      ));
  
      return chapters;
  
    } catch (error) {
      console.error('Error fetching chapters:', error);
      return [];
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

static async fetchChapter(chapterId) {
  try {
      // Fetch category list from Home collection

      console.log("fetchChapter", chapterId)


      const chapterDocSnapshot = await firestore()
      .collection('Chapters')
      .doc(chapterId)
      .get();

      //console.log("Fetched Content data", contetnDocSnapshot.data())

      if (chapterDocSnapshot.exists) { 
          return chapterDocSnapshot.data()
      }
      else {
          return null
      }

  } catch (error) {
      console.error('Error fetching data:', error);
      return null
  } 
}

}