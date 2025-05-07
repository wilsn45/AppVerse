import firestore from '@react-native-firebase/firestore';
import { CategoryHandler } from './CategoryHandler';
import { CourseData, ChapterData } from '../Data/DataModel';

export class ContentHandler {
  // Define the key for storing live categories in AsyncStorage
  static LIVE_HOME_STORAGE_KEY = 'Home';

  // Helper function to get the current saved categories from AsyncStorage


  static async fetchCourseByTopic(topic) {
    try {

      const snapshot = await firestore()
        .collection('Courses')
        .where('topic', '==', topic)
        .where('isLive', '==', true)
        .orderBy('rating', 'desc')
        .orderBy('lastUpdatedTimestamp', 'desc')
        .get();
  
      const coursesList = snapshot.docs.map(doc => 
        new CourseData(
          doc.id,
          doc.data().title,
          doc.data().description,
          doc.data().thumbnail,
          doc.data().isLive,
          doc.data().rating,
          doc.data().duration,
          doc.data().topic,
          doc.data().isLiveCourse,
          doc.data().chapterCount
        )
      );
  
      return coursesList;
  
    } catch (error) {
      console.error('Error fetching courses by topic:', error);
      return null;
    }
  }

  static async fetchChapters(courseId) {
    try {
     
      const chapterDocs = await firestore()
        .collection('Courses')
        .doc(courseId)
        .collection('Chapters')
        .where('isLive', '==', true)
        .orderBy('index', 'asc')
        .get();
  
      if (chapterDocs.empty) {
        console.warn(`No chapters found for courseId: ${courseId}`);
        return [];
      }
  
      const chapters = chapterDocs.docs.map(doc => {
        const item = doc.data();
        return new ChapterData(
          doc.id,
          item.title,
          item.description,
          item.thumbnail,
          item.duration,
          item.index,
          item.isLive,
          item.isLastChapter
        );
      });
  
      return chapters;
  
    } catch (error) {
      console.error('Error fetching chapters:', error);
      return [];
    }
  }


static async fetchChapter(chapterId) {
  try {
      // Fetch category list from Home collection
     
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